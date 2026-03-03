import type { RenderOptions, RenderResult, Template } from "./types.js";

export const DEFAULT_BASE_URL = "https://inkframe.dev";
export const FREE_API_KEY = "sk-api-OMREKpyqNTPQTPIbXK5BFuSKLj8lEvTx";

export type InkframeConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export class InkframeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: InkframeConfig) {
    this.apiKey = config.apiKey ?? FREE_API_KEY;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
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
