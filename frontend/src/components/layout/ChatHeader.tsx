import { useState } from "react";
import { Menu, PanelLeftOpen } from "lucide-react";

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ChatHeader({
  onToggleSidebar,
  sidebarOpen = true,
  title = "Course assistant",
  subtitle = "Ask. Understand. Revisit.",
}: ChatHeaderProps) {
  const [knowledgeBaseActive] = useState(true);

  return (
    <header className="z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-border-subtle bg-surface/95 px-4 shadow-sm backdrop-blur sm:px-7">
      {/* Left: Sidebar toggle and title */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-text-secondary transition-colors hover:border-border hover:bg-surface-hover hover:text-primary"
        >
          {sidebarOpen ? (
            <Menu size={27} strokeWidth={1.8} />
          ) : (
            <PanelLeftOpen size={25} strokeWidth={1.8} />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-heading leading-6 text-text-primary sm:text-xl">
            {title}
          </h1>
          <p className="truncate text-xs leading-5 text-text-muted sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Knowledge base status */}
      <div className="ml-4 flex shrink-0 items-center">
        <div
          role="status"
          className="flex items-center gap-2 rounded-full border border-context-border bg-context-background/70 px-3 py-2 sm:gap-2.5 sm:px-4"
        >
          <span
            className={`size-2.5 rounded-full ring-4 ring-success-light ${
              knowledgeBaseActive ? "bg-success" : "bg-text-muted"
            }`}
          />

          <span className="hidden text-xs font-button text-text-primary sm:inline">
            Lecture knowledge base
          </span>
        </div>
      </div>
    </header>
  );
}
