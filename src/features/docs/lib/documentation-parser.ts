import type { DocsHeading, DocsLibrary, DocsPage, DocsProduct } from "../types";
import { slugify } from "./slug";

const HEADING_CLEANUP_PATTERN = /[*_`#[\]]/g;
const HIDDEN_SECTION_TITLES = new Set([
	"needs confirmation",
	"internal notes",
	"draft",
	"open questions",
]);

function createUniqueSlug(value: string, counts: Map<string, number>) {
	const baseSlug = slugify(value) || "section";
	const currentCount = counts.get(baseSlug) ?? 0;
	counts.set(baseSlug, currentCount + 1);

	return currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`;
}

function isTableSeparatorLine(line: string) {
	const trimmedLine = line.trim();
	return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmedLine);
}

function isHorizontalRule(line: string) {
	return /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function normalizeTitle(title: string) {
	return title.replace(HEADING_CLEANUP_PATTERN, "").trim();
}

function plainText(markdown: string) {
	return markdown
		.split("\n")
		.filter((line) => !isTableSeparatorLine(line) && !isHorizontalRule(line))
		.join("\n")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^>\s?/gm, "")
		.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/\|/g, " ")
		.replace(HEADING_CLEANUP_PATTERN, "")
		.replace(/\s+/g, " ")
		.trim();
}

function inferCategory(title: string) {
	const normalizedTitle = title.toLowerCase();

	if (
		/(overview|concept|architecture|permission|role|data model|integration|glossary)/.test(
			normalizedTitle,
		)
	) {
		return "Foundation";
	}

	if (/(getting started|setup|how it works|workflow|common tasks)/.test(normalizedTitle)) {
		return "Guides";
	}

	if (/(troubleshooting|faq|question|support|reference)/.test(normalizedTitle)) {
		return "Support";
	}

	return "More";
}

function buildSectionSummary(markdown: string, title: string) {
	const text = plainText(markdown);
	if (text.length === 0) {
		return `Reference for ${title}.`;
	}

	const summary = text.split(/(?<=[.!?])\s+/)[0] ?? text;
	return summary.slice(0, 180);
}

function buildHeadings(markdown: string) {
	const headings: DocsHeading[] = [];
	const headingCounts = new Map<string, number>();

	for (const line of markdown.split("\n")) {
		const match = /^(###|####)\s+(.+)$/.exec(line.trim());
		if (!match) {
			continue;
		}

		const level = match[1].length as 3 | 4;
		const title = normalizeTitle(match[2]);
		headings.push({
			id: createUniqueSlug(title, headingCounts),
			level,
			title,
		});
	}

	return headings;
}

function buildSearchKeywords(
	title: string,
	category: string,
	headings: DocsHeading[],
	summary: string,
) {
	return Array.from(
		new Set(
			[
				title,
				category,
				summary,
				...headings.map((heading) => heading.title),
			]
				.map((value) => plainText(value).toLowerCase())
				.filter(Boolean),
		),
	);
}

function createPage(
	productSlug: string,
	title: string,
	markdown: string,
	pageSlugCounts: Map<string, number>,
): DocsPage {
	const normalizedTitle = normalizeTitle(title);
	const slug = createUniqueSlug(normalizedTitle, pageSlugCounts);
	const hidden = HIDDEN_SECTION_TITLES.has(normalizedTitle.toLowerCase());
	const category = inferCategory(normalizedTitle);
	const cleanedMarkdown = markdown.trim();
	const headings = buildHeadings(markdown);
	const bodyText = plainText(markdown).toLowerCase();
	const summary = buildSectionSummary(markdown, normalizedTitle);

	return {
		id: `${productSlug}-${slug}`,
		title: normalizedTitle,
		slug,
		category,
		summary,
		markdown: cleanedMarkdown,
		headings,
		searchText: `${normalizedTitle} ${bodyText}`.toLowerCase(),
		searchKeywords: buildSearchKeywords(normalizedTitle, category, headings, summary),
		searchBody: bodyText,
		productSlug,
		hidden,
	};
}

function buildProduct(
	title: string,
	introLines: string[],
	pages: Array<{ title: string; markdown: string }>,
	productSlugCounts: Map<string, number>,
): DocsProduct | null {
	const normalizedTitle = normalizeTitle(title);
	if (!normalizedTitle) {
		return null;
	}

	const slug = createUniqueSlug(normalizedTitle, productSlugCounts);
	const intro = introLines.join("\n").trim();
	const pageSlugCounts = new Map<string, number>();
	const normalizedPages =
		pages.length > 0
			? pages.map((page) =>
					createPage(slug, page.title, page.markdown, pageSlugCounts),
				)
			: [
					createPage(
						slug,
						"Overview",
						intro || `# ${normalizedTitle}`,
						pageSlugCounts,
					),
				];
	const visiblePages = normalizedPages.filter((page) => !page.hidden);

	if (visiblePages.length === 0) {
		return null;
	}

	return {
		id: slug,
		title: normalizedTitle,
		slug,
		intro,
		pages: normalizedPages,
		categories: Array.from(new Set(visiblePages.map((page) => page.category))),
	};
}

export function parseDocumentation(markdown: string): DocsLibrary {
	const normalizedMarkdown = markdown.replace(/\r\n/g, "\n").trim();
	const productSlugCounts = new Map<string, number>();
	const products: DocsProduct[] = [];

	let currentProductTitle = "";
	let currentProductIntroLines: string[] = [];
	let currentPages: Array<{ title: string; markdown: string }> = [];
	let currentPageTitle = "";
	let currentPageLines: string[] = [];
	let hasStartedProducts = false;

	function pushCurrentPage() {
		if (!currentPageTitle) {
			return;
		}

		currentPages.push({
			title: currentPageTitle,
			markdown: currentPageLines.join("\n").trim(),
		});

		currentPageTitle = "";
		currentPageLines = [];
	}

	function pushCurrentProduct() {
		pushCurrentPage();

		if (!currentProductTitle) {
			return;
		}

		const product = buildProduct(
			currentProductTitle,
			currentProductIntroLines,
			currentPages,
			productSlugCounts,
		);

		if (product) {
			products.push(product);
		}

		currentProductTitle = "";
		currentProductIntroLines = [];
		currentPages = [];
	}

	for (const line of normalizedMarkdown.split("\n")) {
		const trimmedLine = line.trim();
		const productMatch = /^#\s+(.+)$/.exec(trimmedLine);
		if (productMatch) {
			pushCurrentProduct();
			currentProductTitle = productMatch[1];
			hasStartedProducts = true;
			continue;
		}

		if (!hasStartedProducts) {
			continue;
		}

		const pageMatch = /^##\s+(.+)$/.exec(trimmedLine);
		if (pageMatch) {
			pushCurrentPage();
			currentPageTitle = pageMatch[1];
			continue;
		}

		if (currentPageTitle) {
			currentPageLines.push(line);
		} else {
			currentProductIntroLines.push(line);
		}
	}

	pushCurrentProduct();

	if (products.length === 0) {
		return {
			title: "Documentation",
			products: [],
		};
	}

	return {
		title: "Documentation",
		products,
	};
}
