import json
import os
from datetime import datetime
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .auth import (
    require_authenticated,
    require_teacher,
    get_current_user,
)
from .database import get_db, User, UserRole
from .document_loader import UPLOADS_DIR, load_and_chunk
from .jwt_utils import create_access_token
from .password_utils import hash_password, verify_password
from .rag import answer_question
from .vector_store import add_documents


BASE_DIR = Path(__file__).resolve().parent
DOCS_META_PATH = BASE_DIR / "documents.json"


load_dotenv()  # Load environment variables from .env if present

app = FastAPI(title="RAG Tutoring System")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "student" or "teacher"


class SignInRequest(BaseModel):
    email: str
    password: str
    role: str  # "student" or "teacher"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class ChatRequest(BaseModel):
    question: str


def _load_documents_meta() -> List[dict]:
    if not DOCS_META_PATH.exists():
        return []
    try:
        with open(DOCS_META_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_documents_meta(docs: List[dict]) -> None:
    with open(DOCS_META_PATH, "w", encoding="utf-8") as f:
        json.dump(docs, f, indent=2)


@app.on_event("startup")
def startup_event():
    # Ensure uploads directory exists
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


# ============== AUTHENTICATION ENDPOINTS ==============

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new student or teacher account."""
    # Validate role
    if request.role not in ["student", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'student' or 'teacher'.",
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    # Validate password
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    # Create new user
    hashed_password = hash_password(request.password)
    new_user = User(
        email=request.email,
        name=request.name,
        hashed_password=hashed_password,
        role=UserRole.STUDENT if request.role == "student" else UserRole.TEACHER,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token = create_access_token(email=new_user.email, role=new_user.role.value)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user={"name": new_user.name, "email": new_user.email, "role": new_user.role.value},
    )


@app.post("/auth/signin", response_model=AuthResponse)
async def signin(request: SignInRequest, db: Session = Depends(get_db)):
    """Login a student or teacher account."""
    # Validate role
    if request.role not in ["student", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'student' or 'teacher'.",
        )

    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify role matches
    expected_role = UserRole.STUDENT if request.role == "student" else UserRole.TEACHER
    if user.role != expected_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"This account is registered as a {user.role.value}, not a {request.role}.",
        )

    # Create access token
    access_token = create_access_token(email=user.email, role=user.role.value)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user={"name": user.name, "email": user.email, "role": user.role.value},
    )


# ============== DOCUMENT ENDPOINTS ==============

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_teacher),
):
    """Upload a document (teacher only)."""
    filename = file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided.",
        )

    suffix = Path(filename).suffix.lower()
    if suffix not in {".pdf", ".txt", ".md"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, TXT, or MD files are supported.",
        )

    # Save uploaded file
    save_path = UPLOADS_DIR / filename
    contents = await file.read()
    save_path.write_bytes(contents)

    # Load and chunk, then add to vector store
    chunks = load_and_chunk(save_path)
    add_documents(chunks)

    # Update documents metadata
    docs_meta = _load_documents_meta()
    docs_meta.append(
        {
            "filename": filename,
            "path": str(save_path),
            "uploaded_at": datetime.utcnow().isoformat() + "Z",
            "type": suffix.lstrip("."),
            "uploaded_by": current_user["email"],
        }
    )
    _save_documents_meta(docs_meta)

    return {"message": "File uploaded and indexed successfully."}


@app.get("/documents")
async def list_documents(current_user: dict = Depends(require_authenticated)):
    """List all uploaded documents (authenticated users only)."""
    docs = _load_documents_meta()
    return docs


# ============== CHAT ENDPOINT ==============

@app.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(require_authenticated),
):
    """Chat with the tutoring system (students and teachers)."""
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question must not be empty.",
        )

    result = answer_question(question)
    return JSONResponse(content=result)

