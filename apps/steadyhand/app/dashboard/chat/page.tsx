import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@resonance/ui/components/empty-state"

/**
 * Career Coach — Chat-First Interface
 *
 * Split-screen layout:
 * - Left column (60%): Active chat with the AI career coach
 * - Right column (40%): Context/Memory Bank sidebar showing saved experiences
 *
 * Chat components (ChatWindow, ChatInput, ChatMessage) and Memory Bank
 * components (ExperienceCard) will be built in Step 3.6.
 */
export default function ChatPage() {
  return (
    <div className="flex h-full">
      {/* Left column — Chat interface (60%) */}
      <div className="flex w-3/5 flex-col border-r border-border">
        {/* Chat header */}
        <div className="flex h-14 items-center border-b border-border px-6">
          <h1 className="text-lg font-semibold">Career Coach</h1>
        </div>

        {/* Chat messages area — placeholder for ChatWindow (Step 3.6) */}
        <div className="flex flex-1 items-center justify-center p-8">
          <EmptyState>
            <EmptyStateIcon>
              <ChatBubbleIcon className="h-10 w-10" />
            </EmptyStateIcon>
            <EmptyStateTitle>Start a conversation</EmptyStateTitle>
            <EmptyStateDescription>
              Tell the Career Coach about your professional experiences. It will
              extract, structure, and save them to your Memory Bank
              automatically.
            </EmptyStateDescription>
          </EmptyState>
        </div>

        {/* Chat input area — placeholder for ChatInput (Step 3.6) */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-3">
            <span className="flex-1 text-sm text-muted-foreground">
              Chat input will be implemented in Step 3.6...
            </span>
          </div>
        </div>
      </div>

      {/* Right column — Memory Bank sidebar (40%) */}
      <div className="flex w-2/5 flex-col">
        {/* Sidebar header */}
        <div className="flex h-14 items-center border-b border-border px-6">
          <h2 className="text-sm font-semibold">Memory Bank</h2>
          <span className="ml-2 text-xs text-muted-foreground">
            Saved Experiences
          </span>
        </div>

        {/* Experience cards — placeholder for ExperienceCard list (Step 3.6) */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <EmptyState>
            <EmptyStateIcon>
              <BrainIcon className="h-10 w-10" />
            </EmptyStateIcon>
            <EmptyStateTitle>No experiences yet</EmptyStateTitle>
            <EmptyStateDescription>
              Experiences you share in the chat will appear here as structured
              STAR stories.
            </EmptyStateDescription>
          </EmptyState>
        </div>
      </div>
    </div>
  )
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  )
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  )
}
