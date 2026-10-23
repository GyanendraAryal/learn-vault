import json

with open("embeddings/metadata.json", encoding="utf-8") as file:
    chunks = json.load(file)

TOPICS = {
    "serializers_vs_models": [
        "serializer",
        "modelserializer",
        "model",
    ],
    "token_authentication": [
        "token authentication",
        "authtoken",
        "authentication_classes",
        "authorization",
    ],
    "pagination": [
        "pagination",
        "page_size",
        "page number",
        "page size",
    ],
    "apiview_vs_genericapiview": [
        "apiview",
        "genericapiview",
        "generic api view",
        "api view",
    ],
}

for topic, terms in TOPICS.items():
    print(f"\n{'=' * 70}")
    print(f"TOPIC: {topic}")

    matches = []

    for chunk in chunks:
        content = chunk["text"].lower()

        if any(term in content for term in terms):
            matches.append(chunk)

    print(f"Candidate chunks: {len(matches)}")

    for chunk in matches:
        print(
            f"\nVideo: {chunk['video_id']} | "
            f"Chunk: {chunk['chunk_index']} | "
            f"Time: {chunk['start']:.1f}s–{chunk['end']:.1f}s"
        )
        print(chunk["text"][:300].replace("\n", " "))
