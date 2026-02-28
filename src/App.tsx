import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DocsLoadingShell } from "./features/docs/components/docs-loading-shell";

const DocsPage = lazy(() => import("./pages/docs-page"));
const DocsRedirectPage = lazy(() => import("./pages/docs-redirect-page"));
const NotFoundPage = lazy(() => import("./pages/not-found-page"));

const router = createBrowserRouter([
	{
		path: "/",
		element: <DocsRedirectPage />,
	},
	{
		path: "/docs",
		element: <DocsRedirectPage />,
	},
	{
		path: "/docs/:productSlug/:pageSlug",
		element: <DocsPage />,
	},
	{
		path: "*",
		element: <NotFoundPage />,
	},
]);

export default function App() {
	return (
		<Suspense fallback={<DocsLoadingShell />}>
			<RouterProvider router={router} />
		</Suspense>
	);
}
