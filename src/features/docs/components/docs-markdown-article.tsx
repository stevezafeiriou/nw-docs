import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";

interface DocsMarkdownArticleProps {
	markdown: string;
}

export default function DocsMarkdownArticle({
	markdown,
}: DocsMarkdownArticleProps) {
	return (
		<div className="prose-docs mx-auto max-w-4xl">
			<ReactMarkdown
				components={markdownComponents}
				remarkPlugins={[remarkGfm]}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
}
