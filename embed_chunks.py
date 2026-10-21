import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

chunks_dir = Path("chunks")
output_dir = Path("embeddings")
output_dir.mkdir(parents=True, exist_ok=True)

model_name = "sentence-transformers/all-MiniLM-L6-v2"
model = SentenceTransformer(model_name)

all_chunks = []

for chunk_file in sorted(chunks_dir.glob("*.json")):
    with chunk_file.open("r", encoding="utf-8") as file:
        chunks = json.load(file)

    for chunk in chunks:
        text = chunk.get("text", "").strip()

        if not text:
            continue
        all_chunks.append(chunk)

if not all_chunks:
    raise ValueError("No valid text chunk found in chunks/")
texts = [chunk["text"] for chunk in all_chunks]

print(f"Generating embeddings for {len(texts)} chunks...")

embeddings = model.encode(
    texts,
    batch_size=32,
    show_progress_bar=True,
    convert_to_numpy=True,
    normalize_embeddings=True,
)
np.save(output_dir / "embeddings.npy", embeddings)
with (output_dir / "metadata.json").open("w", encoding="utf-8") as file:
    json.dump(all_chunks, file, ensure_ascii=False, indent=2)
print(f"Embeddings shape: {embeddings.shape}")
print(f"Saved vectors: {output_dir / "embeddings.npy"}")
print(f"Saved metadata: {output_dir / "metadata.json"}")
print("All embeddings generated successfully!✅")
