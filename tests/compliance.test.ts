import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Substrings from the private fundraising deck that must never ship to the
// public site (real names, unsourced hard numbers, named-competitor ratings,
// fundraising/market amounts). See docs/superpowers/specs for the rationale.
const BANNED = [
  "李承泽",
  "总师签字",
  "等待总师",
  "XX-3",
  "99.2",
  "ROI 37",
  "年省",
  "1200w",
  "Epsilon3",
  "Synera",
  "8-15 亿",
  "200-400",
  "500-1200",
  "2000-5000",
  "765 亿",
  "22.4",
  "33 月",
  "$20B",
  "104 颗",
  "104 satellites",
];

function collectFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...collectFiles(p, exts));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

describe("compliance: no fundraising-deck leakage on the public site", () => {
  const files = [
    ...collectFiles("messages", [".json"]),
    ...collectFiles("components", [".tsx"]),
  ];
  for (const f of files) {
    it(`${f} has no banned strings`, () => {
      const text = readFileSync(f, "utf8");
      const hits = BANNED.filter((b) => text.includes(b));
      expect(hits, `banned strings in ${f}: ${hits.join(", ")}`).toEqual([]);
    });
  }
});
