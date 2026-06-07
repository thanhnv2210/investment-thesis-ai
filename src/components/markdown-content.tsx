"use client"

import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

export const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-base font-bold mt-4 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-3">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) =>
    className?.includes("language-") ? (
      <code className="block bg-muted rounded p-3 text-xs font-mono overflow-x-auto my-2">
        {children}
      </code>
    ) : (
      <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">{children}</code>
    ),
  hr: () => <hr className="border-border my-4" />,
}

interface MarkdownContentProps {
  children: string
  className?: string
}

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
    </div>
  )
}
