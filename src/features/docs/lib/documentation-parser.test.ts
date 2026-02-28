import { describe, expect, it } from "vitest";
import { getDefaultDocsPath } from "./doc-routing";
import { parseDocumentation } from "./documentation-parser";

const SAMPLE_MARKDOWN = `
Intro text that should be ignored.

# Wall of Nostalgia

Wall intro copy.

## Documentation overview

Landing page paragraph.

## Overview

Simple overview paragraph.

## Key Concepts

| Term | Meaning |
| --- | --- |
| Beacon | Message |

## Needs Confirmation

Should never render as a visible page.

# Operations Dashboard

## Overview

Operations summary.

### Main areas

- Admin
- Client

# Mirror Installations

Mirror intro only.
`;

describe("parseDocumentation", () => {
	it("parses multiple top-level products", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);

		expect(library.products).toHaveLength(3);
		expect(library.products.map((product) => product.title)).toEqual([
			"Wall of Nostalgia",
			"Operations Dashboard",
			"Mirror Installations",
		]);
	});

	it("hides internal sections by title", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);
		const wallProduct = library.products[0];

		expect(wallProduct.pages.map((page) => [page.title, page.hidden])).toContainEqual([
			"Needs Confirmation",
			true,
		]);
	});

	it("creates a fallback overview page when a product has no explicit sections", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);
		const mirrorProduct = library.products[2];

		expect(mirrorProduct.pages).toHaveLength(1);
		expect(mirrorProduct.pages[0].slug).toBe("overview");
		expect(mirrorProduct.pages[0].markdown).toContain("Mirror intro only.");
	});

	it("removes markdown table separators from generated summaries", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);
		const keyConceptsPage = library.products[0].pages.find((page) => page.title === "Key Concepts");

		expect(keyConceptsPage?.summary).not.toContain("---");
		expect(keyConceptsPage?.summary).toContain("Term Meaning Beacon Message");
	});

	it("builds stable per-product slugs and heading ids", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);
		const operationsProduct = library.products[1];
		const overviewPage = operationsProduct.pages[0];

		expect(operationsProduct.slug).toBe("operations-dashboard");
		expect(overviewPage.slug).toBe("overview");
		expect(overviewPage.headings[0]).toMatchObject({
			id: "main-areas",
			title: "Main areas",
			level: 3,
		});
	});

	it("prefers documentation overview as the default landing page", () => {
		const library = parseDocumentation(SAMPLE_MARKDOWN);

		expect(getDefaultDocsPath(library)).toBe(
			"/docs/wall-of-nostalgia/documentation-overview",
		);
	});
});
