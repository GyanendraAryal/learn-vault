import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";

interface MessageInputProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
}

export default function MessageInput({
  onSend,
  isLoading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = (event?: FormEvent) => {
    event?.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    onSend?.(trimmedMessage);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-border-subtle bg-surface/95 px-3 py-3 backdrop-blur sm:px-8 sm:py-4">
      <form onSubmit={handleSend} className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-2xl border border-input-border bg-surface p-2 shadow-lg shadow-shadow/5 transition-all focus-within:border-focus focus-within:ring-4 focus-within:ring-primary-light sm:gap-3 sm:p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              event.currentTarget.style.height = "auto";
              event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your lectures..."
            aria-label="Message"
            rows={1}
            maxLength={1000}
            className="max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted"
          />

          <button
            type="submit"
            aria-label={isLoading ? "Waiting for an answer" : "Send message"}
            disabled={!message.trim() || isLoading}
            className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <LoaderCircle
                size={20}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ArrowUp size={22} strokeWidth={2.2} aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-[11px] leading-4 text-text-muted">
          <span>Enter to send | Shift+Enter for a new line</span>
          {message.length > 800 && (
            <span aria-live="polite">{message.length}/1000</span>
          )}
        </div>
        <p className="mt-1 px-1 text-center text-[11px] leading-4 text-text-muted">
          Learn Vault can make mistakes. Verify important information with your
          lecture sources.
        </p>
      </form>
    </div>
  );
}
