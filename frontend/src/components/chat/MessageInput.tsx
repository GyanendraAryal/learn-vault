import { useState, type KeyboardEvent, type FormEvent } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
}

export default function MessageInput({
  onSend,
  isLoading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = (event?: FormEvent) => {
    event?.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    onSend?.(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-border-subtle bg-surface/95 px-4 py-4 backdrop-blur sm:px-8 sm:py-5">
      <form onSubmit={handleSend} className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-2xl border border-input-border bg-surface p-2.5 shadow-lg shadow-shadow/5 transition-all focus-within:border-focus focus-within:ring-4 focus-within:ring-primary-light sm:gap-3 sm:p-3">
          <button
            type="button"
            aria-label="Attach a file"
            disabled={isLoading}
            className="mb-1 flex size-10 shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-hover hover:text-primary disabled:opacity-50"
          >
            <Paperclip size={21} strokeWidth={1.8} />
          </button>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your lectures..."
            aria-label="Message"
            rows={1}
            disabled={isLoading}
            className="max-h-36 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted disabled:opacity-50"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={!message.trim() || isLoading}
            className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={22} strokeWidth={2.2} />
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-text-muted">
          Learn Vault can make mistakes. Verify important information with your
          lecture sources.
        </p>
      </form>
    </div>
  );
}
