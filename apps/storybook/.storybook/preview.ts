import type { Preview } from "@storybook/react-vite"

import "@resonance/ui/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
}

export default preview
