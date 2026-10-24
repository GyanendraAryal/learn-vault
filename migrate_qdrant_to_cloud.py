import os
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

PROJECT_ROOT = Path(__file__).resolve().parent
COLLECTION_NAME = "learn_vault"
BATCH_SIZE = 100

load_dotenv(PROJECT_ROOT / ".env", override=True)

url = os.getenv("QDRANT_URL")
api_key = os.getenv("QDRANT_API_KEY")

if not url or not api_key:
    raise RuntimeError("Missing QDRANT_URL or QDRANT_API_KEY.")

local = QdrantClient(path=str(PROJECT_ROOT / "qdrant_storage"))
cloud = QdrantClient(
    url=url,
    api_key=api_key,
    timeout=60,
    check_compatibility=False,
)

try:
    local_info = local.get_collection(COLLECTION_NAME)
    expected_count = local_info.points_count

    cloud_names = {
        collection.name for collection in cloud.get_collections().collections
    }

    if COLLECTION_NAME in cloud_names:
        raise RuntimeError(
            f"Cloud collection '{COLLECTION_NAME}' already exists. "
            "Stopping to avoid overwriting data."
        )

    vector_config = local_info.config.params.vectors

    if not isinstance(vector_config, models.VectorParams):
        raise RuntimeError("This script expects a single-vector collection.")

    cloud.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=vector_config.size,
            distance=vector_config.distance,
        ),
    )

    print(f"Created cloud collection: {COLLECTION_NAME}")
    print(f"Local points to migrate: {expected_count}")

    offset = None
    uploaded = 0

    while True:
        points, next_offset = local.scroll(
            collection_name=COLLECTION_NAME,
            limit=BATCH_SIZE,
            offset=offset,
            with_payload=True,
            with_vectors=True,
        )

        if not points:
            break

        cloud.upload_points(
            collection_name=COLLECTION_NAME,
            points=points,
            batch_size=BATCH_SIZE,
            parallel=1,
            max_retries=3,
            wait=True,
        )

        uploaded += len(points)
        print(f"Uploaded {uploaded}/{expected_count} points")

        if next_offset is None:
            break

        offset = next_offset

    cloud_count = cloud.count(
        collection_name=COLLECTION_NAME,
        exact=True,
    ).count

    print(f"\nMigration finished.")
    print(f"Local count: {expected_count}")
    print(f"Cloud count: {cloud_count}")

    if cloud_count != expected_count:
        raise RuntimeError("Point counts do not match. Keep the local backup.")

    print("SUCCESS: Point counts match.")

finally:
    local.close()
    cloud.close()
