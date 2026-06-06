const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  id: string;
  document_id: string;
  filename: string;
  excerpt: string;
  chunk_index: number;
  score: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updated_at?: string;
  message_count?: number;
}

export interface Document {
  id: string;
  filename: string;
  chunk_count: number;
  embedding_status: string;
  created_at?: string;
  size_bytes?: number;
}

export interface Analytics {
  total_documents: number;
  total_chunks: number;
  total_sessions: number;
  total_messages: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp?: string;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  health: () => fetchApi<{ status: string }>("/health"),

  createSession: () =>
    fetchApi<{ session_id: string }>("/api/chat/sessions", { method: "POST" }),

  listSessions: () => fetchApi<ChatSession[]>("/api/chat/sessions"),

  getSession: (id: string) =>
    fetchApi<{ id: string; title: string; messages: Message[] }>(
      `/api/chat/sessions/${id}`
    ),

  deleteSession: (id: string) =>
    fetchApi<{ ok: boolean }>(`/api/chat/sessions/${id}`, { method: "DELETE" }),

  listDocuments: () => fetchApi<Document[]>("/api/documents"),

  searchDocuments: (q: string) =>
    fetchApi<Document[]>(`/api/documents/search?q=${encodeURIComponent(q)}`),

  uploadDocument: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<Document> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.detail || "Upload failed"));
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error")));
      xhr.open("POST", `${API_URL}/api/documents/upload`);
      xhr.send(formData);
    });
  },

  deleteDocument: (id: string) =>
    fetchApi<{ id: string; deleted_chunks: number }>(
      `/api/documents/${id}`,
      { method: "DELETE" }
    ),

  getAnalytics: () => fetchApi<Analytics>("/api/analytics"),

  streamChat: async function* (
    message: string,
    sessionId?: string,
    documentIds?: string[]
  ): AsyncGenerator<{
    type: string;
    content?: string;
    sources?: Source[];
    session_id?: string;
  }> {
    const res = await fetch(`${API_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        document_ids: documentIds,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error("Failed to start chat stream");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            yield JSON.parse(line.slice(6));
          } catch {
            /* skip malformed */
          }
        }
      }
    }
  },
};
