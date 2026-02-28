const legalLinks = [
	{
		label: "Terms of Service",
		href: "https://nostalgie.world/terms-of-service",
	},
	{
		label: "Privacy Policy",
		href: "https://nostalgie.world/privacy-policy",
	},
	{
		label: "Disclosures",
		href: "https://nostalgie.world/disclosures",
	},
];

export function AppFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mt-4 border-t border-[var(--border)] px-1 pt-5">
			<div className="flex flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
				<p>Copyright © {currentYear} Saphire Labs. All rights reserved.</p>
				<div className="flex flex-wrap gap-x-5 gap-y-2">
					{legalLinks.map((link) => (
						<a
							key={link.label}
							href={link.href}
							target="_blank"
							rel="noreferrer"
							className="transition hover:text-[var(--text)]"
						>
							{link.label}
						</a>
					))}
				</div>
			</div>
		</footer>
	);
}
