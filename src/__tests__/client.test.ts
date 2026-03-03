import { describe, it, expect, vi, beforeEach } from "vitest";
import { InkframeClient, DEFAULT_BASE_URL } from "../client.js";

describe("InkframeClient", () => {
  it("uses DEFAULT_BASE_URL when no baseUrl provided", () => {
    const client = new InkframeClient({ apiKey: "test-key" });
    expect((client as any).baseUrl).toBe(DEFAULT_BASE_URL);
  });

  it("strips trailing slash from baseUrl", () => {
    const client = new InkframeClient({ apiKey: "test-key", baseUrl: "https://example.com/" });
    expect((client as any).baseUrl).toBe("https://example.com");
  });

  it("render sends correct request", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        renderId: "rndr_123",
        resultUrl: "https://example.com/result.png",
        fileType: "png",
        scale: 2,
        height: 1350,
        width: 1080,
        requestId: "req_abc",
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const client = new InkframeClient({ apiKey: "sk_test", baseUrl: "https://example.com" });
    const result = await client.render({ content: "# Hello" });

    expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/renders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk_test",
      },
      body: JSON.stringify({ content: "# Hello" }),
    });
    expect(result.renderId).toBe("rndr_123");
    expect(result.resultUrl).toBe("https://example.com/result.png");
  });

  it("render throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Insufficient credit balance for org" }),
    }));

    const client = new InkframeClient({ apiKey: "sk_test", baseUrl: "https://example.com" });
    await expect(client.render({ content: "# Hello" })).rejects.toThrow(
      "Insufficient credit balance for org"
    );
  });

  it("listTemplates sends correct request", async () => {
    const mockTemplates = [{ id: "tmpl_1", name: "Quote", content: "test", design: {} }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTemplates,
    }));

    const client = new InkframeClient({ apiKey: "sk_test", baseUrl: "https://example.com" });
    const templates = await client.listTemplates();

    expect(templates).toEqual(mockTemplates);
  });
});
