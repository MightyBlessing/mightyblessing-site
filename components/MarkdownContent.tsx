import ReactMarkdown from "react-markdown";

type Props = { content: string; className?: string };

export function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div
      className={`prose prose-gray dark:prose-invert max-w-none ${className}`}
      style={{ wordBreak: "break-word" }}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline dark:text-brand-secondary">
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
