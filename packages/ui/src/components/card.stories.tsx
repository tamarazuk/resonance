import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    size: "default",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "sm"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Application Ready</CardTitle>
        <CardDescription>
          Your resume and cover letter are ready for submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Last updated today at 10:30 AM.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Review</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Triage Summary</CardTitle>
        <CardDescription>2 actions need attention today.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Prioritize follow-up tasks.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Senior Product Designer</CardTitle>
        <CardAction>
          <Button size="sm" variant="ghost">
            Open
          </Button>
        </CardAction>
        <CardDescription>Acme Corp</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Interview stage: phone screen.
        </p>
      </CardContent>
    </Card>
  ),
};
