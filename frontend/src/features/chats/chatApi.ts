export interface RagSource {
  video_id: string | null;
  start: number;
  end: number;
  score: number;
  text: string;
  youtube_url: string | null;
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
}

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

function isRagSource(source: unknown): source is RagSource {
  if (typeof source !== "object" || source === null) return false;

  const value = source as Record<string, unknown>;

  return (
    (typeof value.video_id === "string" || value.video_id === null) &&
    typeof value.start === "number" &&
    typeof value.end === "number" &&
    typeof value.score === "number" &&
    typeof value.text === "string" &&
    (typeof value.youtube_url === "string" || value.youtube_url === null)
  );
}

function isRagResponse(response: unknown): response is RagResponse {
  if (typeof response !== "object" || response === null) return false;

  const value = response as Record<string, unknown>;

  return (
    typeof value.answer === "string" &&
    Array.isArray(value.sources) &&
    value.sources.every(isRagSource)
  );
}

export async function askQuestion(question: string): Promise<RagResponse> {
  const response = await fetch(`${apiBaseUrl}/v1/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid JSON response.");
  }

  if (!response.ok) {
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
    ) {
      throw new Error(data.error);
    }

    throw new Error("The server could not answer your question.");
  }

  if (!isRagResponse(data)) {
    throw new Error("The server returned an unexpected response.");
  }

  return data;
}
