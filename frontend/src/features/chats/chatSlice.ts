
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    isError?: boolean;
    retryQuestion?: string;
}

export interface ChatConversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

interface ChatsState {
    conversations: ChatConversation[];
    activeChatId: string | null;
}

const initialState: ChatsState = {
    conversations: [],
    activeChatId: null,
};

const chatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        createConversation: (
            state,
            action: PayloadAction<{ id: string; message: string }>,
        ) => {
            const { id, message } = action.payload;
            const now = new Date().toISOString();

            state.conversations.unshift({
                id,
                title: message.trim().slice(0, 50) || "New conversation",
                messages: [],
                createdAt: now,
                updatedAt: now,
            });

            state.activeChatId = id;
        },

        setActiveChat: (state, action: PayloadAction<string>) => {
            const exists = state.conversations.some(
                (chat) => chat.id === action.payload,
            );

            if (exists) {
                state.activeChatId = action.payload;
            }
        },

        addMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                message: ChatMessage;
            }>,
        ) => {
            const conversation = state.conversations.find(
                (chat) => chat.id === action.payload.chatId,
            );

            if (conversation) {
                conversation.messages.push(action.payload.message);
                conversation.updatedAt = action.payload.message.createdAt;
            }
        },

        updateMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                message: ChatMessage;
            }>,
        ) => {
            const conversation = state.conversations.find(
                (chat) => chat.id === action.payload.chatId,
            );

            const messageIndex = conversation?.messages.findIndex(
                (message) => message.id === action.payload.message.id,
            );

            if (conversation && messageIndex !== undefined && messageIndex >= 0) {
                conversation.messages[messageIndex] = action.payload.message;
                conversation.updatedAt = action.payload.message.createdAt;
            }
        },

        clearActiveChat: (state) => {
            state.activeChatId = null;
        },

        clearAllConversations: (state) => {
            state.conversations = [];
            state.activeChatId = null;
        },

        deleteConversation: (state, action: PayloadAction<string>) => {
            state.conversations = state.conversations.filter(
                (chat) => chat.id !== action.payload,
            );

            if (state.activeChatId === action.payload) {
                state.activeChatId = null;
            }
        },
    },
});

export const {
    createConversation,
    setActiveChat,
    addMessage,
    updateMessage,
    clearActiveChat,
    clearAllConversations,
    deleteConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
