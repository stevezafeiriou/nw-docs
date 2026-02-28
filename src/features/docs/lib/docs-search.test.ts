import { describe, expect, it } from "vitest";
import { parseDocumentation } from "./documentation-parser";
import { rankDocumentationPages } from "./docs-search";

const SEARCH_SAMPLE_MARKDOWN = `
# Wall of Nostalgia

## Documentation overview

Landing content.

## Beacon credits

Credits guide for beacon activity.

### Credit expiration

Credits expire after inactivity.

# Operations Dashboard

## Client Billing

Portal billing tools for clients and subscriptions.

### Billing exports

Export payment history.

# Mirror Installations

## Hardware setup

Mirror hardware installation steps.
`;

describe("rankDocumentationPages", () => {
	it("prioritizes title matches over weaker body matches", () => {
		const library = parseDocumentation(SEARCH_SAMPLE_MARKDOWN);
		const results = rankDocumentationPages(library, "billing");

		expect(results[0]?.page.title).toBe("Client Billing");
	});

	it("finds pages from subsection heading matches", () => {
		const library = parseDocumentation(SEARCH_SAMPLE_MARKDOWN);
		const results = rankDocumentationPages(library, "expiration");

		expect(results[0]?.page.title).toBe("Beacon credits");
	});

	it("supports product aliases in search", () => {
		const library = parseDocumentation(SEARCH_SAMPLE_MARKDOWN);
		const results = rankDocumentationPages(library, "portal");

		expect(results[0]?.product.title).toBe("Operations Dashboard");
	});
});
