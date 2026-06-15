import { createHash } from "node:crypto";

export function normalizeTextForFingerprint(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createContentFingerprint(parts: string[]): string {
  const normalized = normalizeTextForFingerprint(parts.filter(Boolean).join(" "));

  return createHash("sha256").update(normalized).digest("hex");
}
