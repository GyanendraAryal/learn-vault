import json
from pathlib import Path

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
COLLECTION_NAME = "learn_vault"
TOP_K = 5

# Add actual relevant chunk IDs after inspecting your search results.
# Format: (video_id, chunk_index)
RELEVANT_CHUNKS = {
    "What is the difference between serializers and models?": set(),
    "How does token authentication work in DRF?": set(),
    "How does pagination work in DRF?": set(),
    "How does pagination work in DRF?": {
        ("35K5gjFvejk", 5),
        ("35K5gjFvejk", 15),
        ("cHvgiiQUXFE", 17),
    },
}


def main():
    metadata_path = Path("embeddings/metadata.json")

    with metadata_path.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    model = SentenceTransformer(MODEL_NAME)
    client = QdrantClient(path="qdrant_storage")

    try:
        for question, relevant_ids in RELEVANT_CHUNKS.items():
            vector = model.encode(
                question,
                normalize_embeddings=True,
            ).tolist()

            results = client.query_points(
                collection_name=COLLECTION_NAME,
                query=vector,
                limit=TOP_K,
                with_payload=True,
            ).points

            retrieved_ids = set()

            print("\n" + "=" * 65)
            print(f"Question: {question}")

            for rank, result in enumerate(results, start=1):
                payload = result.payload or {}
                chunk_id = (
                    payload.get("video_id"),
                    payload.get("chunk_index"),
                )
                retrieved_ids.add(chunk_id)

                print(f"{rank}. {chunk_id} | " f"Score: {result.score:.4f}")
                print(payload.get("text", "")[:200].replace("\n", " "))

            if not relevant_ids:
                print("Recall@5: Not calculated — label relevant chunks first.")
                continue

            hits = retrieved_ids & relevant_ids
            recall = len(hits) / len(relevant_ids)

            print(f"Relevant chunks found: {len(hits)} " f"of {len(relevant_ids)}")
            print(f"Recall@{TOP_K}: {recall:.2%}")

    finally:
        client.close()


if __name__ == "__main__":
    main()
