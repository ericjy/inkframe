import { Command } from "commander";

declare const __CLI_VERSION__: string;
import { writeFileSync } from "fs";
import { exec } from "child_process";
import { InkframeClient, DEFAULT_BASE_URL } from "./client.js";
import { readArg, readDesignArg } from "./args.js";

const PLAYGROUND_BASE_URL = "https://www.inkframe.dev";

function openUrl(url: string): void {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} ${JSON.stringify(url)}`);
}

function getApiKey(): string | undefined {
  return process.env.INKFRAME_API_KEY;
}


const program = new Command();

program
  .name("inkframe")
  .description("Render beautiful visual images from markdown content")
  .version(__CLI_VERSION__);

program
  .command("render")
  .description("Render an image from markdown content")
  .option("-c, --content <content>", "Inline markdown or @file.md to read from a file")
  .option("-t, --template <templateId>", "Template ID to use as the design")
  .option("-d, --design <design>", "Inline design JSON or @file.json (overrides --template)")
  .option("-o, --output <output>", "Save image to file (e.g. out.png). Prints URL if omitted.")
  .option("-s, --scale <scale>", "Scale factor: 1, 2, or 3", "2")
  .option("-f, --file-type <fileType>", "Output format: png, jpeg, webp", "png")
  .option("--base-url <baseUrl>", "API base URL", DEFAULT_BASE_URL)
  .action(async (options) => {
    const client = new InkframeClient({ apiKey: getApiKey(), baseUrl: options.baseUrl });
    let content = options.content ? readArg(options.content) : undefined;

    let design = options.design ? readDesignArg(options.design) : undefined;

    if (options.template) {
      const templates = await client.listTemplates({ exclude: ["thumbnailUrl"] });
      const template = templates.find((t) => t.id === options.template);
      if (!template) {
        console.error(`Error: Template "${options.template}" not found`);
        process.exit(1);
      }
      if (!design) design = template.design;
      if (!content) content = template.content;
    }

    if (!content) {
      console.error("Error: --content is required when --template is not specified");
      process.exit(1);
    }

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

const templatesCmd = program
  .command("templates")
  .description("Manage templates");

templatesCmd
  .command("list")
  .description("List available templates")
  .option("--base-url <baseUrl>", "API base URL", DEFAULT_BASE_URL)
  .action(async (options) => {
    const client = new InkframeClient({ apiKey: getApiKey(), baseUrl: options.baseUrl });

    try {
      const templates = await client.listTemplates({ exclude: ["thumbnailUrl"] });
      if (templates.length === 0) {
        console.log("No templates found");
        return;
      }
      for (const t of templates) {
        console.log(`${t.id}  ${t.name}`);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

templatesCmd
  .command("get <templateId>")
  .description("Get full template JSON by ID")
  .option("--design-only", "Output only the design object, not the full template")
  .option("-o, --output <output>", "Save to file. Prints to stdout if omitted.")
  .option("--base-url <baseUrl>", "API base URL", DEFAULT_BASE_URL)
  .action(async (templateId, options) => {
    const client = new InkframeClient({ apiKey: getApiKey(), baseUrl: options.baseUrl });

    try {
      const templates = await client.listTemplates({ exclude: ["thumbnailUrl"] });
      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        console.error(`Error: Template "${templateId}" not found`);
        process.exit(1);
      }

      const json = JSON.stringify(options.designOnly ? template.design : template, null, 2);

      if (options.output) {
        writeFileSync(options.output, json);
        console.log(`Saved: ${options.output}`);
      } else {
        console.log(json);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command("open")
  .description("Open the Inkframe playground in your browser with pre-populated content")
  .option("-c, --content <content>", "Inline markdown or @file.md to read from a file")
  .option("-d, --design <design>", "Inline design JSON or @file.json")
  .option("--base-url <baseUrl>", "Playground base URL", PLAYGROUND_BASE_URL)
  .action((options) => {
    const params = new URLSearchParams();

    if (options.content) {
      const content = readArg(options.content);
      params.set("content", Buffer.from(content, "utf-8").toString("base64"));
    }

    if (options.design) {
      const design = readDesignArg(options.design);
      params.set("design", Buffer.from(JSON.stringify(design), "utf-8").toString("base64"));
    }

    const query = params.toString();
    const url = `${options.baseUrl}/playground${query ? `?${query}` : ""}`;
    console.log(url);
    openUrl(url);
  });

program.parse();
