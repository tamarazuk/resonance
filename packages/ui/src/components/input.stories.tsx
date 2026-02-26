import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    type: "text",
    placeholder: "Enter text...",
    disabled: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "search", "number"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled input",
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    value: "Invalid value",
  },
};
