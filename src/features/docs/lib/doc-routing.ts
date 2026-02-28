import type { DocsLibrary, DocsProduct } from "../types";

export function getVisiblePages(product: DocsProduct) {
	return product.pages.filter((page) => !page.hidden);
}

export function getVisibleProducts(library: DocsLibrary) {
	return library.products.filter((product) => getVisiblePages(product).length > 0);
}

export function getDefaultPage(library: DocsLibrary) {
	for (const product of getVisibleProducts(library)) {
		const documentationOverviewPage = getVisiblePages(product).find(
			(page) => page.title.toLowerCase() === "documentation overview",
		);

		if (documentationOverviewPage) {
			return {
				product,
				page: documentationOverviewPage,
			};
		}
	}

	const product = getVisibleProducts(library)[0];
	const page = product ? getVisiblePages(product)[0] : null;

	return product && page ? { product, page } : null;
}

export function getDefaultDocsPath(library: DocsLibrary) {
	const defaultPage = getDefaultPage(library);
	if (!defaultPage) {
		return null;
	}

	return `/docs/${defaultPage.product.slug}/${defaultPage.page.slug}`;
}

export function getProductBySlug(library: DocsLibrary, productSlug: string) {
	return getVisibleProducts(library).find((product) => product.slug === productSlug) ?? null;
}

export function getPageBySlug(product: DocsProduct, pageSlug: string) {
	return getVisiblePages(product).find((page) => page.slug === pageSlug) ?? null;
}

export function getFlattenedVisiblePages(library: DocsLibrary) {
	return getVisibleProducts(library).flatMap((product) =>
		getVisiblePages(product).map((page) => ({
			product,
			page,
		})),
	);
}

export function getPageSiblings(product: DocsProduct, currentPageSlug: string) {
	const pages = getVisiblePages(product);
	const currentIndex = pages.findIndex((page) => page.slug === currentPageSlug);

	return {
		index: currentIndex,
		previous: currentIndex > 0 ? pages[currentIndex - 1] : null,
		next: currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null,
		total: pages.length,
	};
}
