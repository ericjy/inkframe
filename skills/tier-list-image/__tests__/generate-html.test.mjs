import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateHtmlFromSpec, resolveViewport } from "../scripts/generate-html.mjs";

const tempDirs = [];

async function withTempPaths(spec) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tier-list-test-"));
  tempDirs.push(tempDir);

  const specPath = path.join(tempDir, "spec.json");
  const outputPath = path.join(tempDir, "tier-list.html");

  await fs.writeFile(specPath, JSON.stringify(spec, null, 2), "utf8");

  return { specPath, outputPath };
}

async function renderSpec(spec) {
  const { specPath, outputPath } = await withTempPaths(spec);
  const result = await generateHtmlFromSpec({ specPath, outputPath });
  const html = await fs.readFile(outputPath, "utf8");
  return { html, result };
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0, tempDirs.length).map((dir) =>
      fs.rm(dir, { recursive: true, force: true }),
    ),
  );
});

describe("resolveViewport", () => {
  it("uses 4:5 and width 1600 by default", () => {
    expect(resolveViewport()).toEqual({
      label: "4:5",
      width: 1600,
      height: 2000,
    });
  });

  it("derives dimensions from explicit canvas values", () => {
    expect(resolveViewport({ aspectRatio: "16:9", width: 1600 })).toEqual({
      label: "16:9",
      width: 1600,
      height: 900,
    });

    expect(resolveViewport({ aspectRatio: "1:1", height: 1200 })).toEqual({
      label: "1:1",
      width: 1200,
      height: 1200,
    });
  });
});

describe("generateHtmlFromSpec", () => {
  it("renders default watermark, outer canvas padding, and deterministic grid layout", async () => {
    const { html, result } = await renderSpec({
      title: "Best AI Coding Tools",
      theme: "editorial",
      tiers: [
        {
          key: "S",
          label: "S Tier",
          color: "#ff5f6d",
          items: ["Codex", "Claude Code"],
        },
      ],
    });

    expect(result.viewport).toEqual({ width: 1600, height: 2000 });
    expect(result.aspectRatio).toBe("4:5");
    expect(html).toContain("Find the ");
    expect(html).toContain('<span class="watermark-highlight">tier-list-image</span>');
    expect(html).toContain(
      '<span class="watermark-highlight">github.com/ericjy/inkframe</span>',
    );
    expect(html).toContain("--frame-padding: calc(56px * var(--ui-scale));");
    expect(html).toContain(
      "grid-template-columns: repeat(var(--tier-columns, 3), minmax(0, 1fr));",
    );
    expect(html).toContain(".tier-item--title-only");
    expect(html).toMatch(/row row--detailed/);
    expect(html).toMatch(/--row-min-height:\d+/);
    expect(html).toContain('class="tier-item tier-item--title-only"');
  });

  it("supports watermark opt-out and string override", async () => {
    const withoutWatermark = await renderSpec({
      title: "No Watermark",
      watermark: false,
      tiers: [
        {
          key: "A",
          label: "A Tier",
          color: "#ff9f0a",
          items: ["Python"],
        },
      ],
    });

    expect(withoutWatermark.html).not.toContain(
      "github.com/ericjy/inkframe",
    );
    expect(withoutWatermark.html).not.toContain('<div class="watermark">');

    const customWatermark = await renderSpec({
      title: "Custom Watermark",
      watermark: "Custom watermark text",
      tiers: [
        {
          key: "B",
          label: "B Tier",
          color: "#ffdd00",
          items: ["Copilot"],
        },
      ],
    });

    expect(customWatermark.html).toContain("Custom watermark text");
  });

  it("respects explicit canvas geometry and explicit layout classes", async () => {
    const { html, result } = await renderSpec({
      title: "Layout Modes",
      canvas: {
        aspectRatio: "16:9",
        width: 1600,
        height: 900,
      },
      tiers: [
        {
          key: "A",
          label: "A Tier",
          color: "#ff9f0a",
          layout: "compact",
          items: ["Python", "TypeScript", "Go", "Rust"],
        },
        {
          key: "B",
          label: "B Tier",
          color: "#ffdd00",
          layout: "dense",
          items: ["JSON", "YAML", "Markdown", "HTML", "CSV", "SQLite"],
        },
      ],
    });

    expect(result.viewport).toEqual({ width: 1600, height: 900 });
    expect(result.aspectRatio).toBe("16:9");
    expect(html).toContain('style="--frame-width:1600px; --frame-height:900px; --ui-scale:1;"');
    expect(html).toMatch(/row row--compact/);
    expect(html).toMatch(/row row--dense/);
    expect(html).toContain("--tier-columns: 4;");
    expect(html).toContain("--tier-columns: 6;");
  });

  it("applies the requested theme class and ships distinct theme selectors", async () => {
    const { html } = await renderSpec({
      title: "Theme Check",
      theme: "gaming-neon",
      tiers: [
        {
          key: "S",
          label: "S Tier",
          color: "#ff5f6d",
          items: ["Codex"],
        },
      ],
    });

    expect(html).toContain('<body class="theme-gaming-neon">');
    expect(html).toContain("body.theme-classic .frame");
    expect(html).toContain("body.theme-editorial .frame");
    expect(html).toContain("body.theme-gaming-neon .frame");
  });

  it("supports custom Chinese ranking labels without remapping them to S/A/B", async () => {
    const { html } = await renderSpec({
      title: "中文榜单",
      tiers: [
        {
          key: "夯爆了",
          label: "夯爆了",
          color: "#ff5f6d",
          items: ["火锅"],
        },
        {
          key: "NPC",
          label: "NPC",
          color: "#3b82f6",
          items: ["白开水"],
        },
      ],
    });

    expect(html).toContain("中文榜单");
    expect(html).toContain("夯爆了");
    expect(html).toContain("NPC");
    expect(html).toContain("tier-key--medium");
    expect(html).toContain("--tier-label-width:140");
  });
});
