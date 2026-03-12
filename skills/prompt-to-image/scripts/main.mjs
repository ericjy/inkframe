import path from "node:path";
import process from "node:process";
import { homedir } from "node:os";
import { mkdir, readFile, writeFile } from "node:fs/promises";

function printUsage() {
  console.log(`Usage:
  node skills/prompt-to-image/scripts/main.mjs --prompt "A fox astronaut" --output fox.png

Options:
  -p, --prompt <text>               Prompt text
  --promptfiles <files...>          Read prompt from files (concatenated)
  --ref, --reference <files...>     Reference images for editing or conditioning
  -o, --output <path>               Output file path or basename/directory
  --provider google|openai          Force provider
  -m, --model <id>                  Model ID override
  --size <WxH>                      Exact image size (OpenAI only)
  --ar, --aspect-ratio <W:H>        Aspect ratio
  --n <count>                       Number of images (default: 1)
  --quality <value>                 OpenAI quality passthrough
  --style <value>                   OpenAI style passthrough
  --timeout-ms <ms>                 Abort after timeout
  --json                            Print metadata JSON
  -h, --help                        Show help

Environment variables:
  OPENAI_API_KEY
  OPENAI_IMAGE_MODEL
  GOOGLE_GENERATIVE_AI_API_KEY
  GOOGLE_API_KEY
  GEMINI_API_KEY
  GOOGLE_IMAGE_MODEL
  GEMINI_IMAGE_MODEL`);
}

function parseArgs(argv) {
  const args = {
    prompt: null,
    promptFiles: [],
    referenceImages: [],
    output: null,
    provider: null,
    model: null,
    size: null,
    aspectRatio: null,
    n: 1,
    quality: null,
    style: null,
    timeoutMs: null,
    json: false,
    help: false,
  };

  const positional = [];

  const takeMany = (index) => {
    const items = [];
    let cursor = index + 1;
    while (cursor < argv.length) {
      const value = argv[cursor];
      if (!value || value.startsWith("-")) break;
      items.push(value);
      cursor += 1;
    }
    return { items, next: cursor - 1 };
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token) continue;

    if (token === "-h" || token === "--help") {
      args.help = true;
      continue;
    }

    if (token === "--json") {
      args.json = true;
      continue;
    }

    if (token === "-p" || token === "--prompt") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${token}`);
      args.prompt = value;
      index += 1;
      continue;
    }

    if (token === "--promptfiles") {
      const { items, next } = takeMany(index);
      if (items.length === 0) throw new Error("Missing files for --promptfiles");
      args.promptFiles.push(...items);
      index = next;
      continue;
    }

    if (token === "--ref" || token === "--reference") {
      const { items, next } = takeMany(index);
      if (items.length === 0) throw new Error(`Missing files for ${token}`);
      args.referenceImages.push(...items);
      index = next;
      continue;
    }

    if (token === "-o" || token === "--output") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${token}`);
      args.output = value;
      index += 1;
      continue;
    }

    if (token === "--provider") {
      const value = argv[index + 1];
      if (value !== "google" && value !== "openai") {
        throw new Error(`Invalid provider: ${value}`);
      }
      args.provider = value;
      index += 1;
      continue;
    }

    if (token === "-m" || token === "--model") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${token}`);
      args.model = value;
      index += 1;
      continue;
    }

    if (token === "--size") {
      const value = argv[index + 1];
      if (!value) throw new Error("Missing value for --size");
      args.size = value;
      index += 1;
      continue;
    }

    if (token === "--ar" || token === "--aspect-ratio") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${token}`);
      args.aspectRatio = value;
      index += 1;
      continue;
    }

    if (token === "--n") {
      const value = argv[index + 1];
      if (!value) throw new Error("Missing value for --n");
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed < 1) throw new Error(`Invalid count: ${value}`);
      args.n = parsed;
      index += 1;
      continue;
    }

    if (token === "--quality") {
      const value = argv[index + 1];
      if (!value) throw new Error("Missing value for --quality");
      args.quality = value;
      index += 1;
      continue;
    }

    if (token === "--style") {
      const value = argv[index + 1];
      if (!value) throw new Error("Missing value for --style");
      args.style = value;
      index += 1;
      continue;
    }

    if (token === "--timeout-ms") {
      const value = argv[index + 1];
      if (!value) throw new Error("Missing value for --timeout-ms");
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed < 1) throw new Error(`Invalid timeout: ${value}`);
      args.timeoutMs = parsed;
      index += 1;
      continue;
    }

    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    }

    positional.push(token);
  }

  if (!args.prompt && positional.length > 0) {
    args.prompt = positional.join(" ");
  }

  return args;
}

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    const env = {};

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }

    return env;
  } catch {
    return {};
  }
}

async function loadEnv() {
  const locations = [
    path.join(homedir(), ".prompt-to-image", ".env"),
    path.join(process.cwd(), ".prompt-to-image", ".env"),
  ];

  for (const location of locations) {
    const env = await loadEnvFile(location);
    for (const [key, value] of Object.entries(env)) {
      if (!process.env[key]) process.env[key] = value;
    }
  }

  const googleApiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    null;

  if (googleApiKey) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||= googleApiKey;
    process.env.GOOGLE_API_KEY ||= googleApiKey;
    process.env.GEMINI_API_KEY ||= googleApiKey;
  }
}

async function buildPrompt(args) {
  const parts = [];

  if (args.prompt) {
    parts.push(args.prompt);
  }

  for (const filePath of args.promptFiles) {
    parts.push(await readFile(filePath, "utf8"));
  }

  const prompt = parts.join("\n\n").trim();
  if (!prompt) {
    throw new Error("A prompt is required. Use --prompt or --promptfiles.");
  }

  return prompt;
}

function getAbortSignal(timeoutMs) {
  if (!timeoutMs) return undefined;
  return AbortSignal.timeout(timeoutMs);
}

async function postJson(url, headers, body, timeoutMs) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
    signal: getAbortSignal(timeoutMs),
  });

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText}: ${json ? JSON.stringify(json) : text}`
    );
  }

  if (!json) {
    throw new Error("Provider returned a non-JSON response.");
  }

  return json;
}

async function fetchBinary(url, timeoutMs) {
  const response = await fetch(url, { signal: getAbortSignal(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Failed to download generated image: HTTP ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/png";
}

async function readImageReference(filePath) {
  const bytes = await readFile(filePath);
  return {
    filePath,
    bytes,
    base64: bytes.toString("base64"),
    mimeType: getMimeType(filePath),
  };
}

function buildOpenAIUrl() {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/g, "");
  if (base.endsWith("/images/generations")) {
    return base;
  }
  return `${base}/images/generations`;
}

function resolveProvider(args) {
  if (args.provider) return args.provider;

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGoogle = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (hasGoogle && !hasOpenAI) return "google";
  if (hasOpenAI && !hasGoogle) return "openai";
  if (hasGoogle) return "google";

  throw new Error(
    "No image provider credentials found. Set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY."
  );
}

function normalizeModel(model, provider) {
  const prefixes = [`${provider}/`, "models/"];
  let normalized = model.trim();
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
    }
  }
  return normalized;
}

function resolveModel(args, provider) {
  if (args.model) return normalizeModel(args.model, provider);

  if (provider === "openai") {
    return process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
  }

  return (
    process.env.GOOGLE_IMAGE_MODEL ||
    process.env.GEMINI_IMAGE_MODEL ||
    "gemini-2.5-flash-image"
  );
}

function parseAspectRatio(aspectRatio) {
  if (!aspectRatio) return null;
  const match = aspectRatio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const width = Number.parseFloat(match[1]);
  const height = Number.parseFloat(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function normalizeOpenAIQuality(quality) {
  if (!quality) return null;
  if (quality === "2k") return "high";
  if (quality === "normal") return "medium";
  return quality;
}

function getOpenAISize(model, args) {
  if (args.size) return args.size;

  const parsed = parseAspectRatio(args.aspectRatio);
  if (!parsed) return "1024x1024";

  const ratio = parsed.width / parsed.height;
  const isDalle3 = model.includes("dall-e-3");

  if (Math.abs(ratio - 1) < 0.1) return "1024x1024";
  if (ratio > 1) return isDalle3 ? "1792x1024" : "1536x1024";
  return isDalle3 ? "1024x1792" : "1024x1536";
}

async function generateWithOpenAI(prompt, model, args) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for OpenAI image generation.");
  }

  if (args.referenceImages.length > 0) {
    return generateWithOpenAIReferences(prompt, model, args, apiKey);
  }

  const body = {
    model,
    prompt,
    n: args.n,
    size: getOpenAISize(model, args),
  };

  const normalizedQuality = normalizeOpenAIQuality(args.quality);
  if (normalizedQuality) {
    body.quality = normalizedQuality;
  }

  if (args.style) {
    body.style = args.style;
  }

  const result = await postJson(
    buildOpenAIUrl(),
    { Authorization: `Bearer ${apiKey}` },
    body,
    args.timeoutMs
  );

  const images = [];
  for (const item of result.data ?? []) {
    if (item.b64_json) {
      images.push({
        bytes: Uint8Array.from(Buffer.from(item.b64_json, "base64")),
        mediaType: "image/png",
      });
      continue;
    }

    if (item.url) {
      images.push({
        bytes: await fetchBinary(item.url, args.timeoutMs),
        mediaType: "image/png",
      });
      continue;
    }
  }

  if (images.length === 0) {
    throw new Error("OpenAI did not return any images.");
  }

  return {
    images,
    meta: {
      usage: result.usage ?? null,
      revised_prompts: (result.data ?? [])
        .map((item) => item.revised_prompt || item.revisedPrompt || null)
        .filter(Boolean),
    },
  };
}

async function generateWithOpenAIReferences(prompt, model, args, apiKey) {
  if (!model.startsWith("gpt-image-1")) {
    throw new Error(
      "Reference images with OpenAI in this skill require a GPT Image model such as gpt-image-1.5, gpt-image-1, or gpt-image-1-mini."
    );
  }

  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);

  if (args.size) {
    form.append("size", args.size);
  }

  const normalizedQuality = normalizeOpenAIQuality(args.quality);
  if (normalizedQuality) {
    form.append("quality", normalizedQuality);
  }

  if (args.n > 1) {
    form.append("n", String(args.n));
  }

  for (const referencePath of args.referenceImages) {
    const reference = await readImageReference(referencePath);
    form.append(
      "image[]",
      new Blob([reference.bytes], { type: reference.mimeType }),
      path.basename(reference.filePath)
    );
  }

  const response = await fetch(buildOpenAIEditsUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
    signal: getAbortSignal(args.timeoutMs),
  });

  const text = await response.text();
  let result = null;
  try {
    result = JSON.parse(text);
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText}: ${result ? JSON.stringify(result) : text}`
    );
  }

  const images = [];
  for (const item of result?.data ?? []) {
    if (item.b64_json) {
      images.push({
        bytes: Uint8Array.from(Buffer.from(item.b64_json, "base64")),
        mediaType: "image/png",
      });
      continue;
    }

    if (item.url) {
      images.push({
        bytes: await fetchBinary(item.url, args.timeoutMs),
        mediaType: "image/png",
      });
    }
  }

  if (images.length === 0) {
    throw new Error("OpenAI did not return any edited images.");
  }

  return {
    images,
    meta: {
      mode: "edits",
      revised_prompts: (result?.data ?? [])
        .map((item) => item.revised_prompt || item.revisedPrompt || null)
        .filter(Boolean),
    },
  };
}

function buildGooglePrompt(basePrompt, args, index) {
  if (args.n === 1) return basePrompt;
  return `${basePrompt}\n\nCreate variation ${index + 1} of ${args.n}. Keep it clearly distinct from the others.`;
}

function supportsGeminiReferenceImages(model) {
  return (
    model === "gemini-3.1-flash-image-preview" ||
    model === "gemini-3-pro-image-preview"
  );
}

function extractGoogleImages(result) {
  const images = [];

  for (const candidate of result.candidates ?? []) {
    const parts = candidate?.content?.parts ?? [];
    for (const part of parts) {
      const inlineData = part.inlineData || part.inline_data || null;
      if (!inlineData?.data) continue;
      const mimeType = inlineData.mimeType || inlineData.mime_type || "image/png";
      images.push({
        bytes: Uint8Array.from(Buffer.from(inlineData.data, "base64")),
        mediaType: mimeType,
      });
    }
  }

  return images;
}

async function generateWithGoogle(prompt, model, args) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for Gemini image generation.");
  }

  if (args.referenceImages.length > 0 && !supportsGeminiReferenceImages(model)) {
    throw new Error(
      "Reference images with Gemini in this skill are supported for gemini-3.1-flash-image-preview and gemini-3-pro-image-preview."
    );
  }

  const images = [];

  for (let index = 0; index < args.n; index += 1) {
    const generationConfig = {};
    if (args.aspectRatio) {
      generationConfig.imageConfig = {
        aspectRatio: args.aspectRatio,
      };
    }

    const parts = [];
    if (args.referenceImages.length > 0) {
      for (const referencePath of args.referenceImages) {
        const reference = await readImageReference(referencePath);
        parts.push({
          inline_data: {
            mime_type: reference.mimeType,
            data: reference.base64,
          },
        });
      }
    }
    parts.push({ text: buildGooglePrompt(prompt, args, index) });

    const result = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      { "x-goog-api-key": apiKey },
      {
        contents: [
          {
            parts,
          },
        ],
        generationConfig,
      },
      args.timeoutMs
    );

    const generated = extractGoogleImages(result);
    const image = generated[0];
    if (!image) {
      throw new Error(`Gemini model "${model}" returned no image for variation ${index + 1}.`);
    }

    images.push(image);
  }

  return {
    images,
    meta: null,
  };
}

function buildOpenAIEditsUrl() {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/g, "");
  if (base.endsWith("/images/edits")) {
    return base;
  }
  return `${base}/images/edits`;
}

function getFileExtension(mediaType, fallback = ".png") {
  if (mediaType === "image/jpeg") return ".jpg";
  if (mediaType === "image/webp") return ".webp";
  if (mediaType === "image/gif") return ".gif";
  if (mediaType === "image/png") return ".png";
  return fallback;
}

function resolveOutputPath(baseOutput, index, total, mediaType) {
  const extension = getFileExtension(mediaType, path.extname(baseOutput) || ".png");
  const outputExtension = path.extname(baseOutput);

  if (total === 1) {
    return outputExtension ? baseOutput : `${baseOutput}${extension}`;
  }

  if (outputExtension) {
    const directory = path.dirname(baseOutput);
    const baseName = path.basename(baseOutput, outputExtension);
    return path.join(directory, `${baseName}-${index + 1}${extension}`);
  }

  return path.join(baseOutput, `image-${index + 1}${extension}`);
}

async function saveImages(images, output) {
  const saved = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (!image) continue;

    const filePath = resolveOutputPath(output, index, images.length, image.mediaType);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, image.bytes);
    saved.push({ path: filePath, mediaType: image.mediaType });
  }

  return saved;
}

async function main() {
  await loadEnv();
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  if (!args.output) {
    throw new Error("An output path is required. Use --output <path>.");
  }

  const prompt = await buildPrompt(args);
  const provider = resolveProvider(args);
  const model = resolveModel(args, provider);

  if (provider === "google" && args.size) {
    console.error("Warning: --size is ignored for Gemini 2.5 Flash Image. Use --ar instead.");
  }

  if (provider === "google" && args.quality) {
    console.error("Warning: --quality is only passed through for OpenAI.");
  }

  if (provider === "google" && args.style) {
    console.error("Warning: --style is only passed through for OpenAI.");
  }

  if (provider === "google" && args.referenceImages.length > 0) {
    console.error(
      "Warning: Gemini reference-image support in this skill is scoped to gemini-3.1-flash-image-preview and gemini-3-pro-image-preview."
    );
  }

  const result =
    provider === "openai"
      ? await generateWithOpenAI(prompt, model, args)
      : await generateWithGoogle(prompt, model, args);

  const savedImages = await saveImages(result.images, args.output);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          provider,
          model,
          prompt,
          saved_images: savedImages,
          provider_meta: result.meta,
        },
        null,
        2
      )
    );
    return;
  }

  for (const image of savedImages) {
    console.log(image.path);
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }

  process.exit(1);
});
