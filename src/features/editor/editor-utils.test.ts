import { describe, expect, it } from "vitest";

import { htmlToMarkdown, markdownToHtml } from "./markdown";
import { extractWikiLinks, wikiSuggestAt } from "./wiki";

describe("markdown round-trip", () => {
  it("keeps plain paragraphs intact", () => {
    expect(markdownToHtml("Hello world")).toBe("<p>Hello world</p>");
  });

  it("renders headings", () => {
    expect(markdownToHtml("## Title")).toBe("<h2>Title</h2>");
  });

  it("keeps wiki-link tokens as literal text", () => {
    expect(markdownToHtml("See [[Moonlight Citadel]] now")).toBe(
      "<p>See [[Moonlight Citadel]] now</p>",
    );
  });

  it("serializes a document back to markdown", () => {
    const md = htmlToMarkdown("<p><strong>Bold</strong> and <em>italic</em></p>");
    expect(md).toContain("**Bold**");
    expect(md).toContain("*italic*");
  });

  it("preserves wiki-link tokens through an html -> markdown round trip", () => {
    const md = htmlToMarkdown("<p>See [[Moonlight Citadel]] now</p>");
    expect(md).toBe("See [[Moonlight Citadel]] now");
  });
});

describe("extractWikiLinks", () => {
  it("extracts plain wiki links", () => {
    expect(extractWikiLinks("See [[World]] here")).toEqual([{ name: "World", label: "World" }]);
  });

  it("extracts aliased wiki links", () => {
    expect(extractWikiLinks("[[Nerezza Moonstone|Nerezza]]")).toEqual([
      { name: "Nerezza Moonstone", label: "Nerezza" },
    ]);
  });

  it("handles multiple links", () => {
    expect(extractWikiLinks("[[A]] and [[B|c]]")).toEqual([
      { name: "A", label: "A" },
      { name: "B", label: "c" },
    ]);
  });

  it("ignores malformed tokens", () => {
    expect(extractWikiLinks("no links here [[unclosed")).toEqual([]);
  });
});

describe("wikiSuggestAt", () => {
  it("returns the partial query after [[", () => {
    expect(wikiSuggestAt("See [[Moon")).toBe("Moon");
    expect(wikiSuggestAt("[[")).toBe("");
  });

  it("returns null without an open [[", () => {
    expect(wikiSuggestAt("See Moon")).toBeNull();
    expect(wikiSuggestAt("[[done]] ")).toBeNull();
  });

  it("does not match across newlines", () => {
    expect(wikiSuggestAt("one line\n[[Moon")).toBe("Moon");
    expect(wikiSuggestAt("one\n[[two\nthree")).toBeNull();
  });
});