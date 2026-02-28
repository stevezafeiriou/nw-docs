export function DocsLoadingShell() {
	return (
		<div className="min-h-screen px-3 py-3 sm:px-4">
			<div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full gap-5 lg:grid-cols-[304px_minmax(0,1fr)]">
				<aside className="docs-sidebar hidden overflow-hidden p-6 lg:block">
					<div className="h-10 w-44 animate-pulse rounded-2xl bg-white/10" />
					<div className="mt-6 h-12 animate-pulse rounded-full bg-white/8" />
					<div className="mt-8 space-y-3">
						{Array.from({ length: 8 }).map((_, index) => (
							<div
								key={index}
								className="h-16 animate-pulse rounded-[1.4rem] bg-white/8"
							/>
						))}
					</div>
				</aside>
				<div className="space-y-5">
					<div className="flex items-center justify-end gap-4 px-1 py-1">
						<div className="h-11 w-36 animate-pulse rounded-full bg-[var(--surface-2)]" />
						<div className="h-11 w-36 animate-pulse rounded-full bg-[var(--surface-2)]" />
						<div className="h-11 w-36 animate-pulse rounded-full bg-[var(--surface-2)]" />
					</div>
					<div className="app-card overflow-hidden p-6 sm:p-7">
						<div className="h-6 w-28 animate-pulse rounded-full bg-[var(--primary-weak)]" />
						<div className="mt-4 h-12 w-full max-w-xl animate-pulse rounded-3xl bg-[var(--surface-2)]" />
						<div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-full bg-[var(--surface-2)]" />
						<div className="mt-2 h-5 w-full max-w-xl animate-pulse rounded-full bg-[var(--surface-2)]" />
						<div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
							<div className="space-y-4">
								{Array.from({ length: 10 }).map((_, index) => (
									<div
										key={index}
										className="h-5 animate-pulse rounded-full bg-[var(--surface-2)]"
									/>
								))}
							</div>
							<div className="h-72 animate-pulse rounded-[1.7rem] bg-[var(--surface-2)]" />
						</div>
					</div>
					<div className="mt-3 border-t border-[var(--border)] px-1 pt-5">
						<div className="h-5 w-64 animate-pulse rounded-full bg-[var(--surface-2)]" />
					</div>
				</div>
			</div>
		</div>
	);
}
