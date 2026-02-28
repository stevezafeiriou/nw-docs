import { parseDocumentation } from "../lib/documentation-parser";
import type { DocsLibrary } from "../types";

const DOCUMENTATION_URL = "/documentation.md";
const STORAGE_KEY = "nw-docs:documentation";

let documentationCache: DocsLibrary | null = null;

function canUseStorage() {
	return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function parseAndStore(markdown: string) {
	const parsedDocument = parseDocumentation(markdown);
	documentationCache = parsedDocument;

	if (canUseStorage()) {
		window.sessionStorage.setItem(STORAGE_KEY, markdown);
	}

	return parsedDocument;
}

export function peekDocumentationCache() {
	if (documentationCache) {
		return documentationCache;
	}

	if (!canUseStorage()) {
		return null;
	}

	const cachedMarkdown = window.sessionStorage.getItem(STORAGE_KEY);
	if (!cachedMarkdown) {
		return null;
	}

	return parseAndStore(cachedMarkdown);
}

export async function loadDocumentation(forceNetwork = false) {
	if (!forceNetwork) {
		const cachedDocument = peekDocumentationCache();
		if (cachedDocument) {
			return cachedDocument;
		}
	}

	const response = await fetch(DOCUMENTATION_URL, {
		cache: "no-cache",
		headers: {
			accept: "text/markdown,text/plain;q=0.9,*/*;q=0.8",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to load documentation (${response.status})`);
	}

	const markdown = await response.text();
	return parseAndStore(markdown);
}
