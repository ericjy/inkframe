---
name: prompt-to-image
description: "Generate original images from text prompts by calling provider APIs directly with plain HTTP, without bringing an SDK into the repo. Use this skill whenever the user wants prompt-to-image generation, concept art, thumbnails, posters, illustrations, cover art, visual explorations, or asks for OpenAI image generation, GPT Image, DALL-E, Gemini image, or Nano Banana. Trigger even when the user just says 'make an image for this prompt' or wants several prompt-based image variations. Do not use this for rendering markdown or styled text cards; use the markdown-to-image skill for that."
---

# Prompt To Image

Generate prompt-based images with a bundled Node script that calls provider REST APIs directly.

This skill is for creating new images from prompts, and it also supports basic reference-image-guided generation for specific OpenAI and Gemini models. It is not for complex multi-step compositing workflows or rendering markdown into graphics.

## Use This Skill For

- OpenAI image generation with current GPT Image models such as `gpt-image-1.5` (default), `gpt-image-1`, or `gpt-image-1-mini`
- Gemini image generation with current Google image models such as `gemini-2.5-flash-image` (Nano Banana), `gemini-3.1-flash-image-preview` (Nano Banana 2), or `gemini-3-pro-image-preview` (Nano Banana Pro)
- Reference-image prompting and image edits when the provider/model supports it
- Single images or small batches of prompt variations
- Tasks where the user wants a local image file as output

## Do Not Use This Skill For

- Markdown, quote cards, code screenshots, or social post rendering from text blocks
  Use `markdown-to-image` instead.
- Heavy multi-step image-edit workflows, advanced compositing, or provider-agnostic reference pipelines
  This skill is deliberately simpler than `baoyu-image-gen`.

## Script Path

`SKILL_DIR/scripts/main.mjs`

Resolve `SKILL_DIR` as the directory containing this `SKILL.md`.

## Setup

Provide API keys via environment variables:

- `OPENAI_API_KEY` for OpenAI models
- `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini models

Aliases also supported by the script:

- `GOOGLE_API_KEY`
- `GEMINI_API_KEY`

Optional default model environment variables:

- `OPENAI_IMAGE_MODEL` default: `gpt-image-1.5`
- `GOOGLE_IMAGE_MODEL` or `GEMINI_IMAGE_MODEL` default: `gemini-2.5-flash-image`

Optional `.env` lookup paths:

- `<cwd>/.prompt-to-image/.env`
- `~/.prompt-to-image/.env`

The script uses those files as fallbacks beneath existing environment variables, and normalizes the Google key aliases.

No repo dependency changes are required. The script uses Node's built-in `fetch`.

## Quick Start

```bash
# Default provider selection prefers Google when both keys are present
node ${SKILL_DIR}/scripts/main.mjs \
  --prompt "A cinematic koi fish temple at sunrise" \
  --output out.png

# Force OpenAI with an explicit image model
node ${SKILL_DIR}/scripts/main.mjs \
  --provider openai \
  --model gpt-image-1.5 \
  --prompt "A paper-cut poster of a lunar rover in a desert" \
  --size 1536x1024 \
  --output rover.png

# Use Nano Banana / Gemini image generation
node ${SKILL_DIR}/scripts/main.mjs \
  --provider google \
  --model gemini-2.5-flash-image \
  --prompt "A charming ramen shop mascot, flat vector style" \
  --ar 4:5 \
  --output mascot.png

# Generate multiple concepts
node ${SKILL_DIR}/scripts/main.mjs \
  --provider openai \
  --prompt "Three different thumbnail concepts for a retro sci-fi podcast" \
  --n 3 \
  --output thumbnails/concept.png
```

## CLI Options

| Option | Description |
| --- | --- |
| `-p, --prompt <text>` | Inline prompt text |
| `--promptfiles <files...>` | Read prompt text from files and concatenate them |
| `--ref, --reference <files...>` | One or more reference images |
| `-o, --output <path>` | Output file path, or basename for multi-image runs |
| `--provider openai\|google` | Force provider selection |
| `-m, --model <id>` | Model override |
| `--size <WxH>` | Exact size, for OpenAI image models |
| `--ar, --aspect-ratio <W:H>` | Aspect ratio. Gemini 2.5 Flash Image supports ratios such as `1:1`, `4:5`, `9:16`, and `16:9` directly |
| `--n <count>` | Number of images to generate |
| `--quality <value>` | OpenAI provider option passthrough |
| `--style <value>` | OpenAI style passthrough, e.g. `vivid` or `natural` |
| `--timeout-ms <ms>` | Abort request after a timeout |
| `--json` | Print machine-readable metadata after saving files |

## Provider Selection

The script uses this order:

1. `--provider`, if provided
2. If only one provider key is available, use that provider
3. If both are available, default to Google because Nano Banana is the more flexible default here

## Model ID Cheat Sheet

When choosing a model, prefer the stable, commonly used IDs below unless the user explicitly requests something else.

### OpenAI: most common choices

- `gpt-image-1`
  Use when the user explicitly asks for it or when you need to match the older GPT Image pricing/performance tier.
- `gpt-image-1.5`
  Default choice for most OpenAI image generation tasks. Use this first for general-purpose text-to-image work.
- `gpt-image-1-mini`
  Use when the user explicitly wants a cheaper/faster GPT Image variant.

Preferred OpenAI default in this skill: `gpt-image-1.5`.

### Google Gemini: most common choices

- `gemini-2.5-flash-image`
  Default Nano Banana model. Use this first for most Gemini image generation tasks.
- `gemini-3.1-flash-image-preview`
  Also known as Nano Banana 2. It provides high-quality image generation and conversational editing at a mainstream price point and low latency. Treat it as the high-efficiency counterpart to Gemini 3 Pro Image when the user wants speed, lower cost, or high-volume developer workflows. Use when the user explicitly asks for Nano Banana 2 or wants a newer Gemini image variant.
- `gemini-3-pro-image-preview`
  Also known as Nano Banana Pro. Use when the user mentions Nano Banana Pro, or wants a more premium or instruction-heavy Gemini image model and explicitly asks for higher-end quality.

Preferred Google default in this skill: `gemini-2.5-flash-image`.

### Selection rules for the LLM using this skill

1. If the user names a model, use that exact model ID.
2. If the user asks for OpenAI image generation but does not name a model, start with `gpt-image-1.5`.
3. If the user asks for Gemini, Nano Banana, or Google image generation without naming a model, start with `gemini-2.5-flash-image`.
4. Only reach for `gpt-image-1.5`, `gpt-image-1-mini`, `gemini-3.1-flash-image-preview` (Nano Banana 2), or `gemini-3-pro-image-preview` (Nano Banana Pro) when the user asks for them or there is a clear reason to optimize for that tradeoff.

## Pricing Notes

Pricing changes over time. If cost matters, prefer checking the provider's current pricing page before quoting numbers externally.

### Current Google image pricing notes

Assume `1024x1024` pricing unless noted otherwise.

| Model | Pricing |
| --- | --- |
| `gemini-2.5-flash-image` | `$0.039` per image |
| `gemini-3.1-flash-image-preview` | `$0.067` per image |
| `gemini-3-pro-image-preview` | `$0.134` per image |

### Current OpenAI image pricing notes

Assume medium quality and `1024x1024` pricing.

| Model | Pricing |
| --- | --- |
| `gpt-image-1` | `$0.042` per image |
| `gpt-image-1.5` | `$0.034` per image |
| `gpt-image-1-mini` | `$0.011` per image |

These numbers were added from the providers' official pricing pages and should be treated as guidance, not permanent constants.

## Provider Notes

### OpenAI

- Default model: `gpt-image-1.5`
- Uses `POST /v1/images/generations`
- With `--ref`, uses `POST /v1/images/edits`
- Best when the user wants explicit image sizes like `1024x1024` or `1536x1024`
- Supports `--size`, `--n`, and OpenAI request fields such as `--quality` and `--style`
- If the user gives only an aspect ratio, the script maps that to the closest supported OpenAI size
- Reference images are supported in this skill for GPT Image models such as `gpt-image-1.5`, `gpt-image-1`, and `gpt-image-1-mini`

### Google Gemini Image ("Nano Banana")

- Default model: `gemini-2.5-flash-image`
- Uses `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
- `--ar` is sent in `generationConfig.imageConfig.aspectRatio`
- For `--n > 1`, the script makes sequential calls and asks for one distinct variation per call
- `--size` is not used for Nano Banana in this skill
- Reference images in this skill are supported for `gemini-3.1-flash-image-preview` and `gemini-3-pro-image-preview`

## Output Behavior

- If `--n 1`, `--output` is treated as the final file path; when no extension is provided, the script appends one
- If `--n > 1` and `--output` includes an extension, files are saved as `name-1.png`, `name-2.png`, etc.
- If `--n > 1` and `--output` has no extension, it is treated as a directory

## Reference Images

Use `--ref` or `--reference` to pass one or more source images.

This makes the skill compatible with `baoyu-xhs-images` style reference-image chains, where image 1 is generated first and later slides reuse image 1 as `--ref` for visual consistency.

Example with OpenAI edits:

```bash
node ${SKILL_DIR}/scripts/main.mjs \
  --provider openai \
  --model gpt-image-1.5 \
  --prompt "Turn this product photo into a clean editorial hero image" \
  --ref source.png \
  --output edited.png
```

Example with Gemini reference-image prompting:

```bash
node ${SKILL_DIR}/scripts/main.mjs \
  --provider google \
  --model gemini-3.1-flash-image-preview \
  --prompt "Keep the subject identity but restyle this as a cozy watercolor poster" \
  --ref character.png \
  --output poster.png
```

Selection rules:

1. For OpenAI + `--ref`, prefer GPT Image models such as `gpt-image-1.5`.
2. For Google + `--ref`, prefer `gemini-3.1-flash-image-preview` or `gemini-3-pro-image-preview`.
3. If the user wants consistent follow-on images from source art, use reference images instead of plain text-only prompting.

## Interop

`prompt-to-image` interoperates cleanly with both `baoyu-xhs-images` and `markdown-to-image`.

### With `baoyu-xhs-images`

Use `prompt-to-image` as the image generation engine behind the XHS workflow:

1. `baoyu-xhs-images` creates the cover and content prompt files
2. Generate image 1 without `--ref`
3. Generate images 2+ with `--ref <image-1>` for visual consistency

This works because `prompt-to-image` supports:

- `--promptfiles`
- `--ref`
- `--ar 3:4`
- `--quality 2k`

For the OpenAI path, `--quality 2k` is normalized to an OpenAI-compatible high-quality request.

### With `markdown-to-image`

Use `prompt-to-image` output as the visual layer for Inkframe:

1. Generate the image with `prompt-to-image`
2. Convert the saved image to a base64 data URL
3. Put that data URL into Inkframe design fields such as `backgroundImageUrl` or `contentBoxImageUrl`
4. Render the final card/poster with `markdown-to-image`

### All three together

Recommended pipeline:

1. `baoyu-xhs-images` handles Xiaohongshu-specific structure, style, and prompt planning
2. `prompt-to-image` renders the actual images
3. `markdown-to-image` composes branded summary cards, title cards, or text overlays using those generated images

Use this combined workflow when the user wants both AI-generated illustration and polished typographic composition.

## Working Style

1. Prefer concise but concrete prompts. Mention subject, style, composition, lighting, and mood.
2. Use `--size` when the user gives an exact output size and you are on OpenAI.
3. Use `--ar` when the user cares more about layout shape than exact pixel dimensions, especially on Gemini.
4. For multiple concepts, keep `--n` modest unless the user explicitly wants a large batch.
5. Save to a real file path and hand the user the created image file(s), not just console output.

## Error Handling

- Missing provider key: fail with a clear setup message
- No image returned: surface the provider response details if available
- Unsupported combination: prefer warning plus best-effort behavior, unless the request cannot work

## Test Prompts

These are good manual eval prompts for this skill:

1. `Create two square app icon concepts for a budgeting app called PennyTrail. Make them warm, simple, and premium.`
2. `Use Nano Banana to generate a vertical travel poster for Kyoto in rain, woodblock print style, lots of negative space.`
3. `Generate an OpenAI image for a YouTube thumbnail about debugging React hydration issues. High contrast, modern, readable composition.`
