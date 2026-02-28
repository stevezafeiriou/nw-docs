import { useDeferredValue, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
	FiArrowRight,
	FiBookOpen,
	FiChevronDown,
	FiChevronRight,
	FiCompass,
	FiHome,
	FiFileText,
	FiLayers,
	FiMenu,
	FiMessageSquare,
	FiMoon,
	FiMonitor,
	FiExternalLink,
	FiSearch,
	FiSun,
	FiZap,
} from "react-icons/fi";
import remarkGfm from "remark-gfm";
import { Link, NavLink, useParams } from "react-router-dom";
import charsImage from "../assets/chars.jpg";
import fallingImage from "../assets/falling.jpg";
import impressedImage from "../assets/impressed.jpg";
import promoImage from "../assets/promo.jpg";
import { AppFooter } from "../features/docs/components/app-footer";
import { AskAiPanel } from "../features/docs/components/ask-ai-panel";
import { DocsLoadingShell } from "../features/docs/components/docs-loading-shell";
import { markdownComponents } from "../features/docs/components/markdown-components";
import { useDocumentation } from "../features/docs/hooks/use-documentation";
import {
	getFlattenedVisiblePages,
	getPageBySlug,
	getPageSiblings,
	getProductBySlug,
	getVisiblePages,
	getVisibleProducts,
} from "../features/docs/lib/doc-routing";
import { getDefaultDescription, getSiteName, setSeoMetadata } from "../features/docs/lib/seo";
import { useTheme } from "../features/docs/hooks/use-theme";
import type { DocsPage, DocsProduct } from "../features/docs/types";

function getCategoryIcon(category: string) {
	switch (category) {
		case "Foundation":
			return FiCompass;
		case "Guides":
			return FiBookOpen;
		case "Support":
			return FiLayers;
		default:
			return FiFileText;
	}
}

function getProductImage(productSlug: string) {
	if (productSlug.startsWith("wall-of-nostalgia")) {
		return promoImage;
	}

	if (productSlug.startsWith("operations-dashboard")) {
		return fallingImage;
	}

	if (productSlug.startsWith("mirror-installations")) {
		return charsImage;
	}

	return charsImage;
}

function getProductIcon(productSlug: string) {
	if (productSlug.startsWith("wall-of-nostalgia")) {
		return FiBookOpen;
	}

	if (productSlug.startsWith("operations-dashboard")) {
		return FiLayers;
	}

	if (productSlug.startsWith("mirror-installations")) {
		return FiCompass;
	}

	return FiFileText;
}

function getProductDescription(productSlug: string) {
	if (productSlug.startsWith("wall-of-nostalgia")) {
		return "Official user documentation for the Wall of Nostalgia application.";
	}

	if (productSlug.startsWith("operations-dashboard")) {
		return "Official client portal documentation for Wall of Nostalgia operations and account management.";
	}

	if (productSlug.startsWith("mirror-installations")) {
		return "Official documentation for Wall of Nostalgia physical mirror installations, setup, and support.";
	}

	return getDefaultDescription();
}

function getHeaderDescription(productSlug: string, pageSlug: string) {
	if (pageSlug === "overview" || pageSlug === "documentation-overview") {
		if (productSlug.startsWith("wall-of-nostalgia")) {
			return "Start here for account setup, user flows, credits, badges, and core features in the Wall of Nostalgia application.";
		}

		if (productSlug.startsWith("operations-dashboard")) {
			return "Start here for client portal workflows, moderation tools, mirror management, and operations guidance for Wall of Nostalgia.";
		}

		if (productSlug.startsWith("mirror-installations")) {
			return "Start here for installation setup, hardware guidance, maintenance, and support documentation for Wall of Nostalgia mirrors.";
		}
	}

	return getProductDescription(productSlug);
}

function filterPages(pages: DocsPage[], searchQuery: string) {
	if (!searchQuery) {
		return pages;
	}

	return pages.filter((page) => page.searchText.includes(searchQuery));
}

function groupPagesByCategory(pages: DocsPage[]) {
	const groups = new Map<string, DocsPage[]>();

	for (const page of pages) {
		const group = groups.get(page.category);
		if (group) {
			group.push(page);
		} else {
			groups.set(page.category, [page]);
		}
	}

	return Array.from(groups.entries());
}

export default function DocsPage() {
	const { productSlug = "", pageSlug = "" } = useParams();
	const { data, error, status } = useDocumentation();
	const { theme, toggleTheme } = useTheme();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
	const [isDesktopAiDocked, setIsDesktopAiDocked] = useState(() =>
		typeof window !== "undefined"
			? window.matchMedia("(min-width: 1280px)").matches
			: false,
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [collapsedProducts, setCollapsedProducts] = useState<
		Record<string, boolean>
	>({});
	const deferredSearchQuery = useDeferredValue(
		searchQuery.trim().toLowerCase(),
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 1280px)");
		const handleChange = () => {
			setIsDesktopAiDocked(mediaQuery.matches);
		};

		handleChange();
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	useEffect(() => {
		const hasOverlay =
			isMobileMenuOpen || (isAiPanelOpen && !isDesktopAiDocked);
		document.body.classList.toggle("ls-overlay-open", hasOverlay);

		return () => {
			document.body.classList.remove("ls-overlay-open");
		};
	}, [isAiPanelOpen, isDesktopAiDocked, isMobileMenuOpen]);

	const visibleProducts = data ? getVisibleProducts(data) : [];
	const activeProduct = data ? getProductBySlug(data, productSlug) : null;
	const activePage = activeProduct
		? getPageBySlug(activeProduct, pageSlug)
		: null;
	const activeImage = activeProduct
		? getProductImage(activeProduct.slug)
		: charsImage;
	const pageSiblings =
		activeProduct && activePage
			? getPageSiblings(activeProduct, activePage.slug)
			: null;
	const suggestedPages = data ? getFlattenedVisiblePages(data).slice(0, 8) : [];
	const leadProduct = visibleProducts[0] ?? null;
	const topFoundationPages = leadProduct
		? filterPages(
				getVisiblePages(leadProduct).filter(
					(page) => page.category === "Foundation",
				),
				deferredSearchQuery,
		  )
		: [];

	useEffect(() => {
		if (status === "loading") {
			setSeoMetadata({
				title: `Loading | ${getSiteName()}`,
				description: getDefaultDescription(),
				path: window.location.pathname,
			});
			return;
		}

		if (!data) {
			return;
		}

		if (!activeProduct || !activePage) {
			setSeoMetadata({
				title: `Route mismatch | ${getSiteName()}`,
				description:
					"The requested documentation route does not match any generated page.",
				path: window.location.pathname,
				robots: "noindex,follow",
			});
			return;
		}

		setSeoMetadata({
			title: `${activePage.title} | ${activeProduct.title} | ${getSiteName()}`,
			description: getProductDescription(activeProduct.slug),
			path: `/docs/${activeProduct.slug}/${activePage.slug}`,
		});
	}, [activePage, activeProduct, data, status]);

	if (status === "loading" || !data) {
		return <DocsLoadingShell />;
	}

	function toggleProduct(product: DocsProduct) {
		setCollapsedProducts((currentState) => ({
			...currentState,
			[product.slug]: !(
				currentState[product.slug] ?? product.slug === activeProduct?.slug
			),
		}));
	}

	return (
		<div className="min-h-screen px-3 py-3 sm:px-4">
			{isMobileMenuOpen || (isAiPanelOpen && !isDesktopAiDocked) ? (
				<div
					id="ls-overlay-backdrop"
					onClick={() => {
						setIsMobileMenuOpen(false);
						setIsAiPanelOpen(false);
					}}
				/>
			) : null}

			<div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full gap-5 lg:grid-cols-[304px_minmax(0,1fr)]">
				<aside
					className={`docs-sidebar scrollbar-hidden fixed inset-y-3 left-3 z-[80] w-[calc(100vw-1.5rem)] overflow-y-auto text-[var(--nav-text)] transition duration-300 lg:sticky lg:top-3 lg:block lg:h-[calc(100vh-1.5rem)] lg:w-auto ${
						isMobileMenuOpen
							? "translate-x-0"
							: "-translate-x-[110%] lg:translate-x-0"
					}`}
					style={{ maxWidth: "304px" }}
				>
					<div className="relative flex h-full flex-col p-4">
						<div className="flex items-center gap-3 px-2 py-2">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c72ff,#5f78ff)] text-white shadow-[0_18px_35px_rgba(110,103,248,0.26)]">
								<FiBookOpen className="text-lg" />
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">
									Nostalgie World
								</p>
								<h1 className="mt-1 text-lg font-semibold text-white">
									Documentation
								</h1>
							</div>
						</div>

						<div className="mt-4 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
							<FiSearch className="shrink-0" />
							<input
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Search pages"
								className="w-full bg-transparent text-white outline-none placeholder:text-white/36"
							/>
						</div>

						<nav className="mt-5 flex-1 space-y-3">
							{topFoundationPages.length > 0 ? (
								<div>
									<div className="flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/34">
										<FiCompass className="text-sm" />
										<span>Foundation</span>
									</div>
									<div className="mt-2 space-y-1">
										{topFoundationPages.map((page) => (
											<NavLink
												key={`${leadProduct?.slug}-${page.slug}`}
												to={`/docs/${leadProduct?.slug}/${page.slug}`}
												onClick={() => setIsMobileMenuOpen(false)}
												className={({ isActive }) =>
													`app-nav-item block px-3 py-3 text-sm font-medium ${
														isActive ? "app-nav-item-active" : ""
													}`
												}
											>
												{page.title}
											</NavLink>
										))}
									</div>
								</div>
							) : null}

							{visibleProducts.map((product) => {
								const productPages = getVisiblePages(product);
								const visiblePages = filterPages(
									product === leadProduct
										? productPages.filter(
												(page) => page.category !== "Foundation",
										  )
										: productPages,
									deferredSearchQuery,
								);
								const isExpanded = deferredSearchQuery
									? visiblePages.length > 0
									: !(collapsedProducts[product.slug] ?? true);
								const groupedPages = groupPagesByCategory(visiblePages);

								return (
									<div key={product.slug}>
										<button
											type="button"
											onClick={() => toggleProduct(product)}
											className="flex w-full items-center justify-between gap-2 rounded-[1rem] px-3 py-3 text-left transition hover:bg-white/[0.045]"
										>
											<div className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-white/82">
												{(() => {
													const ProductIcon = getProductIcon(product.slug);
													return <ProductIcon className="text-base" />;
												})()}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold text-white">
													{product.title}
												</p>
											</div>
											<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.05] text-white/65">
												{isExpanded ? <FiChevronDown /> : <FiChevronRight />}
											</div>
										</button>

										{isExpanded ? (
											<div className="mt-2 space-y-4 pb-1">
												{groupedPages.length > 0 ? (
													groupedPages.map(([category, pages]) => {
														const CategoryIcon = getCategoryIcon(category);
														return (
															<div key={category}>
																<div className="mt-4 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/34 first:mt-0">
																	<CategoryIcon className="text-sm" />
																	<span>{category}</span>
																</div>
																<div className="mt-2 space-y-1">
																	{pages.map((page) => (
																		<NavLink
																			key={`${product.slug}-${page.slug}`}
																			to={`/docs/${product.slug}/${page.slug}`}
																			onClick={() => setIsMobileMenuOpen(false)}
																			className={({ isActive }) =>
																				`app-nav-item block px-3 py-3 text-sm font-medium ${
																					isActive ? "app-nav-item-active" : ""
																				}`
																			}
																		>
																			{page.title}
																		</NavLink>
																	))}
																</div>
															</div>
														);
													})
												) : (
													<div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-white/52">
														No pages match this search.
													</div>
												)}
											</div>
										) : null}
									</div>
								);
							})}
						</nav>

						<div className="mt-4 overflow-hidden rounded-[1.45rem] border border-white/10 bg-white/[0.045]">
							<img
								src={impressedImage}
								alt="Nostalgie World editorial visual"
								className="h-32 w-full object-cover"
							/>
							<div className="px-4 py-4">
								<p className="text-sm font-semibold text-white">
									Nostalgie World
								</p>
								<p className="mt-1 text-xs leading-5 text-white/52">
									Product Ecosystem guidance for Wall, Operations, and Mirror
									Installations in one place.
								</p>
							</div>
						</div>

						<div className="mt-4 border-t border-white/8 pt-4">
							<div className="space-y-1">
								<a
									href="#"
									className="flex items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-medium text-white/86 transition hover:bg-white/[0.045] hover:text-white"
								>
									<FiMonitor className="text-base text-white/64" />
									<span>Open Wall</span>
								</a>
								<a
									href="#"
									className="flex items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-medium text-white/86 transition hover:bg-white/[0.045] hover:text-white"
								>
									<FiExternalLink className="text-base text-white/64" />
									<span>Client Portal</span>
								</a>
							</div>
						</div>
					</div>
				</aside>

				<div
					className={`min-w-0 gap-5 ${
						isAiPanelOpen && isDesktopAiDocked
							? "xl:grid xl:grid-cols-[minmax(0,1fr)_340px]"
							: ""
					}`}
				>
					<div className="min-w-0 space-y-5">
						<header className="sticky top-3 z-40 flex flex-wrap items-center justify-between gap-4 px-1 py-1">
							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(true)}
								className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xl text-[var(--text)] lg:hidden"
								aria-label="Open navigation"
							>
								<FiMenu />
							</button>
							<div className="flex items-center gap-3">
								<div className="hidden h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--muted)] sm:inline-flex">
									<FiZap className="text-[var(--primary-strong)]" />
									Markdown generated
								</div>
								<button
									type="button"
									onClick={() => setIsAiPanelOpen((value) => !value)}
									className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
										isAiPanelOpen
											? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_14px_28px_color-mix(in_srgb,var(--primary)_28%,transparent)]"
											: "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] hover:border-[var(--primary)]"
									}`}
								>
									<FiMessageSquare />
									Ask AI
								</button>
								<button
									type="button"
									onClick={toggleTheme}
									className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
								>
									{theme === "light" ? <FiMoon /> : <FiSun />}
									{theme === "light" ? "Dark mode" : "Light mode"}
								</button>
							</div>
						</header>

						<main className="space-y-5">
							{activeProduct && activePage ? (
								<>
									<section className="app-card surface-outline fade-in overflow-hidden p-6 sm:p-7">
										<div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
											<div className="max-w-4xl">
												<div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-weak)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">
													<FiCompass />
													{activePage.category}
												</div>
												<h2 className="text-balance text-3xl font-semibold text-[var(--text)] sm:text-[2.15rem]">
													{activePage.title}
												</h2>
												<p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-[1.02rem]">
													{getHeaderDescription(activeProduct.slug, activePage.slug)}
												</p>
												<div className="mt-5 flex flex-wrap gap-2 text-xs">
													<div className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)]">
														<FiBookOpen className="text-[var(--primary-strong)]" />
														{activeProduct.title}
													</div>
												</div>
												{error ? (
													<div className="mt-5 rounded-[1.35rem] border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm leading-7 text-[var(--warning-text)]">
														Showing cached content. Refresh sync reported:{" "}
														{error}
													</div>
												) : null}
											</div>

											<div className="overflow-hidden rounded-[1.55rem] border border-[var(--border)] bg-[var(--bg-elevated)]">
												<img
													src={activeImage}
													alt={`${activeProduct.title} visual`}
													className="h-full min-h-[220px] w-full object-cover"
												/>
											</div>
										</div>
									</section>

									<div
										className={
											activePage.headings.length > 0
												? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_250px]"
												: ""
										}
									>
										<article className="app-card surface-outline fade-in overflow-hidden p-6 sm:p-7">
											<div className="prose-docs mx-auto max-w-4xl">
												<ReactMarkdown
													components={markdownComponents}
													remarkPlugins={[remarkGfm]}
												>
													{activePage.markdown}
												</ReactMarkdown>
											</div>

											<div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
												{pageSiblings?.previous ? (
													<Link
														to={`/docs/${activeProduct.slug}/${pageSiblings.previous.slug}`}
														className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-hover)]"
													>
														<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
															<FiArrowRight className="rotate-180" />
															Previous
														</p>
														<p className="mt-2 text-lg font-semibold text-[var(--text)]">
															{pageSiblings.previous.title}
														</p>
													</Link>
												) : (
													<div className="rounded-[1.35rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
														This is the first page in this product.
													</div>
												)}
												{pageSiblings?.next ? (
													<Link
														to={`/docs/${activeProduct.slug}/${pageSiblings.next.slug}`}
														className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-right transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-hover)]"
													>
														<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
															Next
															<FiArrowRight />
														</p>
														<p className="mt-2 text-lg font-semibold text-[var(--text)]">
															{pageSiblings.next.title}
														</p>
													</Link>
												) : (
													<div className="rounded-[1.35rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
														This is the last page in this product.
													</div>
												)}
											</div>
										</article>

										{activePage.headings.length > 0 ? (
											<aside className="space-y-5">
												<div className="app-card surface-outline p-4">
													<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
														<FiLayers />
														On this page
													</p>
													<div className="mt-3 space-y-1.5">
														{activePage.headings.map((heading) => (
															<a
																key={heading.id}
																href={`#${heading.id}`}
																className={`block rounded-2xl px-3 py-2 text-sm transition hover:bg-[var(--surface-2)] ${
																	heading.level === 4
																		? "ml-4 text-[var(--muted)]"
																		: "text-[var(--text)]"
																}`}
															>
																{heading.title}
															</a>
														))}
													</div>
												</div>
											</aside>
										) : null}
									</div>
								</>
							) : (
								<section className="app-card surface-outline fade-in overflow-hidden">
									<div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
										<div className="p-7 sm:p-8">
											<div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-bg)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--danger-text)]">
												<FiCompass />
												Route mismatch
											</div>
											<h2 className="mt-5 text-balance text-4xl font-semibold text-[var(--text)]">
												This docs page does not exist
											</h2>
											<p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
												The requested product or page is not part of the
												generated documentation structure. Use one of the valid
												entry points below to continue browsing.
											</p>

											<div className="mt-8 flex flex-wrap gap-3">
												<Link
													to="/"
													className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-strong)]"
												>
													<FiHome className="text-white" />
													Back to docs
												</Link>
											</div>

											<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
												{suggestedPages.map(({ product, page }) => (
													<Link
														key={`${product.slug}-${page.slug}`}
														to={`/docs/${product.slug}/${page.slug}`}
														className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-hover)]"
													>
														<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
															{product.title}
														</p>
														<p className="mt-2 text-lg font-semibold text-[var(--text)]">
															{page.title}
														</p>
													</Link>
												))}
											</div>
										</div>

										<div className="border-t border-[var(--border)] lg:border-l lg:border-t-0">
											<img
												src={fallingImage}
												alt="Decorative route mismatch artwork"
												className="h-64 w-full object-cover lg:h-full"
											/>
										</div>
									</div>
								</section>
							)}
						</main>

						<AppFooter />
					</div>

					{isAiPanelOpen && isDesktopAiDocked ? (
						<div className="hidden xl:block">
							<div className="sticky top-3 h-[calc(100vh-1.5rem)]">
								<AskAiPanel />
							</div>
						</div>
					) : null}
				</div>
			</div>

			{isAiPanelOpen && !isDesktopAiDocked ? (
				<div className="fixed inset-y-3 right-3 z-[85] w-[calc(100vw-1.5rem)] max-w-[360px] xl:hidden">
					<AskAiPanel isMobile onClose={() => setIsAiPanelOpen(false)} />
				</div>
			) : null}
		</div>
	);
}
