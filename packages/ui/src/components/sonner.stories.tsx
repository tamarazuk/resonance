import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

const meta: Meta<typeof Toaster> = {
  title: "Components/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  args: {
    position: "top-right",
    richColors: true,
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    richColors: { control: "boolean" },
  },
  decorators: [
    (Story, context) => (
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        forcedTheme={context.globals.theme === "dark" ? "dark" : "light"}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllToastTypes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => toast.success("Experience saved successfully")}>
        Success
      </Button>
      <Button onClick={() => toast.info("Draft generated")}>Info</Button>
      <Button onClick={() => toast.warning("Missing required fields")}>
        Warning
      </Button>
      <Button onClick={() => toast.error("Failed to submit")}>Error</Button>
      <Button
        onClick={() =>
          toast.loading("Generating tailored materials", {
            duration: 2000,
          })
        }
      >
        Loading
      </Button>
      <Toaster {...args} />
    </div>
  ),
};
