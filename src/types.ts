export type Design = {
  dimensionSpecKey?: string;
  backgroundKey?: string;
  backgroundImageUrl?: string;
  colorPaletteKey?: string;
  backgroundOverlayPresence?: "hidden" | "light" | "dark";
  contentBoxVisibility?: boolean;
  contentBoxWidth?: number;
  contentBoxAutoHeight?: boolean;
  contentBoxHeight?: number;
  contentBoxPadding?: number;
  contentBoxRoundness?: number;
  contentBoxTransparency?: number;
  contentBoxShadow?: number;
  contentBoxBorder?: number;
  contentVerticalAlignment?: "top" | "middle" | "bottom";
  contentBoxTitleBarStyle?: "none" | "window-controls";
  contentBoxImageUrl?: string;
  socialMediaIndicator?: "none" | "x" | "instagram" | "linkedin" | "reddit" | "rednote";
  bodyFontFamily?: string;
  headingFontFamily?: string;
  fontSize?: number;
  heading1FontSizeMultiplier?: number;
  heading2FontSizeMultiplier?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  listItemSpacing?: number;
  textAlignment?: "left" | "center" | "right" | "justify";
  textEffect?: "none" | "outline";
  codeBlockBackgroundVisibility?: boolean;
  codeBlockTheme?: "light" | "dark";
  brandName?: string;
  brandDescription?: string;
  brandLogoUrl?: string;
  brandQrCodeLink?: string;
  brandPresence?: "none" | "box-top" | "box-bottom" | "bottom";
  brandFontSize?: number;
  watermarkPresence?: "hidden" | "subtle" | "clear";
  textAnimation?: "none" | "typing";
  backgroundMusic?: "none" | "typing" | "upbeat";
  backgroundAnimation?: "none" | "move";
};

export type RenderOptions = {
  content: string;
  design?: Design;
  scale?: number;
  fileType?: "png" | "jpeg" | "webp";
};

export type RenderResult = {
  renderId: string;
  resultUrl: string;
  fileType: string;
  scale: number;
  height: number;
  width: number;
  requestId: string;
};

export type Template = {
  id: string;
  name: string;
  description?: string;
  design: Design;
};
