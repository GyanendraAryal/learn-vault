
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";

import chatsReducer from "../features/chats/chatSlice";
import settingsReducer from "../features/settings/settingsSlice";




const storage = {
    getItem: (key: string): Promise<string | null> =>
        Promise.resolve(window.localStorage.getItem(key)),

    setItem: (key: string, value: string): Promise<string> => {
        window.localStorage.setItem(key, value);
        return Promise.resolve(value);
    },

    removeItem: (key: string): Promise<void> => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
    },
};

const rootReducer = combineReducers({
    chats: chatsReducer,
    settings: settingsReducer,
});

const persistConfig = {
    key: "learn-vault",
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
