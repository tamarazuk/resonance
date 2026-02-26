import type { Preview } from "@storybook/react";

import { TooltipProvider } from "@resonance/ui/components/tooltip";
import "@resonance/ui/globals.css";

const withAppShell: Preview["decorators"][number] = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";

  return (
    <div className={theme}>
      <div className="bg-background p-6 text-foreground sm:p-8">
        <TooltipProvider>
          <div className="mx-auto w-full max-w-5xl">
            <Story />
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

const preview: Preview = {
  decorators: [withAppShell],
  parameters: {
    layout: "padded",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global color theme",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
};

export default preview;
