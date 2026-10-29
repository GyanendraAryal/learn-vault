import { AlertCircle, BookOpen, CheckCheck, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../../features/chats/chatSlice";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onRetry: (question: string, messageId: string) => void;
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  onRetry,
  isLoading,
}: ChatMessagesProps) {
  return (
    <section
      aria-label="Conversation"
      className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-1 py-5 sm:gap-7 sm:py-8"
    >
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <div className="flex justify-end pl-8 sm:pl-10">
              <div className="max-w-[94%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-md shadow-primary/10 sm:max-w-[78%] sm:px-5 sm:py-3.5">
                <p className="whitespace-pre-wrap">{message.content}</p>

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/75">
                  <CheckCheck size={13} aria-hidden="true" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 sm:gap-4">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-context-border">
                <BookOpen size={19} aria-hidden="true" />
              </div>

              <article
                className={`min-w-0 max-w-3xl flex-1 rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-7 shadow-sm sm:px-6 sm:py-5 ${
                  message.isError
                    ? "border-danger/30 bg-danger/5 text-text-primary"
                    : "border-chat-border bg-chat-assistant text-text-secondary"
                }`}
                role={message.isError ? "alert" : undefined}
              >
                {message.isError && (
                  <div className="mb-2 flex items-center gap-2 text-danger">
                    <AlertCircle size={17} aria-hidden="true" />
                    <span className="font-button">Couldn't get an answer</span>
                  </div>
                )}
                <div className="break-words [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:bg-primary-light/50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-heading [&_h1]:text-text-primary [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-heading [&_h2]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-text-primary [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_li]:my-1 [&_strong]:font-heading [&_strong]:text-text-primary [&_a]:font-button [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-hover">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children, ...props }) => (
                        <a
                          href={href}
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.isError && message.retryQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      const question = message.retryQuestion;
                      if (question) onRetry(question, message.id);
                    }}
                    disabled={isLoading}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-danger/30 bg-surface px-3 py-2 text-sm font-button text-danger transition-colors hover:bg-danger/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    Try again
                  </button>
                )}
              </article>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
