import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync } from "fs";
import { readArg, readDesignArg } from "../args.js";

const TMP_MD = "/tmp/inkframe-test-content.md";
const TMP_JSON = "/tmp/inkframe-test-design.json";

beforeEach(() => {
  writeFileSync(TMP_MD, "# Hello from file");
  writeFileSync(TMP_JSON, JSON.stringify({ backgroundKey: "ocean" }));
});

afterEach(() => {
  unlinkSync(TMP_MD);
  unlinkSync(TMP_JSON);
});

describe("readArg", () => {
  it("returns inline value as-is", () => {
    expect(readArg("# Hello World")).toBe("# Hello World");
  });

  it("reads file content when prefixed with @", () => {
    expect(readArg(`@${TMP_MD}`)).toBe("# Hello from file");
  });

  it("throws when @file does not exist", () => {
    expect(() => readArg("@/tmp/nonexistent.md")).toThrow("File not found: /tmp/nonexistent.md");
  });

  it("treats value without @ as inline even if it looks like a path", () => {
    expect(readArg("post.md")).toBe("post.md");
  });
});

describe("readDesignArg", () => {
  it("parses inline JSON string", () => {
    expect(readDesignArg('{"backgroundKey":"ocean"}')).toEqual({ backgroundKey: "ocean" });
  });

  it("reads and parses JSON from @file", () => {
    expect(readDesignArg(`@${TMP_JSON}`)).toEqual({ backgroundKey: "ocean" });
  });

  it("throws on invalid JSON string", () => {
    expect(() => readDesignArg("not-json")).toThrow("--design must be a JSON string");
  });

  it("throws when @file does not exist", () => {
    expect(() => readDesignArg("@/tmp/nonexistent.json")).toThrow("File not found");
  });

  it("throws on invalid JSON in file", () => {
    writeFileSync(TMP_JSON, "not valid json");
    expect(() => readDesignArg(`@${TMP_JSON}`)).toThrow("--design must be a JSON string");
  });
});
