# RAG Tutoring System

A  **Retrieval-Augmented Generation (RAG)** tutoring app: teachers upload course documents; students ask questions and get answers grounded only in those materials, with citations.

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
.
  AUTHENTICATION.md      # Auth notes / flows
  requirements.txt       # Backend Python deps
  test_endpoints.py      # API smoke tests
  rag_from_scratch_*.py  # RAG experimentation scripts

backend/
  main.py             # FastAPI app + routes
  rag.py              # RAG pipeline (retrieve + generate)
  document_loader.py  # PDF/text loading, chunking
  vector_store.py     # FAISS index helpers
  auth.py             # Teacher token check
  database.py         # SQLite models / session
  jwt_utils.py        # JWT helpers
  password_utils.py   # Password hashing/verify
  documents.json      # Example/seed docs metadata
  users.db            # SQLite DB (created at runtime)
  uploads/            # Uploaded files
  faiss_index/        # FAISS index files

frontend/
  src/
    App.js
    AuthContext.js
    ChatPage.js
    UploadPage.js
    SignIn.js
    SignUp.js
    ForgotPassword.js
    RoleSelection.js
    SelectRole.js
    index.js
    index.css
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
python -m uvicorn backend.main:app --reload --port 8000
```

Notes:

- Use an unprivileged port like `8000` (ports `<1024` such as `800` may fail with `Permission denied` on macOS/Linux).
- If you see `command not found: uvicorn`, it usually means the virtualenv isn’t active; the `python -m uvicorn ...` form above ensures the venv-installed `uvicorn` is used.

**Terminal 2 – Frontend**

```bash
cd frontend && npm start
```

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8000](http://localhost:8000)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Troubleshooting

### ERROR: `[Errno 13] Permission denied`

You likely tried to bind to a privileged port (e.g. `--port 800`). Use `--port 8000` (or any port `>= 1024`).

### ERROR: `[Errno 48] Address already in use`

Something is already running on that port. Either stop the existing process, or choose another port:

```bash
python -m uvicorn backend.main:app --reload --port 8001
```

To find and kill the process using port 8000 (macOS/Linux):

```bash
lsof -i :8000
kill -9 <PID>
```

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
