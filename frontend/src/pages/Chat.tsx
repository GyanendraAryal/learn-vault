import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../app/store";
import {
  addMessage,
  setActiveChat,
  updateMessage,
} from "../features/chats/chatSlice";
import {
  askQuestion,
  ChatApiError,
  chatApiUrl,
} from "../features/chats/chatApi";

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
  const requestInFlight = useRef(false);
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
    async (message: string, retryMessageId?: string) => {
      const question = message.trim();

      if (!chatId || !question || requestInFlight.current) return;

      requestInFlight.current = true;
      setIsLoading(true);
      if (!retryMessageId) {
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
      }

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

        const reply = {
          id: retryMessageId ?? crypto.randomUUID(),
          role: "assistant" as const,
          content: answer,
          createdAt: new Date().toISOString(),
        };
        dispatch(
          retryMessageId
            ? updateMessage({ chatId, message: reply })
            : addMessage({ chatId, message: reply }),
        );
      } catch (error) {
        console.error("RAG API request failed:", error);

        const content =
          error instanceof ChatApiError
            ? error.message
            : error instanceof TypeError
              ? `Couldn't reach the chat API at ${chatApiUrl}. Check that the backend is online and the Vercel API rewrite is configured.`
              : error instanceof Error
                ? error.message
                : "Something went wrong while generating the answer.";
        const failedReply = {
          id: retryMessageId ?? crypto.randomUUID(),
          role: "assistant" as const,
          content,
          createdAt: new Date().toISOString(),
          isError: true,
          retryQuestion: question,
        };
        dispatch(
          retryMessageId
            ? updateMessage({ chatId, message: failedReply })
            : addMessage({ chatId, message: failedReply }),
        );
      } finally {
        requestInFlight.current = false;
        setIsLoading(false);
      }
    },
    [chatId, dispatch, includeSources],
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
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
        {!conversation || messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-lg px-2 text-center">
              <h2 className="text-xl font-display text-text-primary sm:text-2xl">
                Let's learn something.
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Ask a question about your Django lectures to get started.
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onRetry={(question, messageId) =>
              void handleSend(question, messageId)
            }
          />
        )}

        {isLoading && (
          <p
            role="status"
            className="mx-auto mt-4 flex max-w-4xl items-center gap-2 text-sm text-text-muted"
          >
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            Searching your lectures and preparing an answer...
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
