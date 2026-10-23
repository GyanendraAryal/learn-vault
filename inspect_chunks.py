import json

with open("embeddings/metadata.json", encoding="utf-8") as file:
    chunks = json.load(file)

targets = {
    # Serializers vs models
    ("WzpfTlkT7EQ", 7),
    ("WzpfTlkT7EQ", 9),
    ("WzpfTlkT7EQ", 11),
    ("WzpfTlkT7EQ", 13),
    ("WzpfTlkT7EQ", 14),
    ("eIyzK0mfu7U", 10),
    ("eIyzK0mfu7U", 11),
    ("eIyzK0mfu7U", 12),
    # Token authentication
    ("MQY_gZWTmBE", 14),
    ("dj8rmZs_f5Y", 3),
    # Pagination
    ("cHvgiiQUXFE", 18),
    # APIView vs GenericAPIView
    ("eIyzK0mfu7U", 0),
    ("eIyzK0mfu7U", 3),
    ("eIyzK0mfu7U", 4),
    ("eIyzK0mfu7U", 5),
    ("eIyzK0mfu7U", 9),
}

for chunk in chunks:
    key = (chunk["video_id"], chunk["chunk_index"])

    if key in targets:
        print("\n" + "=" * 70)
        print(f"Video: {key[0]} | Chunk: {key[1]}")
        print(f"Timestamp: {chunk['start']}s - {chunk['end']}s")
        print(chunk["text"])
