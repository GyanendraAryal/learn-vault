import json
from pathlib import Path

import numpy as np
from qdrant_client import QdrantClient, models

embeddings_path = Path("embeddings/embeddings.npy")
metadata_path = Path("embeddings/metadata.json")

collection_name = "learn_vault"

# Load the generated embeddings.
embeddings = np.load(embeddings_path)

with metadata_path.open("r", encoding="utf-8") as file:
    metadata = json.load(file)

if len(embeddings) != len(metadata):
    raise ValueError("Embeddings and metadata counts do not match.")

# Open the persistent local Qdrant database.
client = QdrantClient(path="qdrant_storage")

try:
    # Recreate the collection to remove outdated vectors.
    if client.collection_exists(collection_name):
        client.delete_collection(collection_name)
        print(f"Deleted old collection: {collection_name}")

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=embeddings.shape[1],
            distance=models.Distance.COSINE,
        ),
    )
    print(f"Created collection: {collection_name}")

    # Upload vectors with their corresponding metadata.
    points = [
        models.PointStruct(
            id=index,
            vector=vector.tolist(),
            payload=chunk,
        )
        for index, (vector, chunk) in enumerate(zip(embeddings, metadata))
    ]

    client.upsert(
        collection_name=collection_name,
        points=points,
        wait=True,
    )

    print(f"Uploaded {len(points)} points to Qdrant.")

    info = client.get_collection(collection_name)
    print(f"Total points in collection: {info.points_count}")

finally:
    client.close()
