export function AskAiPanelShell({ isMobile = false }: { isMobile?: boolean }) {
	return (
		<aside
			className={`app-card surface-outline flex h-full min-h-[26rem] flex-col overflow-hidden ${
				isMobile ? "rounded-[1.75rem]" : ""
			}`}
			aria-hidden="true"
		>
			<div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
					<div className="space-y-2">
						<div className="h-4 w-20 animate-pulse rounded-full bg-[var(--surface-2)]" />
						<div className="h-3 w-36 animate-pulse rounded-full bg-[var(--surface-2)]" />
					</div>
				</div>
				<div className="h-10 w-10 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
			</div>
			<div className="flex-1 space-y-4 px-5 py-5">
				<div className="h-28 animate-pulse rounded-[1.35rem] bg-[var(--surface-2)]" />
				<div className="h-36 animate-pulse rounded-[1.35rem] bg-[var(--surface-2)]" />
			</div>
			<div className="border-t border-[var(--border)] px-5 py-4">
				<div className="h-28 animate-pulse rounded-[1.35rem] bg-[var(--surface-2)]" />
			</div>
		</aside>
	);
}
