import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, Video } from "lucide-react";

import { fetchLibrary, type LibraryVideo } from "../features/library/libraryApi";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Library() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchLibrary()
      .then((items) => {
        if (active) setVideos(items);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the lecture library.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return videos;
    return videos.filter((video) => video.video_id.toLowerCase().includes(query));
  }, [search, videos]);

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display tracking-tight text-text-primary">
              Lecture library
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Browse videos currently indexed in your course knowledge base.
            </p>
          </div>
          <p className="rounded-full border border-context-border bg-context-background px-3.5 py-2 text-xs font-button text-primary">
            {videos.length} {videos.length === 1 ? "lecture" : "lectures"}
          </p>
        </div>

        <label className="mt-7 flex max-w-lg items-center gap-3 rounded-2xl border border-input-border bg-surface px-4 py-3.5 shadow-sm transition-all focus-within:border-focus focus-within:ring-4 focus-within:ring-primary-light">
          <Search size={19} className="shrink-0 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by video ID..."
            aria-label="Search lectures"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>

        {isLoading ? (
          <p role="status" className="py-12 text-center text-sm text-text-muted">
            Loading indexed lectures...
          </p>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-sm text-danger">
            {error}
          </p>
        ) : filteredVideos.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-muted">
            {videos.length
              ? "No lectures match that search."
              : "No lectures are currently indexed."}
          </p>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <article
                key={video.video_id}
                className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:border-context-border hover:shadow-lg"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-video-thumbnail text-primary-foreground">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-video-overlay/70" />
                  <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
                    <Video size={32} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="truncate font-heading text-text-primary">
                    Lecture {video.video_id}
                  </h3>
                  <p className="mt-2 inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text-secondary">
                    {video.chunk_count} indexed segments ·{" "}
                    {formatDuration(video.end - video.start)}
                  </p>
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-button text-primary transition-colors hover:text-primary-hover hover:underline"
                  >
                    Watch lecture <ExternalLink size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
