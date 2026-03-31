# RAG Tutoring System

A minimal **Retrieval-Augmented Generation (RAG)** tutoring app: teachers upload course documents; students ask questions and get answers grounded only in those materials, with citations.

## Features

- **Teachers**: Upload PDF, TXT, or MD files; view list of uploaded documents. Protected by a simple bearer token.
- **Students**: Chat interface to ask questions; answers are generated from retrieved chunks only, with source citations (document name, page, snippet).

## Tech Stack

| Layer        | Stack                          |
| ------------ | ------------------------------ |
| Frontend     | React, TailwindCSS             |
| Backend      | FastAPI (Python)                |
| RAG          | LangChain, OpenAI API, FAISS   |
| Documents    | PyPDFLoader, TextLoader         |
| Embeddings   | text-embedding-3-small          |
| LLM          | gpt-4o-mini                    |

## Project Structure

```
backend/
  main.py           # FastAPI app, routes
  rag.py            # RAG pipeline (retrieve + generate)
  document_loader.py# PDF/text loading, chunking
  vector_store.py   # FAISS index
  auth.py           # Teacher token check
  uploads/          # Uploaded files (created at runtime)
  faiss_index/      # Vector DB (created on first upload)

frontend/
  src/
    App.js
    UploadPage.js   # Teacher upload UI
    ChatPage.js     # Student chat UI
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

## Setup

### 1. Clone and enter project

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Backend

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copy env and set your keys:

```bash
cp .env.example .env
# Edit .env: OPENAI_API_KEY=sk-...  TEACHER_SECRET=your-secret
```

### 3. Frontend

```bash
cd frontend
npm install
cd ..
```

## Run Locally

**Terminal 1 – Backend**

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 – Frontend**

```bash
cd frontend && npm start
```

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8000](http://localhost:8000)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Variables

| Variable        | Description                    |
| --------------- | ------------------------------ |
| `OPENAI_API_KEY` | OpenAI API key (required)    |
| `TEACHER_SECRET` | Token for uploads (e.g. `teacher123`) |

## API Endpoints

| Method | Path       | Auth     | Description              |
| ------ | ---------- | -------- | ------------------------- |
| POST   | `/upload`  | Bearer   | Upload PDF/TXT/MD (teacher) |
| GET    | `/documents` | None  | List uploaded documents   |
| POST   | `/chat`    | None     | Ask a question (student)  |

Upload requests must include: `Authorization: Bearer <TEACHER_SECRET>`.

## RAG Pipeline

1. **Ingestion**: Document → extract text → split (chunk_size=500, overlap=100) → embed → store in FAISS.
2. **Query**: Question → embed → retrieve top 3 chunks → build prompt with context → call gpt-4o-mini → return answer + sources (document, page, snippet).

## License

MIT 
