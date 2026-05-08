import { describe, expect, test } from "bun:test";
import { findCodeInContent, generateCode, CODE_ALPHABET } from "../src/app";

describe("findCodeInContent — substring matching across user-typed messages", () => {
  const STORED = new Set(["A4YTAP"]);
  const cases: { name: string; content: string; expected: string | null }[] = [
    { name: "exact uppercase",                       content: "A4YTAP",                expected: "A4YTAP" },
    { name: "exact lowercase",                       content: "a4ytap",                expected: "A4YTAP" },
    { name: "exact mixed case",                      content: "a4YtAp",                expected: "A4YTAP" },
    { name: "prefix uppercase",                      content: "preffixA4YTAP",         expected: "A4YTAP" },
    { name: "prefix lowercase",                      content: "preffixa4ytap",         expected: "A4YTAP" },
    { name: "suffix uppercase",                      content: "A4YTAPsuffix",          expected: "A4YTAP" },
    { name: "suffix lowercase",                      content: "a4ytapsuffix",          expected: "A4YTAP" },
    { name: "prefix + suffix uppercase",             content: "preffixA4YTAPsuffix",   expected: "A4YTAP" },
    { name: "prefix + suffix lowercase",             content: "preffixa4ytapsuffix",   expected: "A4YTAP" },
    { name: "embedded in natural sentence",          content: "Hi, my code is A4YTAP, thanks!", expected: "A4YTAP" },
    { name: "embedded with newlines and emoji",      content: "code:\nA4YTAP 🎉",      expected: "A4YTAP" },
    { name: "no code at all",                        content: "neki tekst bez koda",   expected: null },
    { name: "almost code (one char short)",          content: "A4YTA",                 expected: null },
    { name: "wrong code (not in stored set)",        content: "ZZZZZZ",                expected: null },
    { name: "ambiguous chars don't matter",          content: "0OIIL5SBZ A4YTAP",      expected: "A4YTAP" },
    { name: "empty string",                          content: "",                      expected: null },
  ];

  for (const c of cases) {
    test(c.name, () => {
      expect(findCodeInContent(c.content, STORED)).toBe(c.expected);
    });
  }

  test("matches first stored code when multiple are present", () => {
    const stored = new Set(["AAAAAA", "BBBBBB"]);
    // Iteration order is insertion order — AAAAAA wins
    const result = findCodeInContent("xxx BBBBBB yyy AAAAAA zzz", stored);
    expect(result).toBe("AAAAAA");
  });

  test("returns null for empty stored set", () => {
    expect(findCodeInContent("anything goes A4YTAP", new Set())).toBeNull();
  });
});

describe("generateCode", () => {
  test("emits codes from the safe alphabet only", () => {
    const existing = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const code = generateCode({ codeLen: 6, existing });
      expect(code).toHaveLength(6);
      for (const ch of code) {
        expect(CODE_ALPHABET).toContain(ch);
      }
      existing.add(code);
    }
  });

  test("respects requested length", () => {
    expect(generateCode({ codeLen: 4, existing: new Set() })).toHaveLength(4);
    expect(generateCode({ codeLen: 8, existing: new Set() })).toHaveLength(8);
  });

  test("never returns an existing code", () => {
    // Stuff the existing set with a single shape; demand a new one.
    const existing = new Set(["AAAAAA"]);
    for (let i = 0; i < 100; i++) {
      const fresh = generateCode({ codeLen: 6, existing });
      expect(fresh).not.toBe("AAAAAA");
    }
  });

  test("avoids ambiguous characters (0/O, 1/I/L, 5/S, 8/B, 2/Z)", () => {
    const banned = ["0", "O", "1", "I", "L", "5", "S", "8", "B", "2", "Z"];
    for (const b of banned) {
      expect(CODE_ALPHABET).not.toContain(b);
    }
  });
});
