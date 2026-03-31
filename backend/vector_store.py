from pathlib import Path
from typing import List, Optional

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings


BASE_DIR = Path(__file__).resolve().parent
INDEX_DIR = BASE_DIR / "faiss_index"


_vectorstore: Optional[FAISS] = None


def _get_embeddings() -> OpenAIEmbeddings:
    # Use OpenAI's small, inexpensive embedding model
    return OpenAIEmbeddings(model="text-embedding-3-small")


def get_vectorstore() -> FAISS:
    """Load existing FAISS index from disk.

    Raises RuntimeError if the index has not been initialized yet
    (i.e., no documents have been uploaded).
    """
    global _vectorstore

    if _vectorstore is not None:
        return _vectorstore

    if INDEX_DIR.exists():
        _vectorstore = FAISS.load_local(
            folder_path=str(INDEX_DIR),
            embeddings=_get_embeddings(),
            allow_dangerous_deserialization=True,
        )
        return _vectorstore

    raise RuntimeError("Vector store not initialized. Upload a document first.")


def add_documents(docs: List[Document]) -> None:
    """Add new documents to the FAISS index and persist it."""
    global _vectorstore

    if not docs:
        return

    if INDEX_DIR.exists() and _vectorstore is None:
        # Load existing index if present
        _vectorstore = FAISS.load_local(
            folder_path=str(INDEX_DIR),
            embeddings=_get_embeddings(),
            allow_dangerous_deserialization=True,
        )

    if _vectorstore is None:
        # First-time initialization with actual documents
        _vectorstore = FAISS.from_documents(
            documents=docs,
            embedding=_get_embeddings(),
        )
    else:
        _vectorstore.add_documents(docs)

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    _vectorstore.save_local(str(INDEX_DIR))


def similarity_search_with_score(query: str, k: int = 3):
    """Retrieve top-k most similar chunks for a query.

    If the vector store has not been initialized (no documents uploaded yet),
    return an empty list so the RAG pipeline can handle the 'no context' case.
    """
    try:
        vs = get_vectorstore()
    except RuntimeError:
        return []

    return vs.similarity_search_with_score(query, k=k)

