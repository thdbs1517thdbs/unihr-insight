import { type ReactNode } from "react";

type ReportMarkdownProps = {
  markdown: string;
};

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match = pattern.exec(text);
  let key = 0;

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <strong key={`b-${key}`} className="font-semibold text-navy-900">
        {match[1]}
      </strong>,
    );
    key += 1;
    lastIndex = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function ReportMarkdown({ markdown }: ReportMarkdownProps) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  function flushList() {
    if (!listType || listItems.length === 0) {
      listItems = [];
      listType = null;
      return;
    }
    const Tag = listType;
    const items = listItems;
    blocks.push(
      <Tag
        key={`list-${key}`}
        className={
          listType === "ul"
            ? "my-2 list-disc space-y-1 pl-5"
            : "my-2 list-decimal space-y-1 pl-5"
        }
      >
        {items.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInline(item)}</li>
        ))}
      </Tag>,
    );
    key += 1;
    listItems = [];
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);

    if (unordered) {
      if (listType === "ol") {
        flushList();
      }
      listType = "ul";
      listItems.push(unordered[1]);
      continue;
    }

    if (ordered) {
      if (listType === "ul") {
        flushList();
      }
      listType = "ol";
      listItems.push(ordered[1]);
      continue;
    }

    flushList();

    if (line.trim() === "") {
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h4
          key={`h-${key}`}
          className="mt-4 text-sm font-semibold text-navy-900"
        >
          {renderInline(line.slice(4))}
        </h4>,
      );
      key += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h3
          key={`h-${key}`}
          className="mt-5 text-base font-semibold text-navy-900"
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
      key += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h2
          key={`h-${key}`}
          className="mt-5 text-lg font-semibold text-navy-900"
        >
          {renderInline(line.slice(2))}
        </h2>,
      );
      key += 1;
      continue;
    }

    blocks.push(
      <p key={`p-${key}`} className="mt-2 leading-6">
        {renderInline(line)}
      </p>,
    );
    key += 1;
  }

  flushList();

  return <div className="text-sm leading-6 text-slate-700">{blocks}</div>;
}
