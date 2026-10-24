import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../app/store";
import { addMessage, setActiveChat } from "../features/chats/chatSlice";
import { askQuestion } from "../features/chats/chatApi";

import ChatMessages from "../components/chat/ChatMessages";
import MessageInput from "../components/chat/MessageInput";

interface ChatLocationState {
  initialMessage?: string;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const locationState = location.state as ChatLocationState | null;
  const initialMessage = locationState?.initialMessage;

  const dispatch = useDispatch<AppDispatch>();

  const conversation = useSelector((state: RootState) =>
    state.chats.conversations.find((chat) => chat.id === chatId),
  );

  const messages = conversation?.messages ?? [];
  const includeSources = useSelector(
    (state: RootState) => state.settings.includeSources,
  );

  const [isLoading, setIsLoading] = useState(false);
  const initialMessageHandled = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveChat(chatId));
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, isLoading]);

  const handleSend = useCallback(
    async (message: string) => {
      const question = message.trim();

      if (!chatId || !question || isLoading) return;

      dispatch(
        addMessage({
          chatId,
          message: {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            createdAt: new Date().toISOString(),
          },
        }),
      );

      setIsLoading(true);

      try {
        const data = await askQuestion(question);

        const sourceLinks = includeSources
          ? data.sources.filter((source) => source.youtube_url)
          : [];
        const answer = sourceLinks.length
          ? `${data.answer}\n\n**Sources**\n${sourceLinks
              .map(
                (source, index) =>
                  `${index + 1}. [Watch lecture (${Math.floor(
                    source.start / 60,
                  )}:${String(source.start % 60).padStart(
                    2,
                    "0",
                  )})](${source.youtube_url})`,
              )
              .join("\n")}`
          : data.answer;

        dispatch(
          addMessage({
            chatId,
            message: {
              id: crypto.randomUUID(),
              role: "assistant",
              content: answer,
              createdAt: new Date().toISOString(),
            },
          }),
        );
      } catch (error) {
        console.error("RAG API request failed:", error);

        dispatch(
          addMessage({
            chatId,
            message: {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                error instanceof TypeError
                  ? "I couldn't connect to the Django server. Check that the backend is running and that VITE_API_BASE_URL is configured correctly."
                  : error instanceof Error
                    ? `Sorry, I couldn't generate an answer: ${error.message}`
                    : "Sorry, something went wrong while generating the answer.",
              createdAt: new Date().toISOString(),
            },
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, dispatch, includeSources, isLoading],
  );

  useEffect(() => {
    if (!initialMessage || !chatId || initialMessageHandled.current) {
      return;
    }

    initialMessageHandled.current = true;

    if (messages.length === 0) {
      void handleSend(initialMessage);
    }

    window.history.replaceState({}, "");
  }, [initialMessage, chatId, messages.length, handleSend]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {!conversation || messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-lg text-center">
              <h2 className="text-2xl font-display text-text-primary">
                Let's learn something.
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Ask a question about your Django lectures to get started.
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} />
        )}

        {isLoading && (
          <p
            role="status"
            className="mx-auto mt-4 max-w-4xl text-sm text-text-muted"
          >
            Searching your lectures and preparing an answer...
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
