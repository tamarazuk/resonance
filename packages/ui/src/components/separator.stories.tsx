import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-full max-w-lg space-y-3">
      <p className="text-sm text-muted-foreground">Section one</p>
      <Separator {...args} />
      <p className="text-sm text-muted-foreground">Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm text-muted-foreground">Left</span>
      <Separator {...args} />
      <span className="text-sm text-muted-foreground">Right</span>
    </div>
  ),
};
