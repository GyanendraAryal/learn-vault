from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

COLLECTIN_NAME = "learn_vault"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Load the same embedding model used for your stored chunks.
model = SentenceTransformer(MODEL_NAME)

# Connect to the existing qdrant database
client = QdrantClient(path="qdrant_storage")

def search_chunks(question, limit=5):
    # convert the question into a 348-dimensional vector.
    question_vector = model.encode(
        question,
        normalize_embeddings=True
    ).tolist()

    # find the most similar vectors in qdrant.
    results = client.query_points(
        collection_name=COLLECTIN_NAME,
        query=question_vector,
        limit=limit,
        with_payload=True
    ).points

    if not results:
        print("No matching chunks found.")
        return
    for rank, point in enumerate(results, start=1):
        payload = point.payload or {}

        print(f"\n{"=" * 60}")
        print(f"Result #{rank}")
        print(f"Similarity score: {point.score:.4f}")
        print(f"Video ID: {payload.get("video_id", "Unknown")}")
        print(f"Timestamp: {payload.get("start",0):.1f}s - "
              f"{payload.get("end",0):.1f}s")
        print(f"Text: {payload.get("text", "")}")

if __name__ == "__main__":
    try:
        while True:
            question = input("\nAsk a question (or type 'exit' to quit):").strip()

            if question.lower() in {"exit","quit"}:
                break
            if not question:
                continue
            search_chunks(question)
    finally:
        client.close()
