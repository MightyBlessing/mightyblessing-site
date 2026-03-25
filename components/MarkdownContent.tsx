import ReactMarkdown from "react-markdown";

type Props = { content: string; className?: string };

export function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div
      className={`prose prose-neutral max-w-none prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-strong:text-neutral-900 prose-a:text-violet-700 prose-blockquote:border-l-violet-300 prose-blockquote:text-neutral-600 ${className}`}
      style={{ wordBreak: "break-word" }}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-700 hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
