import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { loadDocumentation, peekDocumentationCache } from "../api/documentation-client";
import type { DocsLibrary } from "../types";

interface DocumentationState {
	data: DocsLibrary | null;
	error: string | null;
	status: "idle" | "loading" | "ready" | "error";
}

export function useDocumentation() {
	const initialDocument = peekDocumentationCache();
	const [state, setState] = useState<DocumentationState>({
		data: initialDocument,
		error: null,
		status: initialDocument ? "ready" : "loading",
	});

	const syncDocumentation = useEffectEvent(async () => {
		try {
			if (!initialDocument) {
				const firstDocument = await loadDocumentation();
				startTransition(() => {
					setState({
						data: firstDocument,
						error: null,
						status: "ready",
					});
				});
			}

			const freshDocument = await loadDocumentation(true);
			startTransition(() => {
				setState({
					data: freshDocument,
					error: null,
					status: "ready",
				});
			});
		} catch (error) {
			startTransition(() => {
				setState((currentState) => ({
					data: currentState.data,
					error: error instanceof Error ? error.message : "Failed to load documentation.",
					status: currentState.data ? "ready" : "error",
				}));
			});
		}
	});

	useEffect(() => {
		void syncDocumentation();
	}, []);

	return state;
}
