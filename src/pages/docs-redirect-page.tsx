import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { DocsLoadingShell } from "../features/docs/components/docs-loading-shell";
import { useDocumentation } from "../features/docs/hooks/use-documentation";
import { getDefaultDocsPath } from "../features/docs/lib/doc-routing";
import { getDefaultDescription, getSiteName, setSeoMetadata } from "../features/docs/lib/seo";

export default function DocsRedirectPage() {
	const { data, error, status } = useDocumentation();

	useEffect(() => {
		if (status === "loading") {
			setSeoMetadata({
				title: `Loading | ${getSiteName()}`,
				description: getDefaultDescription(),
				path: window.location.pathname,
			});
			return;
		}

		if (error && !data) {
			setSeoMetadata({
				title: `Documentation failed to load | ${getSiteName()}`,
				description: error,
				path: window.location.pathname,
				robots: "noindex,follow",
			});
			return;
		}

		setSeoMetadata({
			title: getSiteName(),
			description: getDefaultDescription(),
			path: window.location.pathname,
		});
	}, [data, error, status]);

	if (status === "loading" || !data) {
		return <DocsLoadingShell />;
	}

	if (error && data.products.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center px-4">
				<div className="app-card max-w-lg p-8 text-center">
					<p className="text-lg font-semibold text-[var(--text)]">
						Documentation failed to load.
					</p>
					<p className="mt-3 text-sm text-[var(--muted)]">{error}</p>
				</div>
			</div>
		);
	}

	return <Navigate replace to={getDefaultDocsPath(data) ?? "/"} />;
}
