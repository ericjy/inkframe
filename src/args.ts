import { existsSync, readFileSync } from "fs";

export function readArg(value: string): string {
  if (value.startsWith("@")) {
    const filePath = value.slice(1);
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return readFileSync(filePath, "utf-8");
  }
  return value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

export function readDesignArg(value: string): object {
  const raw = readArg(value);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("--design must be a JSON string or @path to a JSON file");
  }
}
