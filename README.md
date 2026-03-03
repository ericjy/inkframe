# inkframe

Render beautiful visual images from markdown content — CLI and SDK.

## Install

```bash
npm install -g inkframe
```

## CLI

```bash
export INKFRAME_API_KEY=your_api_key

# Render from inline content, print URL
inkframe render --content "# Hello World"

# Render from a markdown file, save to disk
inkframe render --content post.md --output out.png

# Use a custom design
inkframe render --content post.md --design design.json --output out.png

# List available templates
inkframe templates
```

## SDK

```ts
import { InkframeClient } from "inkframe";

const client = new InkframeClient({ apiKey: process.env.INKFRAME_API_KEY });

const result = await client.render({
  content: "# Hello World\n\nThis is a visual post.",
  design: {
    backgroundKey: "ocean",
    colorPaletteKey: "pure-white",
    dimensionSpecKey: "instagram-4:5",
  },
});

console.log(result.resultUrl); // https://...
```

## License

MIT
