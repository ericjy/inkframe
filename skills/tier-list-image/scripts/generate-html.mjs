import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeTheme(theme) {
  if (theme === "editorial" || theme === "gaming-neon") {
    return theme;
  }
  return "classic";
}

export function resolveViewport({
  aspectRatio,
  width,
  height,
} = {}) {
  const value = aspectRatio ?? "4:5";
  const [ratioWidth, ratioHeight] = value.split(":").map(Number);
  const safeRatioWidth = ratioWidth || 4;
  const safeRatioHeight = ratioHeight || 5;

  if (width && height) {
    return {
      label: `${safeRatioWidth}:${safeRatioHeight}`,
      width,
      height,
    };
  }

  if (width) {
    return {
      label: `${safeRatioWidth}:${safeRatioHeight}`,
      width,
      height: Math.round((width * safeRatioHeight) / safeRatioWidth),
    };
  }

  if (height) {
    return {
      label: `${safeRatioWidth}:${safeRatioHeight}`,
      width: Math.round((height * safeRatioWidth) / safeRatioHeight),
      height,
    };
  }

  const baseWidth = 1600;
  return {
    label: `${safeRatioWidth}:${safeRatioHeight}`,
    width: baseWidth,
    height: Math.round((baseWidth * safeRatioHeight) / safeRatioWidth),
  };
}

function getBaseViewport(viewport) {
  if (viewport.width >= viewport.height) {
    return { width: 1600, height: 900 };
  }

  return { width: 1080, height: 1350 };
}

function renderSubtitle(subtitle) {
  if (!subtitle) {
    return "";
  }

  return `<p class="subtitle">${escapeHtml(subtitle)}</p>`;
}

function renderFooter(footer) {
  if (!footer) {
    return "";
  }

  return `<div class="footer">${escapeHtml(footer)}</div>`;
}

function renderWatermark(watermark) {
  if (watermark === false || watermark?.enabled === false) {
    return "";
  }

  if (typeof watermark === "string" && watermark.trim().length > 0) {
    return `<div class="watermark">${escapeHtml(watermark.trim())}</div>`;
  }

  return [
    '<div class="watermark">',
    '<span>Find the </span>',
    '<span class="watermark-highlight">tier-list-image</span>',
    '<span> skill at </span>',
    '<span class="watermark-highlight">github.com/ericjy/inkframe</span>',
    "</div>",
  ].join("");
}

function normalizeItem(item) {
  if (typeof item === "string") {
    return { title: item, description: "" };
  }

  return {
    title: item?.title ?? item?.name ?? "",
    description: item?.description ?? item?.subtitle ?? "",
  };
}

function isExplicitLayout(mode) {
  return mode === "detailed" || mode === "compact" || mode === "dense";
}

const HEADER_HEIGHT = 84;
const FOOTER_HEIGHT = 22;
const ROW_GAP = 12;

function getInitialTierLayoutMode(items, explicitMode) {
  if (isExplicitLayout(explicitMode)) {
    return explicitMode;
  }

  const count = items.length;
  if (count >= 12) {
    return "dense";
  }

  if (count >= 8) {
    return "compact";
  }

  return "detailed";
}

function estimateTierHeight(itemCount, mode) {
  if (itemCount <= 0) {
    return 84;
  }

  const config =
    mode === "dense"
      ? { columns: 6, cardHeight: 52, gap: 8, padding: 20, minHeight: 84 }
      : mode === "compact"
        ? { columns: 4, cardHeight: 68, gap: 10, padding: 24, minHeight: 92 }
        : { columns: 3, cardHeight: 84, gap: 12, padding: 32, minHeight: 104 };

  const rows = Math.ceil(itemCount / config.columns);
  const contentHeight = rows * config.cardHeight + (rows - 1) * config.gap + config.padding;

  return Math.max(config.minHeight, contentHeight);
}

function estimateBoardHeight(tiers, modes) {
  const rowsHeight = tiers.reduce((total, tier, index) => {
    const gap = index === 0 ? 0 : ROW_GAP;
    return total + gap + estimateTierHeight(tier.items.length, modes[index]);
  }, 0);

  return HEADER_HEIGHT + FOOTER_HEIGHT + rowsHeight;
}

function getNextRelaxedMode(mode) {
  if (mode === "dense") {
    return "compact";
  }

  if (mode === "compact") {
    return "detailed";
  }

  return mode;
}

function chooseTierLayoutModes(tiers, frameHeight) {
  const modes = tiers.map((tier) => getInitialTierLayoutMode(tier.items, tier.layout));
  const targetHeight = Math.floor(frameHeight * 0.86);

  while (estimateBoardHeight(tiers, modes) < targetHeight) {
    let candidateIndex = -1;

    for (let index = 0; index < tiers.length; index += 1) {
      if (isExplicitLayout(tiers[index].layout)) {
        continue;
      }

      const nextMode = getNextRelaxedMode(modes[index]);
      if (nextMode === modes[index]) {
        continue;
      }

      if (
        candidateIndex === -1 ||
        tiers[index].items.length > tiers[candidateIndex].items.length
      ) {
        candidateIndex = index;
      }
    }

    if (candidateIndex === -1) {
      break;
    }

    const nextMode = getNextRelaxedMode(modes[candidateIndex]);
    const nextModes = [...modes];
    nextModes[candidateIndex] = nextMode;

    if (estimateBoardHeight(tiers, nextModes) > frameHeight * 0.96) {
      break;
    }

    modes[candidateIndex] = nextMode;
  }

  return modes;
}

function getSparseTargetFillRatio(tierCount) {
  if (tierCount <= 3) {
    return 0.62;
  }

  if (tierCount === 4) {
    return 0.7;
  }

  if (tierCount === 5) {
    return 0.78;
  }

  return 0.84;
}

function getRowBonusCap(baseHeight, mode) {
  if (mode === "dense") {
    return Math.min(72, Math.round(baseHeight * 0.22));
  }

  if (mode === "compact") {
    return Math.min(96, Math.round(baseHeight * 0.3));
  }

  return Math.min(128, Math.round(baseHeight * 0.42));
}

function computeRowMinHeights(tiers, modes, frameHeight) {
  const baseHeights = tiers.map((tier, index) =>
    estimateTierHeight(tier.items.length, modes[index]),
  );
  const fixedHeight =
    HEADER_HEIGHT + FOOTER_HEIGHT + Math.max(0, tiers.length - 1) * ROW_GAP;
  const targetBoardHeight = Math.floor(
    frameHeight * getSparseTargetFillRatio(tiers.length),
  );
  const targetRowsHeight = Math.max(0, targetBoardHeight - fixedHeight);
  const baseRowsHeight = baseHeights.reduce((total, height) => total + height, 0);

  if (targetRowsHeight <= baseRowsHeight) {
    return baseHeights;
  }

  const extraHeight = targetRowsHeight - baseRowsHeight;
  const weights = baseHeights.map((height, index) => {
    const itemCount = tiers[index].items.length;
    const detailWeight = modes[index] === "detailed" ? 20 : modes[index] === "compact" ? 12 : 6;
    return height + itemCount * 18 + detailWeight;
  });
  const totalWeight = weights.reduce((total, weight) => total + weight, 0) || tiers.length;

  const bonuses = baseHeights.map((height, index) => {
    const rawBonus = Math.round((extraHeight * weights[index]) / totalWeight);
    return Math.min(rawBonus, getRowBonusCap(height, modes[index]));
  });

  return baseHeights.map((height, index) => height + Math.max(0, bonuses[index]));
}

function renderRows(tiers, frameHeight) {
  const modes = chooseTierLayoutModes(tiers, frameHeight);
  const rowMinHeights = computeRowMinHeights(tiers, modes, frameHeight);
  const maxKeyLength = tiers.reduce((max, tier) => {
    const length = Array.from(String(tier.key ?? "")).length;
    return Math.max(max, length);
  }, 1);
  const labelWidth =
    maxKeyLength <= 1 ? 84 : maxKeyLength <= 3 ? 140 : 176;
  return tiers
    .map((tier, index) => {
      const items = (Array.isArray(tier.items) ? tier.items : []).map(normalizeItem);
      const layoutMode = modes[index];
      const keyLength = Array.from(String(tier.key ?? "")).length;
      const keyClass =
        keyLength <= 1
          ? "tier-key"
          : keyLength <= 3
            ? "tier-key tier-key--medium"
            : "tier-key tier-key--long";
      const itemHtml = items
        .map((normalized) => {
          const hasDescription =
            layoutMode === "detailed" && Boolean(normalized.description);
          const description =
            hasDescription
              ? `<p class="tier-item-description">${escapeHtml(normalized.description)}</p>`
              : "";
          const itemClass = hasDescription ? "tier-item" : "tier-item tier-item--title-only";

          return `
            <article class="${itemClass}">
              <p class="tier-item-title">${escapeHtml(normalized.title)}</p>
              ${description}
            </article>
          `;
        })
        .join("");

      return `
        <article class="row row--${escapeHtml(layoutMode)}" style="--tier-accent:${escapeHtml(tier.color)}; --row-min-height:${rowMinHeights[index]}; --tier-label-width:${labelWidth};">
          <div class="tier-label">
            <p class="${keyClass}">${escapeHtml(tier.key)}</p>
            <p class="tier-name">${escapeHtml(tier.label)}</p>
          </div>
          <div class="tier-items">${itemHtml}</div>
        </article>
      `;
    })
    .join("");
}

async function readTemplate() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillDir = path.resolve(scriptDir, "..");
  const templatePath = path.join(skillDir, "assets", "template.html");
  return fs.readFile(templatePath, "utf8");
}

export async function generateHtmlFromSpec({
  specPath,
  outputPath,
}) {
  const template = await readTemplate();
  const spec = JSON.parse(await fs.readFile(path.resolve(specPath), "utf8"));

  if (!spec.title || !Array.isArray(spec.tiers) || spec.tiers.length === 0) {
    throw new Error("Spec must include a title and at least one tier.");
  }

  const canvas = spec.canvas ?? {};
  const resolvedViewport = resolveViewport({
    aspectRatio: canvas.aspectRatio ?? spec.aspectRatio,
    width: canvas.width,
    height: canvas.height,
  });
  const baseViewport = getBaseViewport(resolvedViewport);
  const uiScale = Math.max(
    1,
    Math.min(
      resolvedViewport.width / baseViewport.width,
      resolvedViewport.height / baseViewport.height,
    ),
  );
  const theme = normalizeTheme(spec.theme);
  const subtitle = renderSubtitle(spec.subtitle);
  const footer = renderFooter(spec.footer);
  const watermark = renderWatermark(spec.watermark);
  const normalizedTiers = spec.tiers.map((tier) => ({
    ...tier,
    items: Array.isArray(tier.items) ? tier.items : [],
  }));
  const rows = renderRows(normalizedTiers, resolvedViewport.height);

  const html = template
    .replaceAll("__THEME__", escapeHtml(theme))
    .replaceAll("__TITLE__", escapeHtml(spec.title))
    .replaceAll("__SUBTITLE__", subtitle)
    .replaceAll("__FOOTER__", footer)
    .replaceAll("__WATERMARK__", watermark)
    .replaceAll("__ROWS__", rows)
    .replace(
      "<html lang=\"en\">",
      `<html lang="en" style="--frame-width:${resolvedViewport.width}px; --frame-height:${resolvedViewport.height}px; --ui-scale:${uiScale};">`,
    );

  await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await fs.writeFile(path.resolve(outputPath), html, "utf8");

  return {
    outputPath: path.resolve(outputPath),
    aspectRatio: resolvedViewport.label,
    viewport: {
      width: resolvedViewport.width,
      height: resolvedViewport.height,
    },
  };
}

function printUsage() {
  console.log("Usage: node scripts/generate-html.mjs <spec.json> <output.html>");
}

async function main() {
  const args = process.argv.slice(2);
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    if (arg === "--help") {
      printUsage();
      return;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  const [inputPath, outputPath] = positional;

  if (!inputPath || !outputPath) {
    printUsage();
    process.exit(1);
  }

  const result = await generateHtmlFromSpec({
    specPath: inputPath,
    outputPath,
  });

  console.log(JSON.stringify(result, null, 2));
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
