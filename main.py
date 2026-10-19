import yt_dlp

url = input("Enter your url: ").strip()
# url = "https://www.youtube.com/playlist?list=PLFPvf150v_Mc".strip()
options = {
    "format": "bestaudio/best",
    "outtmpl": "audio/%(id)s.%(ext)s",
    "postprocessors": [
        {
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }
    ],
    # Add this line to explicitly set up the runtime
    "js_runtimes": {"node":{}},
}

with yt_dlp.YoutubeDL(options) as ydl:
    # Extract metadata dictionary
    info = ydl.extract_info(url, download=True)
    video_id = info.get("id")
    chapters = info.get("chapters")
    print(f"\nMetadata for video ID: {video_id}")
    if chapters:
        print("Timestamps Found ✅")
        for chapter in chapters:
            start_time = chapter.get("start_time")
            end_time = chapter.get("endtime")
            title = chapter.get("title")
            # Format seconds into MM:SS
            start_min = int(start_time // 60)
            start_sec = int(start_time % 60)
            print(
                f"-{start_min:02d}:{start_sec:02d} | {title} (Ends at {int(end_time)}s) "
            )
    else:
        print("No structural timestamps/chapters are found in this video's metadata.")
print("\nAudio download complete")
