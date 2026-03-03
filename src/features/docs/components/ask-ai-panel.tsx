import {
	FiMessageSquare,
	FiSend,
	FiX,
} from "react-icons/fi";
import shortieImage from "../../../assets/shortie.png";

interface AskAiPanelProps {
	isMobile?: boolean;
	onClose?: () => void;
}

export default function AskAiPanel({
	isMobile = false,
	onClose,
}: AskAiPanelProps) {
	return (
		<aside
			className={`app-card surface-outline flex h-full min-h-[26rem] flex-col overflow-hidden ${
				isMobile ? "rounded-[1.75rem]" : ""
			}`}
		>
			<div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
				<div className="flex items-center gap-3">
					<img
						src={shortieImage}
						alt="AI assistant avatar"
						className="h-10 w-10 rounded-2xl object-cover"
						loading="lazy"
						decoding="async"
					/>
					<div>
						<p className="text-sm font-semibold text-[var(--text)]">Ask AI</p>
						<p className="text-xs text-[var(--muted)]">
							Context-aware help is coming soon.
						</p>
					</div>
				</div>
				{onClose ? (
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)]"
						aria-label="Close Ask AI"
					>
						<FiX />
					</button>
				) : null}
			</div>

			<div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
				<div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
					<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-strong)]">
						<FiMessageSquare />
						Assistant preview
					</p>
					<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
						Ask AI will eventually answer questions about the current
						documentation page and help navigate related content.
					</p>
				</div>

				<div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-2)]/55 p-4">
					<p className="text-sm font-semibold text-[var(--text)]">
						Suggested prompts
					</p>
					<div className="mt-3 space-y-2">
						<div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm text-[var(--muted)]">
							“How do I complete onboarding?”
						</div>
						<div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm text-[var(--muted)]">
							“Show me all mirror pairing instructions.”
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-[var(--border)] px-5 py-4">
				<div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
					<div className="flex items-end gap-3">
						<textarea
							disabled
							rows={3}
							placeholder="AI chat input is disabled for now."
							className="w-full resize-none bg-transparent text-sm text-[var(--muted)] outline-none placeholder:text-[var(--muted)]/70 disabled:cursor-not-allowed"
						/>
						<button
							type="button"
							disabled
							className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)] opacity-70"
							aria-label="Send message"
						>
							<FiSend />
						</button>
					</div>
					<p className="mt-3 text-xs text-[var(--muted)]">
						Coming soon.
					</p>
				</div>
			</div>
		</aside>
	);
}
