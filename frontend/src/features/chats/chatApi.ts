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
export const chatApiUrl = `${apiBaseUrl}/v1/chat/`;

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

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
  const response = await fetch(chatApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const responseText = await response.text();
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        if (
          response.status === 404 &&
          /NOT_FOUND|The page could not be found/i.test(responseText)
        ) {
          throw new ChatApiError(
            "The chat API route returned 404 instead of JSON. In Vercel, set the project Root Directory to frontend, make sure frontend/vercel.json is included in the deployment, and redeploy.",
          );
        }

        throw new ChatApiError(
          `The chat service returned HTTP ${response.status} with a non-JSON response. Check the backend deployment and API route.`,
        );
      }

      throw new ChatApiError(
        "The chat service returned an invalid response. Check that the Vercel API rewrite reaches the Django backend.",
      );
    }
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

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      throw new ChatApiError(data.detail);
    }

    throw new ChatApiError(
      `The chat service returned HTTP ${response.status}. Please try again in a moment.`,
    );
  }

  if (!isRagResponse(data)) {
    throw new Error("The server returned an unexpected response.");
  }

  return data;
}
