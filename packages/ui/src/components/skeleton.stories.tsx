import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    className: "h-4 w-64",
  },
  argTypes: {
    className: { control: "text" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLine: Story = {};

export const Avatar: Story = {
  args: {
    className: "size-12 rounded-full",
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-3 rounded-xl border p-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-10 w-28" />
    </div>
  ),
};
