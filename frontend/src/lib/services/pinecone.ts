import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | null = null;

function getClient() {
  if (!process.env.PINECONE_API_KEY) return null;
  if (!client) {
    client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return client;
}

export async function upsertEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string>
) {
  const pinecone = getClient();
  const indexName = process.env.PINECONE_INDEX;
  if (!pinecone || !indexName) return;

  const index = pinecone.index(indexName);
  await index.upsert([{ id, values, metadata }]);
}

export async function querySimilar(
  vector: number[],
  topK = 5,
  filter?: Record<string, string>
) {
  const pinecone = getClient();
  const indexName = process.env.PINECONE_INDEX;
  if (!pinecone || !indexName) return [];

  const index = pinecone.index(indexName);
  const result = await index.query({ vector, topK, includeMetadata: true, filter });
  return result.matches ?? [];
}
