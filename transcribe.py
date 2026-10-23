import json
from pathlib import Path
import whisper
import torch
import gc

# Configure operational pathways
audio_dir = Path("audio")
output_dir = Path("transcripts")
output_dir.mkdir(parents=True, exist_ok=True)

# 1. Target Apple Silicon GPU hardware acceleration layer
device = "mps" if torch.backends.mps.is_available() else "cpu"
audio_extensions = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}

print(f"Target Compute Device Architecture: {device.upper()}")

# Process target index sequentially
for audio_path in audio_dir.iterdir():
    if audio_path.suffix.lower() not in audio_extensions:
        continue

    output_path = output_dir / f"{audio_path.stem}.json"

    # Skip files that have already completed execution successfully
    if output_path.exists():
        print(f"Skipping {audio_path.name}: transcript already exists")
        continue

    print(f"\n[STARTING] Transcribing: {audio_path.name}")
    is_cpu = device == "cpu"

    try:
        # 💡 SOLUTION: Load model weights INSIDE loop scope to reset state anchors
        print(f"Loading Whisper large parameters onto {device.upper()}...")
        model = whisper.load_model("large-v3", device=device)

        # 2. Transcribe using rigorous structural anti-hallucination thresholds
        result = model.transcribe(
            str(audio_path),
            task="translate",
            fp16=not is_cpu,
            verbose=True,
            condition_on_previous_text=False,  # Halts recursive phrase multiplication
            compression_ratio_threshold=2.4,  # Auto-rejects looping output phrases
            no_speech_threshold=0.6,  # Skips terminal noise floor or empty spaces
        )

        # Commit generated structured data to storage arrays
        with output_path.open("w", encoding="utf-8") as file:
            json.dump(result, file, ensure_ascii=False, indent=2)
        print(f"[SUCCESS] Saved: {output_path}")

    except Exception as e:
        print(f"[ERROR] Failed processing on target file {audio_path.name}: {e}")

    finally:
        # 3. Structural Memory Sanitation Block
        print("Executing post-iteration memory sanitation routines...")

        # Sever the model's tracking variables inside the local stack
        if "model" in locals():
            del model

        # Clean up backend execution references
        if device == "mps":
            torch.mps.empty_cache()

        # Trigger explicit garbage collector memory compaction pass
        gc.collect()
        print("[CLEANED] Memory buffers successfully reclaimed.")

print("\nAll target audio elements inside the local context processed successfully! ✅")

# UptfkuJBxLs.mp3
