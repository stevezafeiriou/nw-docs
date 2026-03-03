export function DocsMarkdownShell() {
	return (
		<div className="mx-auto max-w-4xl space-y-5" aria-hidden="true">
			<div className="h-6 w-40 animate-pulse rounded-full bg-[var(--primary-weak)]" />
			{Array.from({ length: 12 }).map((_, index) => (
				<div
					key={index}
					className="h-5 animate-pulse rounded-full bg-[var(--surface-2)]"
				/>
			))}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="h-28 animate-pulse rounded-[1.35rem] bg-[var(--surface-2)]" />
				<div className="h-28 animate-pulse rounded-[1.35rem] bg-[var(--surface-2)]" />
			</div>
		</div>
	);
}
