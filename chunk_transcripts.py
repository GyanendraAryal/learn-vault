import json
from pathlib import Path

transcripts_dir = Path("transcripts")
output_dir = Path("chunks")
output_dir.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 250
CHUNK_OVERLAP = 50


def create_chunks(segments):
    chunks = []
    current_segments = []
    current_word_count = 0

    for segment in segments:
        text = segment.get("text", "").strip()

        if not text:
            continue

        word_count = len(text.split())

        if current_segments and current_word_count + word_count > CHUNK_SIZE:
            chunks.append(current_segments)
            # Retain trailing segments for context overlap
            overlap_segments = []
            overlap_word_count = 0

            for previous_segment in reversed(current_segments):
                previous_words = len(previous_segment["text"].split())
                if overlap_word_count + previous_words > CHUNK_OVERLAP:
                    break
                overlap_segments.insert(0, previous_segment)
                overlap_word_count += previous_words
            current_segments = overlap_segments
            current_word_count = overlap_word_count
        current_segments.append(
            {
                "text": text,
                "start": segment["start"],
                "end": segment["end"],
            }
        )
        current_word_count += word_count
    if current_segments:
        chunks.append(current_segments)
    return chunks


def process_transcript(transcript_path):
    with transcript_path.open("r", encoding="utf-8") as file:
        transcript = json.load(file)
    segments = transcript.get("segments", [])

    if not segments:
        print(f"Skipping {transcript_path.name}: no segments found")
        return
    grouped_chunks = create_chunks(segments)
    output_chunks = []

    for index, chunk_segments in enumerate(grouped_chunks):
        output_chunks.append(
            {
                "video_id": transcript_path.stem,
                "source_file": transcript_path.name,
                "chunk_index": index,
                "start": chunk_segments[0]["start"],
                "end": chunk_segments[-1]["end"],
                "text": " ".join(segment["text"] for segment in chunk_segments),
            }
        )
    output_path = output_dir / f"{transcript_path.stem}.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(output_chunks, file, ensure_ascii=False, indent=2)
    print(f"Processed {transcript_path.name}: " f"{len(output_chunks)} chunks saved")


for transcript_path in transcripts_dir.glob("*.json"):
    process_transcript(transcript_path)
print("All transcript are chunked! ✅")
