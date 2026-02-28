import { isValidElement } from "react";
import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { slugify } from "../lib/slug";

function extractText(children: ReactNode): string {
	if (typeof children === "string" || typeof children === "number") {
		return String(children);
	}

	if (Array.isArray(children)) {
		return children.map(extractText).join("");
	}

	if (isValidElement(children)) {
		const { children: nestedChildren } = children.props as {
			children?: ReactNode;
		};
		return extractText(nestedChildren);
	}

	return "";
}

export const markdownComponents: Components = {
	h2: ({ children, ...props }) => (
		<h2
			id={slugify(extractText(children))}
			className="text-balance font-semibold text-[var(--text)]"
			{...props}
		>
			{children}
		</h2>
	),
	h3: ({ children, ...props }) => (
		<h3
			id={slugify(extractText(children))}
			className="text-balance font-semibold text-[var(--text)]"
			{...props}
		>
			{children}
		</h3>
	),
	h4: ({ children, ...props }) => (
		<h4
			id={slugify(extractText(children))}
			className="font-semibold text-[var(--text)]"
			{...props}
		>
			{children}
		</h4>
	),
	p: (props) => <p className="text-pretty" {...props} />,
	a: ({ href, className, ...props }) => {
		const isExternalLink = typeof href === "string" && /^https?:\/\//.test(href);

		return (
			<a
				href={href}
				target={isExternalLink ? "_blank" : undefined}
				rel={isExternalLink ? "noreferrer" : undefined}
				{...props}
				className={`cursor-pointer text-[var(--primary-strong)] underline decoration-[color-mix(in_srgb,var(--primary)_42%,transparent)] underline-offset-4 transition hover:text-[var(--primary)] hover:decoration-[var(--primary)] ${className ?? ""}`}
			/>
		);
	},
	ul: (props) => <ul className="docs-list docs-list-unordered" {...props} />,
	ol: (props) => <ol className="docs-list docs-list-ordered" {...props} />,
	li: (props) => <li className="docs-list-item" {...props} />,
	blockquote: (props) => <blockquote {...props} />,
	table: (props) => <table {...props} />,
	thead: (props) => <thead {...props} />,
	tbody: (props) => <tbody {...props} />,
	tr: (props) => <tr {...props} />,
	th: (props) => <th {...props} />,
	td: (props) => <td {...props} />,
	hr: (props) => <hr className="my-8" {...props} />,
};
