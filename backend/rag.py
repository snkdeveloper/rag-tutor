from typing import Dict, List

from langchain_core.documents import Document
from langchain_openai import ChatOpenAI

from .vector_store import similarity_search_with_score


PROMPT_TEMPLATE = """You are an AI tutor helping students understand course materials.

Answer the question using ONLY the provided context.

If the answer cannot be found in the context say:
"I cannot find this information in the course materials."

Context:
{context}

Question:
{question}

Provide a clear explanation suitable for a student."""


def _format_context(docs: List[Document]) -> str:
    parts = []
    for doc in docs:
        source = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "unknown")
        parts.append(f"[{source} - page {page}]\n{doc.page_content}")
    return "\n\n---\n\n".join(parts)


def _extract_sources(docs_with_scores) -> List[Dict]:
    sources = []
    for doc, _score in docs_with_scores:
        sources.append(
            {
                "document": doc.metadata.get("source", "unknown"),
                "page": int(doc.metadata.get("page", 1) or 1),
                "snippet": doc.page_content[:300],
            }
        )
    return sources


def answer_question(question: str) -> Dict:
    """Run the full RAG pipeline: retrieve, generate, and return answer + citations."""
    # Retrieve relevant chunks
    docs_with_scores = similarity_search_with_score(question, k=3)
    docs = [doc for doc, _ in docs_with_scores]

    context = _format_context(docs) if docs else ""

    # Build prompt
    prompt = PROMPT_TEMPLATE.format(context=context, question=question)

    # LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    response = llm.invoke(prompt)

    answer_text = response.content if hasattr(response, "content") else str(response)

    return {
        "answer": answer_text,
        "sources": _extract_sources(docs_with_scores),
    }

