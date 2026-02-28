import type { DocsLibrary, DocsPage, DocsProduct } from "../types";
import { getVisiblePages, getVisibleProducts } from "./doc-routing";

export interface RankedDocsSearchResult {
	product: DocsProduct;
	page: DocsPage;
	score: number;
}

const PRODUCT_ALIASES: Record<string, string[]> = {
	"wall-of-nostalgia": ["wall", "wall app", "user app", "beacon app"],
	"operations-dashboard": [
		"operations",
		"dashboard",
		"client portal",
		"portal",
		"admin",
		"ops",
	],
	"mirror-installations": [
		"mirrors",
		"mirror",
		"installation",
		"hardware",
		"kiosk",
	],
};

function normalizeForSearch(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/[-_/]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function normalizeToken(token: string) {
	const normalizedToken = normalizeForSearch(token);

	if (normalizedToken.length > 3 && normalizedToken.endsWith("ies")) {
		return normalizedToken.slice(0, -3) + "y";
	}

	if (normalizedToken.length > 3 && normalizedToken.endsWith("s")) {
		return normalizedToken.slice(0, -1);
	}

	return normalizedToken;
}

function tokenize(value: string) {
	return Array.from(
		new Set(
			normalizeForSearch(value)
				.split(" ")
				.map(normalizeToken)
				.filter((token) => token.length > 1),
		),
	);
}

function scorePhraseMatch(query: string, target: string) {
	if (!query || !target) {
		return 0;
	}

	if (target === query) {
		return 120;
	}

	if (target.startsWith(query)) {
		return 90;
	}

	if (target.includes(query)) {
		return 70;
	}

	return 0;
}

function scoreTokenCoverage(tokens: string[], target: string, perTokenScore: number) {
	if (tokens.length === 0 || !target) {
		return 0;
	}

	let score = 0;
	let matches = 0;

	for (const token of tokens) {
		if (target.includes(token)) {
			score += perTokenScore;
			matches += 1;
		}
	}

	if (matches === tokens.length) {
		score += 20;
	}

	return score;
}

function getAliases(product: DocsProduct) {
	return PRODUCT_ALIASES[product.slug] ?? [];
}

function scorePage(
	query: string,
	queryTokens: string[],
	product: DocsProduct,
	page: DocsPage,
	activeProductSlug?: string,
) {
	const normalizedTitle = normalizeForSearch(page.title);
	const normalizedCategory = normalizeForSearch(page.category);
	const normalizedSummary = normalizeForSearch(page.summary);
	const normalizedProductTitle = normalizeForSearch(product.title);
	const normalizedSlug = normalizeForSearch(page.slug);
	const aliases = getAliases(product).map(normalizeForSearch);

	let score = 0;

	score += scorePhraseMatch(query, normalizedTitle);
	score += scorePhraseMatch(query, normalizedSlug) > 0 ? 35 : 0;
	score += scorePhraseMatch(query, normalizedProductTitle) >= 70 ? 40 : 0;
	score += scorePhraseMatch(query, normalizedCategory) >= 70 ? 20 : 0;

	for (const keyword of page.searchKeywords) {
		const normalizedKeyword = normalizeForSearch(keyword);
		score += scorePhraseMatch(query, normalizedKeyword) >= 70 ? 45 : 0;
	}

	for (const alias of aliases) {
		score += scorePhraseMatch(query, alias) >= 70 ? 32 : 0;
	}

	score += scoreTokenCoverage(queryTokens, normalizedTitle, 28);
	score += scoreTokenCoverage(queryTokens, normalizedProductTitle, 16);
	score += scoreTokenCoverage(queryTokens, normalizedCategory, 12);
	score += scoreTokenCoverage(queryTokens, normalizedSummary, 8);

	for (const keyword of page.searchKeywords) {
		score += scoreTokenCoverage(queryTokens, normalizeForSearch(keyword), 14);
	}

	score += scoreTokenCoverage(queryTokens, page.searchBody, 4);

	if (queryTokens.length > 0 && queryTokens.every((token) => page.searchText.includes(token))) {
		score += 25;
	}

	if (activeProductSlug && product.slug === activeProductSlug) {
		score += 10;
	}

	return score;
}

export function rankDocumentationPages(
	library: DocsLibrary,
	searchQuery: string,
	activeProductSlug?: string,
) {
	const normalizedQuery = normalizeForSearch(searchQuery);
	if (!normalizedQuery) {
		return [] satisfies RankedDocsSearchResult[];
	}

	const queryTokens = tokenize(normalizedQuery);
	const results: RankedDocsSearchResult[] = [];

	for (const product of getVisibleProducts(library)) {
		for (const page of getVisiblePages(product)) {
			const score = scorePage(
				normalizedQuery,
				queryTokens,
				product,
				page,
				activeProductSlug,
			);

			if (score > 0) {
				results.push({ product, page, score });
			}
		}
	}

	return results.sort((left, right) => {
		if (right.score !== left.score) {
			return right.score - left.score;
		}

		return left.page.title.localeCompare(right.page.title);
	});
}
