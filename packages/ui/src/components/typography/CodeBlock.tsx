import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Raw code. When omitted, string `children` are used. */
  code?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  wrap?: boolean;
  maxHeight?: string | number;
}

function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  return "";
}

/** Formatted code with optional filename header, line numbers, and copy. */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    className,
    code,
    language,
    filename,
    showLineNumbers = false,
    copyable = true,
    wrap = false,
    maxHeight,
    children,
    ...rest
  },
  ref,
) {
  const source = code ?? toText(children);
  const { copied, copy } = useCopyToClipboard();
  const lines = source.replace(/\n$/, "").split("\n");

  return (
    <div ref={ref} className={cx("ui-code-block", className)} {...rest}>
      {filename || language || copyable ? (
        <div className="ui-code-block__header">
          <span className="ui-code-block__title">
            {filename ? <span className="ui-code-block__filename">{filename}</span> : null}
            {language ? <span className="ui-code-block__language">{language}</span> : null}
          </span>
          {copyable ? (
            <button
              type="button"
              className="ui-code-block__copy"
              onClick={() => void copy(source)}
              aria-label={copied ? "Copied" : "Copy code"}
              data-copied={copied || undefined}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          ) : null}
        </div>
      ) : null}
      <pre
        className={cx("ui-code-block__pre", wrap && "ui-code-block__pre--wrap")}
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
      >
        <code className="ui-code-block__code">
          {showLineNumbers
            ? lines.map((line, index) => (
                <span className="ui-code-block__line" key={index}>
                  <span className="ui-code-block__gutter" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="ui-code-block__text">{line || " "}</span>
                </span>
              ))
            : source}
        </code>
      </pre>
    </div>
  );
});
CodeBlock.displayName = "CodeBlock";
