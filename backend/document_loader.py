import os
from pathlib import Path
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document


BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def load_raw_documents(file_path: Path) -> List[Document]:
    """Load a single file into LangChain Documents."""
    suffix = file_path.suffix.lower()

    if suffix == ".pdf":
        loader = PyPDFLoader(str(file_path))
    elif suffix in {".txt", ".md"}:
        loader = TextLoader(str(file_path), encoding="utf-8")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    docs = loader.load()

    # Ensure basic metadata is present
    for doc in docs:
        doc.metadata.setdefault("source", file_path.name)
        # For text files, there may be no page info
        doc.metadata.setdefault("page", doc.metadata.get("page", 1))

    return docs


def load_and_chunk(file_path: Path) -> List[Document]:
    """Load a document and split it into smaller chunks."""
    raw_docs = load_raw_documents(file_path)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
    )
    chunks = splitter.split_documents(raw_docs)
    return chunks

