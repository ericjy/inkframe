---
name: tier-list-image
description: "Generate a recognizable tier-list image from rankings using a fixed HTML template and local browser rendering. Use this skill whenever the user wants a tier list, S/A/B/C ranking graphic, power ranking image, ranked comparison board, or says things like 'make a tier list', 'rank these visually', 'turn this into a tier-list image', or 'generate a shareable ranking graphic'. Trigger even when the user only gives rough ranking text and expects the agent to infer the structured tiers. Prefer agent-browser for local screenshots when available. Do not use this for generic posters, charts, or freeform markdown cards."
---

# Tier List Image

This skill turns a ranking into a real tier-board image.

Use it when the user wants:

- a classic `S / A / B / C / D` tier list
- a custom ranking vocabulary, including Chinese labels like `夯爆了 / 夯 / 顶级 / 人上人 / NPC / 拉完了`
- a shareable ranking image
- a power ranking board
- a meme or gaming tier board
- a visual ranking built from loose natural-language input

Do not use it for:

- generic posters or quote cards
- dashboards, charts, or tables without tier rows
- text-to-image illustration tasks

## Requirements

Required:

- Node.js 18+
- the skill installed, for example:

```bash
npx skills add https://github.com/ericjy/inkframe/skills --skill tier-list-image
```

- `agent-browser` installed and available on `PATH`
- browser runtime installed for `agent-browser`

Recommended `agent-browser` setup:

```bash
npm install -g agent-browser
agent-browser install
```

Optional:

- a local Chrome or Chromium executable if the user wants to pass `--browser-path`

This skill does not require a repo checkout or `pnpm install`. The bundled scripts use Node built-ins and skill-local files.

If `agent-browser` cannot launch a browser in the current environment, generate the HTML and stop there instead of pretending the PNG render succeeded.

## How The Agent Should Use This Skill

When helpful, present exactly 3 example prompt suggestions the user can copy and adapt. Make them progressively more specific:

1. a very simple request
   Example: `Make a tier list of pizza toppings.`
2. a medium-detail request
   Example: `Make a tier-list image of programming languages. Put Python and TypeScript in A, Go and Rust in B, and PHP in C.`
3. a fully specified request with title, theme, aspect ratio, and explicit tier contents
   Example: `Make a 4:5 editorial tier-list image titled "Best Languages for Human To Code In". S: English. A: Python, TypeScript. B: Rust, Go, SQL. C: Java, C#, Bash. D: C++, PHP, Ruby. F: COBOL, Assembly.`

Keep them short, concrete, and aligned with this skill's actual capabilities.

Preserve the user's exact tier vocabulary and order when they use custom labels. Do not silently remap `夯爆了 / 夯 / 顶级 / 人上人 / NPC / 拉完了` or other custom labels to `S / A / B / C / F`.

### Step 1: Convert Natural-Language Request To Tier-List Spec JSON

When the user gives a natural-language request:

```text
Make me a 4:5 tier-list image for AI coding tools. Put Codex and Claude Code in S tier, Cursor and Windsurf in A tier, Copilot in B tier. Use the editorial theme.
```

Write a spec JSON like:

```json
{
  "title": "Best AI Coding Tools",
  "theme": "editorial",
  "watermark": true,
  "canvas": {
    "aspectRatio": "4:5"
  },
  "tiers": [
    {
      "key": "S",
      "label": "S Tier",
      "color": "#ff5f6d",
      "items": ["Codex", "Claude Code"]
    },
    {
      "key": "A",
      "label": "A Tier",
      "color": "#ffb347",
      "items": ["Cursor", "Windsurf"]
    },
    {
      "key": "B",
      "label": "B Tier",
      "color": "#ffdd00",
      "items": ["Copilot"]
    }
  ]
}
```

Be explicit when you inferred missing ranking structure.

If the user provides custom tier labels, keep them exactly in `key` and `label`, in the same top-to-bottom order they gave.

### Step 2: Run `render-tier-list.mjs` With The Spec File

Run the renderer with the spec JSON file you wrote in Step 1.

### Step 3: Report Where The Output Image Was Generated

Tell the user where the PNG was saved. If you kept the generated HTML, mention that path too.

## Tier List Spec Schema

The renderer expects a spec JSON file.

Example:

```json
{
  "title": "Best Languages for Human To Code In",
  "subtitle": "\"The compiler is now the LLM\"",
  "theme": "editorial",
  "footer": "Example schema showing all supported fields",
  "watermark": true,
  "canvas": {
    "aspectRatio": "16:9",
    "width": 1600,
    "height": 900
  },
  "tiers": [
    {
      "key": "S",
      "label": "S Tier",
      "color": "#ff5f6d",
      "layout": "detailed",
      "items": [
        { "title": "English", "description": "The universal compile target" }
      ]
    },
    {
      "key": "A",
      "label": "A Tier",
      "color": "#ff9f0a",
      "layout": "detailed",
      "items": [
        { "title": "Python", "description": "LLM's native tongue" },
        { "title": "TypeScript", "description": "Typed, versatile, full-stack" }
      ]
    },
    {
      "key": "B",
      "label": "B Tier",
      "color": "#ffdd00",
      "layout": "detailed",
      "items": [
        { "title": "Rust", "description": "When correctness matters" },
        { "title": "Go", "description": "Simple, fast, boring (good)" },
        { "title": "SQL", "description": "Declarative data king" }
      ]
    },
    {
      "key": "C",
      "label": "C Tier",
      "color": "#84cc16",
      "layout": "detailed",
      "items": [
        { "title": "Java", "description": "Enterprise gravity well" },
        { "title": "C#", "description": "Microsoft's Java" },
        { "title": "Bash", "description": "Glue that holds it all" }
      ]
    },
    {
      "key": "D",
      "label": "D Tier",
      "color": "#3b82f6",
      "layout": "detailed",
      "items": [
        { "title": "C++", "description": "Power \u2260 productivity" },
        { "title": "PHP", "description": "Still runs half the web" },
        { "title": "Ruby", "description": "Beautiful but fading" }
      ]
    },
    {
      "key": "F",
      "label": "F Tier",
      "color": "#a855f7",
      "layout": "detailed",
      "items": [
        { "title": "COBOL", "description": "Eternal legacy" },
        { "title": "Assembly", "description": "LLMs can't save you" }
      ]
    }
  ]
}
```

Required top-level fields:

- `title`
- `tiers`

Recommended top-level fields:

- `subtitle`
- `theme`
- `footer`
- `canvas`
- `watermark`

Canvas rules:

- canvas geometry comes from `canvas`
- `canvas.aspectRatio` is optional and defaults to `4:5`
- `canvas.width` is optional and defaults to `1600`
- `canvas.height` is optional and is derived from width plus aspect ratio
- if both `canvas.width` and `canvas.height` are provided, that exact viewport is used

Supported `canvas` fields:

- `aspectRatio`
- `width`
- `height`

Watermark rules:

- watermark is on by default and renders `Find the tier-list-image skill at github.com/ericjy/inkframe`
- set `watermark` to `false` to opt out
- set `watermark` to a string to override the default text

Each tier should include:

- `key`
- `label`
- `color`
- `items`

Optional tier field:

- `layout` with `detailed`, `compact`, or `dense`

Each item may be either:

- a string
- or an object with `title` or `name`
- plus optional `description` or `subtitle`

## Primary Command

Run:

```bash
node ${SKILL_DIR}/scripts/render-tier-list.mjs --spec <spec.json> --out <image.png>
```

Resolve `SKILL_DIR` as the directory containing this installed skill's `SKILL.md`.

Available flags:

- `--spec <path>` required. Tier-list spec JSON.
- `--out <path>` required. Final PNG path.
- `--html-out <path>` optional. Keep the generated HTML file.
- `--session <name>` optional. Browser session name. Default `tierlist-render`.
- `--wait-ms <ms>` optional. Delay before screenshot. Default `300`.
- `--browser-path <path>` optional. Explicit browser executable path.
- `--print-metadata` optional. Print render metadata to stdout.

Recommended example:

```bash
node ${SKILL_DIR}/scripts/render-tier-list.mjs \
  --spec ./tier-spec.json \
  --out ./out/tier-list.png \
  --html-out ./out/tier-list.html
```

## Fallback Debug Flow

If you need to debug the template or keep the steps separate:

1. Generate HTML:

```bash
node ${SKILL_DIR}/scripts/generate-html.mjs <spec.json> <output.html>
```

2. Screenshot it manually:

```bash
agent-browser --session tierlist --allow-file-access open file:///absolute/path/to/tier-list.html
agent-browser --session tierlist set viewport 1600 2000
agent-browser --session tierlist screenshot /absolute/path/to/tier-list.png
agent-browser --session tierlist close
```

Use the viewport returned by `generate-html.mjs`.

## Output Contract

Unless the user asks otherwise, produce:

1. a spec JSON file
2. a local PNG file
3. optionally an HTML file when `--html-out` is useful

Tell the user where the PNG was saved. Mention the HTML path only if it was kept.

## Renderer Behavior

The bundled template and scripts control the visual layout. Do not invent a separate layout structure in the prompt or in ad hoc HTML.

Important behavior:

- the renderer produces one tier section per tier
- item cards wrap automatically inside each tier section
- density is chosen automatically based on the amount of content and available space
- explicit tier `layout` should only be used when the user clearly wants an override

## Themes

Supported themes:

- `classic`
- `editorial`
- `gaming-neon`

Use the one the user asked for. If the user does not care, choose the one that best fits the subject matter.
