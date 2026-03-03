import { useEffect } from "react";
import { FiArrowRight, FiCompass, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import charsImage from "../assets/chars.jpg";
import { getSiteName, setSeoMetadata } from "../features/docs/lib/seo";

export default function NotFoundPage() {
	useEffect(() => {
		setSeoMetadata({
			title: `Page not found | ${getSiteName()}`,
			description:
				"This route does not map to any generated documentation page.",
			path: window.location.pathname,
			robots: "noindex,follow",
		});
	}, []);

	return (
		<div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
			<div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
				<div className="app-card surface-outline grid max-w-5xl overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]">
					<div className="p-8 sm:p-10">
						<div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-weak)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">
							<FiCompass />
							404
						</div>
						<h1 className="mb-4 text-balance text-4xl font-semibold text-[var(--text)] sm:text-5xl">
							Page not found
						</h1>
						<p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
							This route does not map to any generated documentation page. Use the
							primary docs entry point to get back into the generated navigation.
						</p>

						<div className="mt-8 grid gap-3 sm:grid-cols-2">
							<Link
								to="/"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-strong)]"
							>
								<FiHome className="text-white" />
								Go to the docs
							</Link>
							<Link
								to="/docs/wall-of-nostalgia/documentation-overview"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
							>
								Documentation overview
								<FiArrowRight />
							</Link>
						</div>
					</div>

					<div className="border-t border-[var(--border)] lg:border-l lg:border-t-0">
						<img
							src={charsImage}
							alt="Decorative documentation artwork"
							className="h-64 w-full object-cover lg:h-full"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
