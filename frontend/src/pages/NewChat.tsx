import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { BookOpen, Sparkles } from "lucide-react";

import type { AppDispatch } from "../app/store";
import { createConversation } from "../features/chats/chatSlice";
import MessageInput from "../components/chat/MessageInput";

export default function NewChat() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSend = (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const chatId = crypto.randomUUID();

    // Create the conversation in Redux first.
    dispatch(
      createConversation({
        id: chatId,
        message: trimmedMessage,
      }),
    );

    // Open the new conversation and pass its first question.
    navigate(`/chat/${chatId}`, {
      state: { initialMessage: trimmedMessage },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-light/60 blur-3xl" />
        <div className="relative max-w-xl text-center">
          <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-3xl border border-context-border bg-surface text-primary shadow-lg shadow-primary/10">
            <BookOpen size={38} strokeWidth={1.6} />
          </div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-context-border bg-context-background px-3 py-1 text-xs font-button text-primary">
            <Sparkles size={14} />
            Your lecture companion
          </div>
          <h2 className="text-3xl font-display tracking-tight text-text-primary sm:text-4xl">
            What do you want to learn today?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-text-muted">
            Ask a question about your Django lectures and get answers grounded
            in your course videos.
          </p>
        </div>
      </section>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
