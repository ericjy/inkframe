# Inkframe Design Options Reference

All fields are optional. Pass only the ones you want to customize. Defaults are shown where applicable.

<!-- Auto-generated from smarkly-webapp source types. Do not edit manually. -->
<!-- Regenerate with: npx tsx scripts/generate-design-docs.ts -->

## Table of Contents
- [Dimensions](#dimensions)
- [Backgrounds](#backgrounds)
- [Color Palettes](#color-palettes)
- [Content Box](#content-box)
- [Typography](#typography)
- [Branding](#branding)
- [Social & Watermark](#social--watermark)
- [Animation & Audio](#animation--audio)

---

## Dimensions

**Field:** `dimensionSpecKey` (default: `"instagram-4:5"`)

### Flexible
| Key | Width | Label |
|-----|-------|-------|
| `autoheight-1080width` | 1080px | Flexible Height - Narrow Width |
| `autoheight-1200width` | 1200px | Flexible Height - Medium Width |
| `autoheight-1600width` | 1600px | Flexible Height - Wide Width |

### Facebook
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `facebook-9:16` | 1080x1350 | 4:5 | Facebook Post - Portrait |
| `facebook-1:1` | 1200x1200 | 1:1 | Facebook Post - Square |
| `facebook-1.91:1` | 1200x630 | 1.91:1 | Facebook Post - Landscape |
| `facebook-story` | 1080x1920 | 9:16 | Facebook Story |

### Instagram
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `instagram-4:5` | 1080x1350 | 4:5 | Instagram Post - Portrait |
| `instagram-1:1` | 1080x1080 | 1:1 | Instagram Post - Square |
| `instagram-16:9` | 1080x566 | 16:9 | Instagram Post - Landscape |
| `instagram-9:16` | 1080x1920 | 9:16 | Instagram Story |

### LinkedIn
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `linkedin-1:1` | 1080x1080 | 1:1 | LinkedIn Carousel |
| `linkedin-1.91:1` | 1200x630 | 1.91:1 | LinkedIn Post - Landscape |

### Pinterest
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `pinterest-2:3` | 1200x1800 | 2:3 | Pinterest Pin - Portrait |
| `pinterest-1:1` | 1000x1000 | 1:1 | Pinterest Pin - Square |

### RedNote
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `rednote-3:4` | 1080x1440 | 3:4 | RedNote Post - Portrait |
| `rednote-3:5` | 1440x2400 | 3:5 | RedNote Post - Long Portrait |
| `rednote-1:1` | 1080x1080 | 1:1 | RedNote Post - Square |
| `rednote-4:3` | 1440x1080 | 4:3 | RedNote Post - Landscape |

### Reddit
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `reddit-4:5` | 1080x1350 | 4:5 | Reddit Post - Portrait |
| `reddit-1:1` | 1080x1080 | 1:1 | Reddit Post - Square |

### TikTok
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `tiktok-9:16` | 1080x1920 | 9:16 | TikTok Carousel Image |

### X
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `x-4:5` | 1080x1350 | 4:5 | X Post - Portrait |
| `x-1:1` | 1080x1080 | 1:1 | X Post - Square |
| `x-16:9` | 1600x566 | 16:9 | X Post - Landscape |
| `x-16:21` | 1600x2100 | 16:21 | X Post - Wide Portrait |

### YouTube
| Key | Size | Ratio | Label |
|-----|------|-------|-------|
| `youtube-1:1` | 1080x1080 | 1:1 | YouTube Community Post |

---

## Backgrounds

**Field:** `backgroundKey` (default: `"tropical"`)

### Gradients
| Key | Name |
|-----|------|
| `tropical` | Tropical |
| `pastel` | Pastel |
| `newsprint` | Newsprint |
| `sunset` | Sunset |
| `ocean` | Ocean |
| `forest` | Forest |
| `lavender` | Lavender |
| `sunrise` | Sunrise |
| `twilight` | Twilight |
| `meadow` | Meadow |
| `coral` | Coral |
| `arctic` | Arctic |
| `desert` | Desert |
| `galaxy` | Galaxy |
| `autumn` | Autumn |
| `neon` | Neon |

### Solid Colors
| Key | Name |
|-----|------|
| `white` | White |
| `black` | Black |
| `gray` | Gray |
| `beige` | Beige |
| `light-beige` | Light Beige |
| `ivory` | Ivory |
| `off-white` | Off White |
| `navy-blue` | Navy Blue |
| `red` | Red |
| `blue` | Blue |
| `green` | Green |
| `yellow` | Yellow |
| `purple` | Purple |
| `pink` | Pink |
| `indigo` | Indigo |
| `teal` | Teal |
| `orange` | Orange |

### Patterns
| Key | Name |
|-----|------|
| `notebook-pattern` | Notebook |
| `crosshatch-pattern` | Crosshatch |
| `graph-paper-pattern` | Graph Paper |
| `diagonal-stripes` | Diagonal Stripes |
| `polka-dots-pattern` | Polka Dots |
| `aged-paper-pattern` | Aged Paper |
| `temple-pattern` | Temple |
| `jigsaw-pattern` | Jigsaw |
| `circuit-board-pattern` | Circuit Board |

**Other background fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `backgroundImageUrl` | string | `""` | Custom background image URL (overrides `backgroundKey`) |
| `backgroundOverlayPresence` | `"hidden"` \| `"light"` \| `"dark"` | `"hidden"` | Overlay on background for readability |
| `backgroundAnimation` | `"none"` \| `"move"` | `"none"` | Animate the background (video output) |

---

## Color Palettes

**Field:** `colorPaletteKey` (default: `"pure-white"`)

Color palettes control the content box text, background, and accent colors.

### Light Theme
| Key | Name | Background |
|-----|------|------------|
| `soft-sky` | Soft Sky | #F2F6FC |
| `pure-white` | Pure White | #FFFFFF |
| `light-gray` | Light Gray | #F2F2F2 |
| `ivory-linen` | Ivory Linen | #FFFFF7 |
| `pale-sage` | Pale Sage | #F2F4EB |
| `blush-pink` | Blush Pink | #FFF6F6 |
| `lavender-mist` | Lavender Mist | #F5EFFF |
| `mint-green` | Mint Green | #E8F7F2 |
| `soft-buttercream` | Soft Buttercream | #FFF9E5 |
| `coral-peach` | Coral Peach | #FFF0EB |

### Dark Theme
| Key | Name | Background |
|-----|------|------------|
| `pitch-black` | Pitch Black | #000000 |
| `dark-charcoal` | Dark Charcoal | #1C1C1C |
| `deep-forest` | Deep Forest | #002200 |
| `dark-plum` | Dark Plum | #2B002D |
| `burnt-orange` | Burnt Orange | #3C1600 |
| `ocean-blue` | Ocean Blue | #001E3F |
| `forest-green` | Forest Green | #003300 |
| `crimson-red` | Crimson Red | #290000 |
| `midnight-blue` | Midnight Blue | #000033 |
| `royal-eggplant` | Royal Eggplant | #2C001F |

**Custom colors:** You can also pass `customColorPalette` with fields: `contentBoxTextColor`, `contentBoxBackgroundColor`, `contentBoxPrimaryColor`, `contentBoxSecondaryColor`, `contentBoxAccentColor` (all hex strings).

---

## Content Box

The content box is the card/container that holds your rendered markdown.

| Field | Type | Range | Default | Description |
|-------|------|-------|---------|-------------|
| `contentBoxVisibility` | boolean | — | `true` | Show/hide the content box |
| `contentBoxWidth` | number | 0.1–1.0 | `0.85` | Width as fraction of image |
| `contentBoxAutoHeight` | boolean | — | `true` | Auto-size height to fit content |
| `contentBoxHeight` | number | 0.1–1.0 | `0.85` | Height fraction (when autoHeight is false) |
| `contentBoxPadding` | number | 1–4 | `2` | Inner padding |
| `contentBoxRoundness` | number | 0–4 | `1` | Corner radius |
| `contentBoxTransparency` | number | 0–1 | `0.2` | 0 = opaque, 1 = fully transparent |
| `contentBoxShadow` | number | 0–1 | `0` | Drop shadow intensity |
| `contentBoxBorder` | number | 0–15 | `0` | Border width |
| `contentVerticalAlignment` | enum | — | `"middle"` | `"top"` \| `"middle"` \| `"bottom"` |
| `contentBoxTitleBarStyle` | enum | — | `"none"` | `"none"` \| `"window-controls"` (macOS dots) |
| `contentBoxImageUrl` | string | — | `""` | Background image for the box itself |

---

## Typography

### Available Fonts

**Sans-serif:** `Inter`, `Roboto`, `Roboto Condensed`, `Encode Sans Condensed`, `Fira Sans`, `Lato`, `Montserrat`, `Nunito`, `Poppins`

**Serif:** `Lora`, `Mate`

**Monospace:** `Roboto Mono`, `Inconsolata`, `Liberation Mono`

**Handwriting/Display:** `Satisfy`, `Caveat`, `志莽行书`, `龙仓`

### Font Fields

| Field | Type | Range | Default | Description |
|-------|------|-------|---------|-------------|
| `bodyFontFamily` | string | see above | `"Mate"` | Body text font |
| `headingFontFamily` | string | see above | `"Roboto Condensed"` | Heading font |
| `fontSize` | number | 0.5–3 | `1` | Base font size |
| `heading1FontSizeMultiplier` | number | 0.5–3 | `1` | H1 size multiplier |
| `heading2FontSizeMultiplier` | number | 0.5–3 | `1` | H2 size multiplier |
| `fontWeight` | enum | — | `"medium"` | `"normal"` \| `"medium"` \| `"semibold"` \| `"bold"` |
| `listItemSpacing` | number | 0.5–2 | `1` | Spacing between list items |
| `textAlignment` | enum | — | `"left"` | `"left"` \| `"center"` \| `"right"` \| `"justify"` |
| `textEffect` | enum | — | `"none"` | `"none"` \| `"outline"` |
| `codeBlockBackgroundVisibility` | boolean | — | `true` | Show background behind code blocks |
| `codeBlockTheme` | enum | — | `"dark"` | `"light"` \| `"dark"` |

---

## Branding

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `brandName` | string | `""` | Brand/company name |
| `brandDescription` | string | `""` | Tagline or subtitle |
| `brandLogoUrl` | string | `""` | URL to logo image |
| `brandQrCodeLink` | string | `""` | URL to encode as QR code |
| `brandPresence` | enum | `"none"` | `"none"` \| `"box-top"` \| `"box-bottom"` \| `"bottom"` |
| `brandFontSize` | number | `1` | Brand text size (0.5–3) |

---

## Social & Watermark

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `socialMediaIndicator` | enum | `"none"` | `"none"` \| `"x"` \| `"instagram"` \| `"linkedin"` \| `"reddit"` \| `"rednote"` |
| `watermarkPresence` | enum | `"clear"` | `"hidden"` \| `"subtle"` \| `"clear"` |

---

## Animation & Audio

These fields apply to video/animated output:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `textAnimation` | enum | `"none"` | `"none"` \| `"typing"` |
| `backgroundMusic` | enum | `"none"` | `"none"` \| `"typing"` \| `"upbeat"` |
| `backgroundAnimation` | enum | `"none"` | `"none"` \| `"move"` |
