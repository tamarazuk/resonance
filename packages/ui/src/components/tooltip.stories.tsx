import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function renderTooltip(side: "top" | "right" | "bottom" | "left") {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
        <TooltipContent side={side} sideOffset={8}>
          Helpful context for this action
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export const Top: Story = {
  render: () => renderTooltip("top"),
};

export const Right: Story = {
  render: () => renderTooltip("right"),
};

export const Bottom: Story = {
  render: () => renderTooltip("bottom"),
};

export const Left: Story = {
  render: () => renderTooltip("left"),
};
