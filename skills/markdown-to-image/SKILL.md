---
name: markdown-to-image
description: "Render markdown as beautiful styled images using the inkframe CLI. Use this skill whenever the user wants to turn text or markdown into a visual image, create social media graphics (tweets, Instagram posts, LinkedIn cards, quote cards, memes), generate code snippet images, make visual cards or posters from content, or produce any image from text/markdown. Also trigger when the user mentions 'inkframe', asks to 'render markdown', 'markdown to image', 'text to image', or wants to make content visually shareable. Even if they just say 'make this look nice as an image' or 'create a graphic for this' — use this skill."
---

# Inkframe — Markdown to Image

Inkframe renders markdown content into polished, styled images via the inkframe.dev API. It runs as a CLI (`inkframe`) and includes a free shared API key, so it works out of the box.

## Setup

Before first use, check if `inkframe` is available:

```bash
npx inkframe --help
```

If it's not installed, install it globally:

```bash
npm install -g inkframe
```

This gives you the `inkframe` command. The package ships with a free shared API key — no signup needed.

## Quick Start

```bash
# Simplest render — just give it markdown
inkframe render --content "# Hello World\n\nThis is styled." --output out.png

# Render from a file
inkframe render --content @post.md --output out.png

# Use a template for instant styling
inkframe render --template tmpl_PWfUUDlVw --content @post.md --output out.png
```

## CLI Commands

### `inkframe render`

| Flag | Description | Default |
|------|-------------|---------|
| `-c, --content <text>` | Markdown string or `@file.md` to read from file | Required (unless `--template` provides content) |
| `-t, --template <id>` | Template ID — applies its design (and content if `--content` omitted) | — |
| `-d, --design <json>` | Inline JSON or `@file.json` — overrides template design | — |
| `-o, --output <path>` | Save image to file (e.g. `out.png`). Prints URL if omitted | prints URL |
| `-s, --scale <n>` | Scale factor: 1, 2, or 3 | 2 |
| `-f, --file-type <fmt>` | Output format: `png`, `jpeg`, `webp` | `png` |

Content uses the `@` prefix convention: `--content @notes.md` reads from `notes.md`, while `--content "# Title"` is inline markdown.

### `inkframe templates list`

Lists all available templates with their IDs and names.

### `inkframe templates get <id>`

Gets full template JSON. Add `--design-only` to get just the design object. Add `-o file.json` to save to file.

## Available Templates

| ID | Name | Good for |
|----|------|----------|
| `tmpl_650IbCa8k` | Tweet (Dark) | Dark-themed tweet screenshots |
| `tmpl_vm9wHdOtU` | Poem | Poetry, literary quotes |
| `tmpl_PWfUUDlVw` | Quote | Inspirational/pull quotes |
| `tmpl_DAtOcPEQE` | Business Poster | Professional announcements |
| `tmpl_W46vhIVoJ` | Tweet | Tweet-style cards |
| `tmpl_4LNNIaHHO` | DeepSeek问答 | Q&A format (Chinese) |
| `tmpl_vOv0UwIwl` | Meme - Drake | Drake meme format |
| `tmpl_inxjqashV` | Tweet (Bilingual) | Bilingual tweet cards |
| `tmpl_9PbGi7zcJ` | Story (Bilingual) | Bilingual story format |
| `tmpl_qtYz45Xao` | Quote Card (Classic) | Classic styled quotes |
| `tmpl_lVArmW0pP` | Flowchart | Process/flow diagrams |
| `tmpl_pXED6toGN` | Quote Card | Modern quote cards |
| `tmpl_ciwTrec6U` | Tweet | Alternative tweet style |
| `tmpl_jKumMZX6E` | Testimonial | Customer testimonials |
| `tmpl_hSlqk3U8h` | Code Snippet | Code with syntax highlighting |
| `tmpl_KIHNN4CRg` | Carousel | Multi-slide carousel |
| `tmpl_0fJUHUTWs` | Listicle | Numbered/bulleted lists |

Templates are designed to look good out of the box — their fonts, colors, backgrounds, and layouts are already curated to work well together. Resist the urge to override a template's design unless the user specifically asks for customization. A template used as-is will almost always look more polished than a hastily assembled custom design.

### Choosing the right template

Match the content to the template's purpose. When in doubt, **inspect the template first** with `inkframe templates get <id>` to see its content structure and design — then model your markdown after the template's content format for best results.

- **Quotes/sayings**: `tmpl_qtYz45Xao` (Quote Card Classic) for elegant serif look, `tmpl_PWfUUDlVw` (Quote) for casual, `tmpl_pXED6toGN` (Quote Card) for modern
- **Code**: `tmpl_hSlqk3U8h` (Code Snippet) — dark theme, window controls, syntax highlighting
- **Tweets/social**: `tmpl_W46vhIVoJ`, `tmpl_650IbCa8k` (dark), `tmpl_ciwTrec6U`
- **Long-form content**: `tmpl_DAtOcPEQE` (Business Poster), `tmpl_0fJUHUTWs` (Listicle)
- **Testimonials**: `tmpl_jKumMZX6E`

### Custom designs (when templates aren't enough)

Only reach for `--design` when the user wants something specific that no template provides — a particular aspect ratio, custom branding, or a specific color scheme. In that case, the best approach is:

1. Find the closest template: `inkframe templates get <id> --design-only --output design.json`
2. Modify only the fields that need to change
3. Render with: `inkframe render --content @post.md --design @design.json --output out.png`

For the full reference of all design fields (dimensions, backgrounds, color palettes, fonts, and more), read `references/design-options.md` in this skill's directory.

## Design Pitfalls

When `contentBoxVisibility` is false, text renders directly on the background with no box behind it. Avoid these combinations — the text becomes unreadable:

- Dark `backgroundKey` + light `colorPaletteKey` (which has dark text) + `contentBoxVisibility: false`
- Light `backgroundKey` + dark `colorPaletteKey` (which has light text) + `contentBoxVisibility: false`

Either keep the content box visible, or match the palette theme to the background.

## Workflow Tips

1. **Try a template as-is first** — the curated designs are almost always better than custom ones. Use `inkframe templates list` to browse, then render with `--template`.
2. **Inspect before customizing** — `inkframe templates get <id>` shows the template's content and design. Model your markdown after the template's content structure.
3. **Customize sparingly** — if you must customize, start from a template's design and change only what's needed. Don't build designs from scratch.
4. **Write markdown to a temp file** for anything longer than a line or two, then use `@file.md`. This avoids shell escaping issues with inline content.
5. **Always use `--output`** to save the image locally rather than just printing a URL.
6. **Content is standard markdown** — headings, bold, italic, lists, code blocks, and blockquotes all render as expected.
