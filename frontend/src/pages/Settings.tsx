import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";

import type { AppDispatch, RootState } from "../app/store";
import { clearAllConversations } from "../features/chats/chatSlice";
import { setDisplayName, setIncludeSources } from "../features/settings/settingsSlice";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { displayName, includeSources } = useSelector(
    (state: RootState) => state.settings,
  );
  const conversationCount = useSelector(
    (state: RootState) => state.chats.conversations.length,
  );

  const handleClearHistory = () => {
    if (
      conversationCount > 0 &&
      window.confirm("Delete all saved conversations from this browser?")
    ) {
      dispatch(clearAllConversations());
      navigate("/chat/new");
    }
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-display tracking-tight text-text-primary">Settings</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Manage your Learn Vault preferences on this device.
        </p>

        <div className="mt-8 space-y-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6 md:p-7">
            <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <span className="text-sm font-heading">01</span>
            </div>
            <h3 className="font-heading text-text-primary">Profile</h3>
            <label className="mt-4 block max-w-md text-sm text-text-secondary">
              Display name
              <input
                type="text"
                value={displayName}
                maxLength={60}
                onChange={(event) =>
                  dispatch(setDisplayName(event.target.value))
                }
                className="mt-2 block w-full rounded-xl border border-input-border bg-surface px-3.5 py-3 text-sm text-text-primary outline-none transition-all focus:border-focus focus:ring-4 focus:ring-primary-light"
              />
            </label>
            <p className="mt-2 text-xs text-text-muted">
              Your preferences are saved in this browser.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6 md:p-7">
            <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <span className="text-sm font-heading">02</span>
            </div>
            <h3 className="font-heading text-text-primary">Answer display</h3>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={includeSources}
                onChange={(event) =>
                  dispatch(setIncludeSources(event.target.checked))
                }
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="block font-button text-text-primary">
                  Show lecture source links
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  Add direct video links beneath answers when the backend
                  provides them.
                </span>
              </span>
            </label>
          </section>

          <section className="rounded-2xl border border-danger/30 bg-surface p-4 shadow-sm sm:p-6 md:p-7">
            <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <span className="text-sm font-heading">03</span>
            </div>
            <h3 className="font-heading text-text-primary">Local data</h3>
            <p className="mt-2 text-sm text-text-muted">
              Remove all {conversationCount} saved{" "}
              {conversationCount === 1 ? "conversation" : "conversations"} from
              this browser.
            </p>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={conversationCount === 0}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger/40 px-4 py-2.5 text-sm font-button text-danger transition-colors hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Trash2 size={16} />
              Clear chat history
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}
