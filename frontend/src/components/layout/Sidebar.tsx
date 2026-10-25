import { NavLink, useNavigate } from "react-router";
import {
  BookOpen,
  House,
  Settings,
  Plus,
  MessageSquareMore,
} from "lucide-react";
import { useSelector } from "react-redux";

import type { RootState } from "../../app/store";

const navigation = [
  { label: "Home", to: "/", icon: House },
  { label: "Library", to: "/library", icon: BookOpen },
  { label: "Settings", to: "/settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const recentChats = useSelector(
    (state: RootState) => state.chats.conversations,
  );
  const displayName = useSelector(
    (state: RootState) => state.settings.displayName,
  );

  const handleNewConversation = () => {
    navigate("/chat/new");
    onNavigate?.();
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 flex h-dvh w-[min(18rem,calc(100vw-1rem))] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-text-primary md:relative md:z-auto md:w-72">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
            <BookOpen size={27} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-display tracking-tight">Learn Vault</h1>
            <p className="mt-0.5 text-xs text-text-secondary">Your Learning Space</p>
          </div>
        </div>

        {/* New Conversation */}
        <button
          onClick={handleNewConversation}
          className="mb-6 flex h-12 w-full items-center gap-3 rounded-xl bg-primary px-4 text-sm font-button text-primary-foreground shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
        >
          <Plus size={23} />
          <span>New Conversation</span>
        </button>

        {/* Main Navigation */}
        <nav aria-label="Main navigation" className="space-y-1.5">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-active font-button text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-primary"
                }`
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Recent Chats */}
        <section className="mt-7 min-h-0 flex-1">
          <h2 className="mb-2 px-2 text-[11px] font-button uppercase tracking-wide text-text-secondary">
            Recent Chats
          </h2>

          <div className="max-h-full space-y-1 overflow-y-auto pr-1">
            {recentChats.map(({ id, title, updatedAt }) => (
              <NavLink
                key={id}
                to={`/chat/${id}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex min-h-[58px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isActive ? "bg-sidebar-active shadow-sm" : "hover:bg-surface-hover"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <MessageSquareMore
                      size={20}
                      strokeWidth={1.8}
                      className={`shrink-0 ${
                        isActive ? "text-primary" : "text-text-secondary"
                      }`}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-body-medium text-text-primary">
                        {title}
                      </span>
                      <span className="mt-1 block text-[11px] text-text-muted">
                        {new Date(updatedAt).toLocaleDateString()}
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </section>

        <div className="mt-4 flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-heading text-primary">
            {(displayName.trim() || "Student").slice(0, 1).toUpperCase()}
          </div>
          <p className="min-w-0 truncate text-xs text-text-muted">
            <span className="block text-[10px] uppercase tracking-wide">Signed in as</span>
            <span className="mt-0.5 block truncate font-button text-text-primary">
              {displayName.trim() || "Student"}
            </span>
          </p>
        </div>

        {/* Learning Context Card */}
        {/* <div className="mb-6 rounded-xl border border-context-border bg-context-background p-4">
          <div className="flex items-start gap-3">
            <Sparkles
              size={25}
              className="mt-0.5 shrink-0 text-primary"
              strokeWidth={1.8}
            />

            <div>
              <h3 className="text-sm font-heading text-primary">
                Learn with context
              </h3>
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Get answers from your lecture videos with relevant timestamps
                and sources.
              </p>
            </div>
          </div>
        </div> */}
      </aside>
    </>
  );
}
