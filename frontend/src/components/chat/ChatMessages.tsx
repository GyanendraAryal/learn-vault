import { BookOpen, CheckCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-1 py-6 sm:py-8">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <div className="flex justify-end pl-10">
              <div className="max-w-[88%] rounded-2xl rounded-br-md bg-primary px-5 py-3.5 text-sm leading-6 text-white shadow-md shadow-primary/10 sm:max-w-[78%]">
                <p className="whitespace-pre-wrap">{message.content}</p>

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/75">
                  <CheckCheck size={13} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-context-border">
                <BookOpen size={19} />
              </div>

              <article className="min-w-0 max-w-3xl flex-1 rounded-2xl rounded-tl-md border border-chat-border bg-chat-assistant px-5 py-4 text-sm leading-7 text-text-secondary shadow-sm sm:px-6 sm:py-5">
                <div className="break-words [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:bg-primary-light/50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-heading [&_h1]:text-text-primary [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-heading [&_h2]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-text-primary [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_strong]:font-heading [&_strong]:text-text-primary [&_a]:font-button [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-hover">
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
              </article>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
