import { apiBaseUrl } from "../chats/chatApi";

export interface LibraryVideo {
  video_id: string;
  chunk_count: number;
  start: number;
  end: number;
  youtube_url: string;
}

function isLibraryVideo(value: unknown): value is LibraryVideo {
  if (typeof value !== "object" || value === null) return false;

  const video = value as Record<string, unknown>;

  return (
    typeof video.video_id === "string" &&
    typeof video.chunk_count === "number" &&
    typeof video.start === "number" &&
    typeof video.end === "number" &&
    typeof video.youtube_url === "string"
  );
}

export async function fetchLibrary(): Promise<LibraryVideo[]> {
  const response = await fetch(`${apiBaseUrl}/v1/library/`);

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The library service returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error("Could not load the lecture library.");
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("videos" in data) ||
    !Array.isArray(data.videos) ||
    !data.videos.every(isLibraryVideo)
  ) {
    throw new Error("The library service returned an unexpected response.");
  }

  return data.videos;
}
