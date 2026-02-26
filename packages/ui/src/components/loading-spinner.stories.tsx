import type { Meta, StoryObj } from "@storybook/react";

import { LoadingSpinner } from "./loading-spinner";

const meta = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  args: {
    size: "default",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "default", "lg"],
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const InlineWithText: Story = {
  render: () => (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <LoadingSpinner size="sm" />
      Loading results...
    </div>
  ),
};
