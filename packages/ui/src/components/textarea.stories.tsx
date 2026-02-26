import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Write your message...",
    disabled: false,
    rows: 4,
  },
  argTypes: {
    placeholder: { control: "text" },
    rows: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled textarea",
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    value: "Validation error",
  },
};
