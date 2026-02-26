import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
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
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview" className="w-full max-w-xl">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="materials">Materials content</TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="fit" className="w-full max-w-xl">
      <TabsList variant="line">
        <TabsTrigger value="fit">Fit Analysis</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="fit">Fit score and recommendations.</TabsContent>
      <TabsContent value="tasks">Suggested next actions.</TabsContent>
      <TabsContent value="history">Previous activity timeline.</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <Tabs {...args} defaultValue="summary" className="w-full max-w-xl">
      <TabsList variant="line" className="min-w-40">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">Summary panel content.</TabsContent>
      <TabsContent value="skills">Skill breakdown content.</TabsContent>
      <TabsContent value="notes">Additional notes content.</TabsContent>
    </Tabs>
  ),
};
