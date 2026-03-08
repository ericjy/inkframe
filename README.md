# inkframe

[![npm version](https://img.shields.io/npm/v/inkframe)](https://www.npmjs.com/package/inkframe)
[![license](https://img.shields.io/npm/l/inkframe)](./LICENSE)
[![node](https://img.shields.io/node/v/inkframe)](https://nodejs.org)

Render beautiful visual images from markdown content — CLI, SDK, and Agent Skill.

Powered by [inkframe.dev](https://inkframe.dev).

Includes a free shared API key so you can try it instantly — no signup required.
The shared key may be rate-limited or rotated over time; bring your own API key for production use.
[Open an issue](https://github.com/ericjy/inkframe/issues/new?title=API+Key+Request) to request API key.

## Requirements

- Node.js 18+

## Install Skill

```bash
# Recommend if you are using local agent, Claude Code, Codex CLI, etc.
npx skills add ericjy/inkframe
```

## Install CLI

```bash
# You must install CLI for the local agent to work with inkframe
pnpm add -g inkframe
```

## Install TyepScript SDK

```bash
# You only need this if you are integrating inkframe through SDK
pnpm add inkframe
```

## Workflow

### 0. Preview in the browser (free, no API key)

Open the [Inkframe playground](https://www.inkframe.dev/playground) with your content pre-loaded — no API key needed.

```bash
# Inline content
inkframe open --content "# Hello World\n\nThis is styled."

# From files
inkframe open --content @post.md --design @design.json
```

This opens your browser with the playground pre-populated so you can preview and tweak before rendering.

### 1. Render with a template

The quickest way to get started — pick a template and render your content with it.

```bash
# See what templates are available
inkframe templates list

# Render using a template (uses template's own content and design)
inkframe render --template tmpl_PWfUUDlVw --output out.png

# Or bring your own content (file)
inkframe render --content @post.md --template tmpl_PWfUUDlVw --output out.png

# Or bring your own content (inline)
inkframe render --content "# My Post\n\nHello world." --template tmpl_PWfUUDlVw --output out.png
```

### 2. Customize a design

Extract a template's design as a starting point, tweak it, then render with your custom version.

```bash
# Extract the design from a template
inkframe templates get tmpl_PWfUUDlVw --design-only --output design.json

# Edit design.json to your liking, then render with a file
inkframe render --content @post.md --design @design.json --output out.png

# Inline content + inline design
inkframe render --content "# My Post\n\nHello world." --design '{"backgroundKey":"ocean","colorPaletteKey":"pure-white"}' --output out.png
```

### 3. Automate with the SDK

Use the TypeScript SDK to render images programmatically in your scripts or pipelines.

```ts
import { InkframeClient } from "inkframe";

// Uses free shared key by default, or pass your own
const client = new InkframeClient({ apiKey: process.env.INKFRAME_API_KEY });

const result = await client.render({
  content: "# Hello World\n\nThis is a visual post.",
  design: { backgroundKey: "ocean", dimensionSpecKey: "instagram-4:5" },
});

console.log(result.resultUrl);
```

---

## CLI

```bash
# Works out of the box with the free shared key
inkframe render --content "# Hello World"

# Or set your own API key
export INKFRAME_API_KEY=your_api_key
inkframe render --content "# Hello World"

# Render from a markdown file (prefix with @)
inkframe render --content @post.md --output out.png

# Use a template (uses template's own content and design)
inkframe render --template tmpl_PWfUUDlVw --output out.png

# Use a template with your own content
inkframe render --content @post.md --template tmpl_PWfUUDlVw --output out.png

# Use a design file
inkframe render --content @post.md --design @design.json --output out.png

# Use inline design JSON
inkframe render --content "# Hello World" --design '{"backgroundKey":"ocean"}' --output out.png

# List available templates
inkframe templates list

# Get full template JSON
inkframe templates get tmpl_PWfUUDlVw

# Get only the design object
inkframe templates get tmpl_PWfUUDlVw --design-only

# Save to file
inkframe templates get tmpl_PWfUUDlVw --output template.json
inkframe templates get tmpl_PWfUUDlVw --design-only --output design.json

# Open playground in browser (free, no API key needed)
inkframe open --content "# Hello World"
inkframe open --content @post.md --design @design.json
```

## TypeScript SDK

```ts
import { InkframeClient } from "inkframe";

// Uses free shared key by default, or pass your own
const client = new InkframeClient({ apiKey: process.env.INKFRAME_API_KEY });

try {
  const result = await client.render({
    content: "# Hello World\n\nThis is a visual post.",
    design: {
      backgroundKey: "ocean",
      colorPaletteKey: "pure-white",
      dimensionSpecKey: "instagram-4:5",
    },
  });
  console.log(result.resultUrl); // https://...
} catch (error) {
  console.error("Render failed:", error.message);
}

// List templates without thumbnailUrl
const templates = await client.listTemplates({ exclude: ["thumbnailUrl"] });
```

## Multi-Page Content

Content can contain `\pagebreak` to separate pages (slides). The API renders **one image per request** — if your content has `\pagebreak` separators, only the first page is rendered. The [inkframe.dev studio](https://inkframe.dev) UI supports rendering all pages at once.

To render multi-page content via the CLI or SDK, split the content yourself and render each page in parallel:

```bash
# Render each page separately, in parallel
inkframe render --content @page1.md --design @design.json --output slide1.png &
inkframe render --content @page2.md --design @design.json --output slide2.png &
inkframe render --content @page3.md --design @design.json --output slide3.png &
wait
```

```ts
// SDK: render pages in parallel
const pages = fullContent.split("\\pagebreak");
const results = await Promise.all(
  pages.map((page) => client.render({ content: page.trim(), design })),
);
```

## Development

```bash
# Install dependencies
pnpm install

# Build (outputs to dist/)
pnpm build

# Watch mode
pnpm dev

# Type check without building
pnpm typecheck
```

**Test the `open` command locally (point to local webapp):**

```bash
pnpm build
node dist/cli.js open --content "# Hello World" --base-url http://localhost:3001
```

**Test the CLI locally against the live API:**

```bash
pnpm build
INKFRAME_API_KEY=your_api_key node dist/cli.js render --content "# Hello World"
```

**Test against a local server:**

```bash
INKFRAME_API_KEY=your_api_key node dist/cli.js render --content "# Hello World" --base-url http://localhost:3000
```

**Simulate a global install:**

```bash
pnpm link --global

export INKFRAME_API_KEY=your_api_key
inkframe render --content "# Hello World"
```

## License

MIT
