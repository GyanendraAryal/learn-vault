import json
from pathlib import Path
import whisper

audio_dir = Path("audio")
output_dir = Path("transcripts")
output_dir.mkdir(parents=True, exist_ok=True)

model = whisper.load_model("base")
audio_extensions = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}

for audio_path in audio_dir.iterdir():
    if audio_path.suffix.lower() not in audio_extensions:
        continue
    output_path = output_dir / f"{audio_path.stem}.json"
    # Skip audio files that are already transcribed

    if output_path.exists():
        print(f"Skipping {audio_path.name}: transcript already exists")
        continue
    print(f"Transcribing: {audio_path.name}")
    result = model.transcribe(
        str(audio_path),
        task="translate",
    )
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(result, file, ensure_ascii=False, indent=2)
    print(f"Saved: {output_path}")
print("All audio files processed✅")
