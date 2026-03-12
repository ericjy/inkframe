import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { generateHtmlFromSpec } from "./generate-html.mjs";

function parseNumber(name, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return parsed;
}

function printUsage() {
  console.log(`Usage: node scripts/render-tier-list.mjs --spec <spec.json> --out <image.png> [options]

Options:
  --spec <path>           Required. Tier-list spec JSON.
  --out <path>            Required. Final screenshot path.
  --html-out <path>       Optional. Keep generated HTML at this path.
  --session <name>        Optional. agent-browser session name. Default tierlist-render.
  --wait-ms <ms>          Optional. Delay before screenshot. Default 300.
  --browser-path <path>   Optional. Pass through to agent-browser --executable-path.
  --print-metadata        Optional. Print machine-readable result metadata to stdout.
  --help                  Show this help.
`);
}

function parseArgs(argv) {
  const options = {
    session: "tierlist-render",
    waitMs: 300,
    printMetadata: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "--print-metadata") {
      options.printMetadata = true;
      continue;
    }

    const next = argv[index + 1];
    if (!arg.startsWith("--")) {
      throw new Error(`Unknown positional argument: ${arg}`);
    }

    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}.`);
    }

    if (arg === "--spec") {
      options.spec = next;
    } else if (arg === "--out") {
      options.out = next;
    } else if (arg === "--html-out") {
      options.htmlOut = next;
    } else if (arg === "--session") {
      options.session = next;
    } else if (arg === "--wait-ms") {
      options.waitMs = parseNumber("--wait-ms", next);
    } else if (arg === "--browser-path") {
      options.browserPath = next;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  return options;
}

async function runAgentBrowser(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("agent-browser", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `agent-browser ${args.join(" ")} failed with exit code ${code}.\n${stderr || stdout}`.trim(),
        ),
      );
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.spec || !options.out) {
    printUsage();
    process.exit(1);
  }

  const htmlPath =
    options.htmlOut ??
    path.join(os.tmpdir(), `tier-list-${Date.now()}-${process.pid}.html`);
  const keepHtml = Boolean(options.htmlOut);

  const htmlResult = await generateHtmlFromSpec({
    specPath: options.spec,
    outputPath: htmlPath,
  });

  const sharedFlags = ["--session", options.session];
  if (options.browserPath) {
    sharedFlags.push("--executable-path", options.browserPath);
  }

  const fileUrl = `file://${htmlResult.outputPath}`;

  try {
    await runAgentBrowser([...sharedFlags, "--allow-file-access", "open", fileUrl]);
    await runAgentBrowser([
      ...sharedFlags,
      "set",
      "viewport",
      String(htmlResult.viewport.width),
      String(htmlResult.viewport.height),
    ]);
    if (options.waitMs > 0) {
      await runAgentBrowser([...sharedFlags, "wait", String(options.waitMs)]);
    }
    await fs.mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
    await runAgentBrowser([...sharedFlags, "screenshot", path.resolve(options.out)]);
  } catch (error) {
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\nMake sure agent-browser is installed and initialized with 'agent-browser install'.`,
    );
  } finally {
    try {
      await runAgentBrowser([...sharedFlags, "close"]);
    } catch {
      // ignore cleanup failure
    }

    if (!keepHtml) {
      await fs.rm(htmlPath, { force: true }).catch(() => {});
    }
  }

  const result = {
    imagePath: path.resolve(options.out),
    htmlPath: keepHtml ? path.resolve(htmlPath) : null,
    aspectRatio: htmlResult.aspectRatio,
    viewport: htmlResult.viewport,
    session: options.session,
  };

  if (options.printMetadata) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Saved screenshot: ${result.imagePath}`);
  if (result.htmlPath) {
    console.log(`Saved HTML: ${result.htmlPath}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
