import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "./empty-state";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <InboxIcon />
      </EmptyStateIcon>
      <EmptyStateTitle>No applications yet</EmptyStateTitle>
      <EmptyStateDescription>
        Add your first job posting to start fit analysis and tailored materials.
      </EmptyStateDescription>
    </EmptyState>
  ),
};

export const WithAction: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <InboxIcon />
      </EmptyStateIcon>
      <EmptyStateTitle>Nothing to review</EmptyStateTitle>
      <EmptyStateDescription>
        All of your pending items are complete.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline">Refresh</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
};

function InboxIcon() {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10"
    >
      <path d="M22 12h-5l-2 3H9l-2-3H2" />
      <path d="M5 12V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
      <path d="M5 12v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}
