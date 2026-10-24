import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

# loading enviornment variables
load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent
QDRANT_PATH = PROJECT_ROOT / "qdrant_storage"

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("API key kaha hai bhai")

client = Groq(api_key=api_key)
model = "openai/gpt-oss-120b"
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2",
)
qdrant_client = QdrantClient(path=str(QDRANT_PATH))

COLLECTION_NAME = "learn_vault"


def retrieve_chunks(question, limit=5):

    question_vector = embedding_model.encode(
        question, normalize_embeddings=True
    ).tolist()

    results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=question_vector,
        limit=limit,
        with_payload=True,
    ).points
    return results


def has_configuration_evidence(question, chunks):
    """Check for explicit evidence in database-configuration questions."""

    question_lower = question.lower()

    configuration_terms = {
        "database configuration",
        "database settings",
        "database connection",
        "settings.py",
        "database engine",
    }

    if not any(term in question_lower for term in configuration_terms):
        return True

    evidence_terms = (
        "DATABASES",
        "ENGINE",
        "NAME",
        "HOST",
        "PORT",
        "sqlite",
        "postgresql",
        "mysql",
    )

    for chunk in chunks:
        payload = chunk.payload or {}
        text = payload.get("text", "").lower()

        if any(term.lower() in text for term in evidence_terms):
            return True

    return False


def generate_answer(question):
    chunks = retrieve_chunks(question)

    # Filter out chunks below the relevance threshold.
    MIN_SCORE = 0.45
    chunks = [chunk for chunk in chunks if chunk.score >= MIN_SCORE]

    if not chunks:
        return {
            "answer": (
                "I couldn't find sufficiently relevant course material "
                "to answer confidently."
            ),
            "sources": [],
        }

    if not has_configuration_evidence(question, chunks):
        return {
            "answer": (
                "The retrieved transcripts do not contain clear evidence "
                "for the requested database configuration."
            ),
            "sources": [],
        }

    context_parts = []

    for index, chunk in enumerate(chunks, start=1):
        payload = chunk.payload or {}

        context_parts.append(
            f"Source {index}\n"
            f"Video ID: {payload.get('video_id', 'Unknown')}\n"
            f"Timestamp: {payload.get('start', 0):.1f}s - "
            f"{payload.get('end', 0):.1f}s\n"
            f"Transcript: {payload.get('text', '')}"
        )

    context = "\n\n".join(context_parts)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Learn Vault, an assistant that helps students "
                    "learn Django and Django REST Framework from recorded "
                    "course lectures.\n\n"
                    "RULES:\n"
                    "1. Answer the user's exact question.\n"
                    "2. Evaluate sources for relevance and ignore irrelevant ones.\n"
                    "3. Use retrieved transcripts as the primary source.\n"
                    "4. Never claim the instructor said something unsupported.\n"
                    "5. Transcripts may contain speech-recognition errors; "
                    "do not treat garbled text as reliable evidence.\n"
                    "6. If evidence is insufficient, say so. Do not guess "
                    "what the instructor meant.\n"
                    "7. Clearly label general Django knowledge separately "
                    "from course-supported information.\n"
                    "8. Never invent video IDs, timestamps, or quotations.\n\n"
                    "RESPONSE FORMAT:\n"
                    "- Direct answer.\n"
                    "- Simple explanation.\n"
                    "- Distinguish course evidence from general knowledge.\n"
                    "- Mention limitations when relevant."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Question: {question}\n\n" f"Retrieved course context:\n{context}"
                ),
            },
        ],
        temperature=0.2,
        max_tokens=1200,
    )

    answer = response.choices[0].message.content or ""

    sources = []

    for chunk in chunks:
        payload = chunk.payload or {}
        video_id = payload.get("video_id")

        start = int(payload.get("start", 0))
        end = int(payload.get("end", 0))

        source = {
            "video_id": video_id,
            "start": start,
            "end": end,
            "score": round(float(chunk.score), 4),
            "text": payload.get("text", ""),
            "youtube_url": (
                f"https://www.youtube.com/watch?v={video_id}&t={start}s"
                if video_id
                else None
            ),
        }

        sources.append(source)

    return {
        "answer": answer,
        "sources": sources,
    }


if __name__ == "__main__":
    try:
        while True:
            question = input("\nAsk a Django question (or type 'exit'): ").strip()

            if question.lower() in {"exit", "quit"}:
                break

            if question:
                result = generate_answer(question)

                print("\n" + "=" * 60)
                print("ANSWER")
                print("=" * 60)
                print(result["answer"])

                print("\n" + "=" * 60)
                print("SOURCES")
                print("=" * 60)

                for index, source in enumerate(result["sources"], start=1):
                    print(
                        f"{index}. Source: "
                        f"{source['youtube_url'] or 'Unavailable'}\n"
                        f"   Timestamp: {source['start']}s - "
                        f"{source['end']}s\n"
                        f"   Relevance score: {source['score']}"
                    )
    finally:
        qdrant_client.close()
