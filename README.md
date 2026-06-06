# TeachAI — AI Teaching Assistant

Production-grade educational assistant powered by **Gemini 2.5 Flash**, **Gemini Embeddings**, a **persistent vector store**, and an advanced **RAG** pipeline.

![Stack](https://img.shields.io/badge/Next.js-15-black)
![Stack](https://img.shields.io/badge/FastAPI-Python-009688)
![Stack](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4)

## Features

- **Landing page** — SaaS-quality marketing site with hero, features, how-it-works, CTA
- **Dashboard** — Sidebar navigation (Chat, Upload, Knowledge Base, Analytics, Settings)
- **Chat** — Streaming SSE, markdown, code copy, citations, sources panel, chat history
- **Upload** — Drag-and-drop PDF with progress and processing status
- **Knowledge Base** — List/search/delete documents with chunk counts
- **Advanced RAG** — Query rewriting, hybrid search (vector + BM25), re-ranking, context compression, conversation memory, metadata filtering, multi-document retrieval, source citations
- **Teaching mode** — Simple explanations, examples, analogies, summaries, quizzes; grounded-only answers

## Project structure

```
ai-teaching-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── api/routes/          # chat, documents, analytics
│   │   ├── services/
│   │   │   ├── rag/             # pipeline, hybrid search, reranker, etc.
│   │   │   ├── chroma_store.py
│   │   │   ├── embeddings.py
│   │   │   └── document_processor.py
│   │   └── utils/               # PDF, chunking, sanitize
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # UI, chat, landing, layout
│       └── lib/api.ts           # API client + streaming
├── .env.example
└── README.md
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google AI API key** — [Get one here](https://aistudio.google.com/apikey)

## Quick start (Windows)

```powershell
cd ai-teaching-assistant
.\scripts\setup.ps1          # installs Python + Node deps
# Edit .env → set GOOGLE_API_KEY=your_key
.\scripts\start.ps1          # opens backend + frontend
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8000  
- **API docs:** http://localhost:8000/docs  

## Manual setup

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set `GOOGLE_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python run.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat/sessions` | Create chat session |
| GET | `/api/chat/sessions` | List sessions |
| GET | `/api/chat/sessions/{id}` | Get session messages |
| DELETE | `/api/chat/sessions/{id}` | Delete session |
| POST | `/api/chat/stream` | Stream chat (SSE) |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/search?q=` | Search documents |
| POST | `/api/documents/upload` | Upload PDF |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/analytics` | Usage analytics |

## RAG pipeline

1. **Upload PDF** → validate file type and size  
2. **Extract text** → PyPDF  
3. **Recursive chunking** → overlapping segments  
4. **Generate embeddings** → Gemini `text-embedding-004`  
5. **Store in ChromaDB** → persistent vector store  
6. **Question answering**:
   - Query rewriting (with conversation context)
   - Hybrid search (vector + BM25 keyword)
   - LLM re-ranking
   - Context compression
   - Gemini 2.5 Flash streaming response with citations

## Security

- PDF-only file validation and size limits  
- Rate limiting on `/health` (extend to other routes in production)  
- Input sanitization (bleach) on chat messages  
- Global exception handler (no stack traces leaked)  
- CORS restricted to configured origins  

## Teaching mode behavior

The assistant explains concepts simply, provides examples and analogies, and can generate quizzes — **only from retrieved context**. If the answer is not in the uploaded material:

> I couldn't find this information in the uploaded material.

## Production notes

- Replace in-memory `ConversationMemory` with Redis or PostgreSQL  
- Add authentication (OAuth/JWT) before deploying publicly  
- Run backend with gunicorn + uvicorn workers  
- Deploy frontend to Vercel; backend to Cloud Run, Railway, or similar  
- Set `CORS_ORIGINS` to your production domain  

## License

MIT
