import type { RenderOptions, RenderResult, Template } from "./types.js";

export type InkframeConfig = {
  apiKey: string;
  baseUrl?: string;
};

export class InkframeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: InkframeConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://smarkly.com").replace(/\/$/, "");
  }

  async render(options: RenderOptions): Promise<RenderResult> {
    const response = await fetch(`${this.baseUrl}/api/renders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `HTTP ${response.status}`);
    }
    return data as RenderResult;
  }

  async listTemplates(): Promise<Template[]> {
    const response = await fetch(`${this.baseUrl}/api/templates`, {
      headers: { "x-api-key": this.apiKey },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `HTTP ${response.status}`);
    }
    return data as Template[];
  }
}
