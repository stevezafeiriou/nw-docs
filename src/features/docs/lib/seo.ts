const DEFAULT_SITE_NAME = "Nostalgie World Docs";
const DEFAULT_DESCRIPTION =
	"Official documentation for the Nostalgie World platform, client operations tools, and physical mirror installations.";

function upsertMetaTag(
	selector: string,
	createAttributes: Record<string, string>,
	content: string,
) {
	let element = document.head.querySelector<HTMLMetaElement>(selector);

	if (!element) {
		element = document.createElement("meta");
		for (const [key, value] of Object.entries(createAttributes)) {
			element.setAttribute(key, value);
		}
		document.head.appendChild(element);
	}

	element.setAttribute("content", content);
}

function upsertLinkTag(
	selector: string,
	createAttributes: Record<string, string>,
	href: string,
) {
	let element = document.head.querySelector<HTMLLinkElement>(selector);

	if (!element) {
		element = document.createElement("link");
		for (const [key, value] of Object.entries(createAttributes)) {
			element.setAttribute(key, value);
		}
		document.head.appendChild(element);
	}

	element.setAttribute("href", href);
}

function normalizeDescription(text?: string) {
	if (!text) {
		return DEFAULT_DESCRIPTION;
	}

	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[`*_>#-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function setSeoMetadata(options: {
	title: string;
	description?: string;
	path?: string;
	robots?: string;
}) {
	const description = normalizeDescription(options.description);
	const canonicalUrl = new URL(
		options.path ?? window.location.pathname,
		window.location.origin,
	).toString();

	document.title = options.title;

	upsertMetaTag('meta[name="description"]', { name: "description" }, description);
	upsertMetaTag('meta[name="robots"]', { name: "robots" }, options.robots ?? "index,follow");
	upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, options.title);
	upsertMetaTag(
		'meta[property="og:description"]',
		{ property: "og:description" },
		description,
	);
	upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, "website");
	upsertMetaTag(
		'meta[property="og:site_name"]',
		{ property: "og:site_name" },
		DEFAULT_SITE_NAME,
	);
	upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
	upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
	upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, options.title);
	upsertMetaTag(
		'meta[name="twitter:description"]',
		{ name: "twitter:description" },
		description,
	);
	upsertLinkTag('link[rel="canonical"]', { rel: "canonical" }, canonicalUrl);
}

export function getSiteName() {
	return DEFAULT_SITE_NAME;
}

export function getDefaultDescription() {
	return DEFAULT_DESCRIPTION;
}
