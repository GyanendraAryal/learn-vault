import os

from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

# loading enviornment variables
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("API key kaha hai bhai")

client = Groq(api_key=api_key)
model = "openai/gpt-oss-120b"
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2",
)
qdrant_client = QdrantClient(path="qdrant_storage")

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

    # Experimental threshold; tune it using test questions.
    MIN_SCORE = 0.45

    chunks = [chunk for chunk in chunks if chunk.score >= MIN_SCORE]
    if not chunks:
        print(
            "I couldn't find sufficiently relevant course material "
            "to answer confidently."
        )
        return

    if not has_configuration_evidence(question, chunks):
        print(
            "The retrieved transcripts do not contain clear evidence "
            "for the requested database configuration."
        )
        return

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

    # Combine all retrieved chunks into one context
    context = "\n\n".join(context_parts)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Learn Vault, an assistant that helps students learn "
                    "Django and Django REST Framework from recorded course lectures.\n\n"
                    "RULES:\n"
                    "1. Answer the user's exact question, not a different question.\n"
                    "2. Evaluate each source for relevance before using it. "
                    "Ignore sources that do not help answer the question.\n"
                    "3. Use retrieved transcripts as the primary source when "
                    "explaining what the course teaches.\n"
                    "4. Never claim that the instructor said something unless "
                    "the provided context supports it.\n"
                    "5. Transcripts may contain speech-recognition errors. "
                    "Do not treat garbled or ambiguous text as reliable evidence.\n"
                    "6. If the relevant evidence is insufficient, explicitly say "
                    "that the available course material is insufficient to answer "
                    "confidently. Do not guess what the instructor meant.\n"
                    "7. You may explain general Django concepts when helpful, "
                    "but clearly label them as general knowledge rather than "
                    "claims from the course.\n"
                    "8. Never invent video IDs, timestamps, quotations, or "
                    "source details.\n\n"
                    "RESPONSE FORMAT:\n"
                    "- Direct answer to the question.\n"
                    "- Explanation in simple language.\n"
                    "- Clearly distinguish lecture-supported information "
                    "from additional general knowledge.\n"
                    "- Mention limitations when the transcripts are unclear.\n"
                    "- Do not invent citations or claim a source supports "
                    "something it does not.\n"
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

    print("\n" + "=" * 60)
    print("ANSWER")
    print("=" * 60)
    print(response.choices[0].message.content)

    print("\n" + "=" * 60)
    print("SOURCES")
    print("=" * 60)

    for index, chunk in enumerate(chunks, start=1):
        payload = chunk.payload or {}

        video_id = payload.get("video_id", "Unknown")
        start = int(payload.get("start", 0))
        end = int(payload.get("end", 0))

        if video_id == "Unknown":
            print(f"{index}. Video ID unavailable")
            continue

        youtube_url = f"https://www.youtube.com/watch?v={video_id}&t={start}s"

        print(
            f"{index}. Source: {youtube_url}\n"
            f"   Timestamp: {start}s - {end}s\n"
            f"   Relevance score: {chunk.score:.4f}"
        )


if __name__ == "__main__":
    try:
        while True:
            question = input("\nAsk a Django question (or type 'exit'): ").strip()

            if question.lower() in {"exit", "quit"}:
                break

            if question:
                generate_answer(question)

    finally:
        qdrant_client.close()
