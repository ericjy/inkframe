import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { InkframeClient } from "./client.js";

const DEFAULT_BASE_URL = "https://smarkly.com";

function getApiKey(): string {
  const key = process.env.INKFRAME_API_KEY;
  if (!key) {
    console.error("Error: INKFRAME_API_KEY environment variable is not set");
    process.exit(1);
  }
  return key;
}

function readContentArg(value: string): string {
  if (existsSync(value)) {
    return readFileSync(value, "utf-8");
  }
  return value;
}

function readDesignArg(value: string): object {
  if (existsSync(value)) {
    return JSON.parse(readFileSync(value, "utf-8"));
  }
  try {
    return JSON.parse(value);
  } catch {
    console.error("Error: --design must be a valid JSON string or path to a JSON file");
    process.exit(1);
  }
}

const program = new Command();

program
  .name("inkframe")
  .description("Render beautiful visual images from markdown content")
  .version("0.1.0");

program
  .command("render")
  .description("Render an image from markdown content")
  .requiredOption("-c, --content <content>", "Markdown content or path to a .md file")
  .option("-d, --design <design>", "Design JSON string or path to a JSON file")
  .option("-o, --output <output>", "Save image to file (e.g. out.png). Prints URL if omitted.")
  .option("-s, --scale <scale>", "Scale factor: 1, 2, or 3", "2")
  .option("-f, --file-type <fileType>", "Output format: png, jpeg, webp", "png")
  .option("--base-url <baseUrl>", "API base URL", DEFAULT_BASE_URL)
  .action(async (options) => {
    const client = new InkframeClient({ apiKey: getApiKey(), baseUrl: options.baseUrl });
    const content = readContentArg(options.content);
    const design = options.design ? readDesignArg(options.design) : undefined;

    try {
      const result = await client.render({
        content,
        design,
        scale: parseFloat(options.scale),
        fileType: options.fileType,
      });

      if (options.output) {
        const imgResponse = await fetch(result.resultUrl);
        const buffer = await imgResponse.arrayBuffer();
        writeFileSync(options.output, Buffer.from(buffer));
        console.log(`Saved: ${options.output} (${result.width}x${result.height})`);
      } else {
        console.log(result.resultUrl);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command("templates")
  .description("List available templates")
  .option("--base-url <baseUrl>", "API base URL", DEFAULT_BASE_URL)
  .action(async (options) => {
    const client = new InkframeClient({ apiKey: getApiKey(), baseUrl: options.baseUrl });

    try {
      const templates = await client.listTemplates();
      if (templates.length === 0) {
        console.log("No templates found");
        return;
      }
      for (const t of templates) {
        const desc = t.description ? `  — ${t.description}` : "";
        console.log(`${t.id}  ${t.name}${desc}`);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
