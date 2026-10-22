import json
from pathlib import Path
import whisper
import torch
import gc

audio_dir = Path("audio")
output_dir = Path("transcripts_test")
output_dir.mkdir(parents=True, exist_ok=True)

# 1. Target Apple Silicon GPU
device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Loading Whisper large model on device: {device.upper()}")

model = whisper.load_model("large-v3", device=device)
audio_extensions = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}

for audio_path in audio_dir.iterdir():
    if audio_path.suffix.lower() not in audio_extensions:
        continue
    output_path = output_dir / f"{audio_path.stem}.json"

    if output_path.exists():
        print(f"Skipping {audio_path.name}: transcript already exists")
        continue

    print(f"Transcribing: {audio_path.name}")
    is_cpu = device == "cpu"

    try:
        # 2. Transcribe with structural anti-hallucination settings
        result = model.transcribe(
            str(audio_path),
            task="translate",
            fp16=not is_cpu,
            verbose=True,
            condition_on_previous_text=False,  # Stops phrase loops from multiplying
            compression_ratio_threshold=2.4,  # Rejects repeating string loops
            no_speech_threshold=0.6,  # Skips terminal silence or typing clicks
        )

        with output_path.open("w", encoding="utf-8") as file:
            json.dump(result, file, ensure_ascii=False, indent=2)
        print(f"Saved: {output_path}")

    except Exception as e:
        print(f"Error processing {audio_path.name}: {e}")

    finally:
        # 3. Prevent end-of-file buffer accumulation
        if device == "mps":
            torch.mps.empty_cache()
        gc.collect()

print("All audio files processed✅")


# UptfkuJBxLs.mp3
