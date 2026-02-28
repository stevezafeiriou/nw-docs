export interface DocsHeading {
	id: string;
	level: 3 | 4;
	title: string;
}

export interface DocsPage {
	id: string;
	title: string;
	slug: string;
	category: string;
	summary: string;
	markdown: string;
	headings: DocsHeading[];
	searchText: string;
	productSlug: string;
	hidden: boolean;
}

export interface DocsProduct {
	id: string;
	title: string;
	slug: string;
	intro: string;
	pages: DocsPage[];
	categories: string[];
}

export interface DocsLibrary {
	title: string;
	products: DocsProduct[];
}
