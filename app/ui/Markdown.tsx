"use client";

import ReactMarkdown from "react-markdown";

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className} style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: "0 0 8px" }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: "4px 0 8px", paddingLeft: 20 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: "4px 0 8px", paddingLeft: 20 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ children, className: cn }) => {
            const isBlock = cn?.startsWith("language-");
            if (isBlock) {
              return (
                <pre style={{ background: "rgba(0,0,0,0.04)", borderRadius: 8, padding: "10px 14px", overflowX: "auto", fontSize: 12, margin: "6px 0" }}>
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code style={{ background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "1px 5px", fontSize: 12 }}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <div style={{ fontWeight: 800, fontSize: 16, margin: "8px 0 4px" }}>{children}</div>,
          h2: ({ children }) => <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }}>{children}</div>,
          h3: ({ children }) => <div style={{ fontWeight: 700, fontSize: 14, margin: "6px 0 3px" }}>{children}</div>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: "3px solid rgba(96,165,250,0.4)", paddingLeft: 12, margin: "6px 0", color: "var(--ink-soft)" }}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
