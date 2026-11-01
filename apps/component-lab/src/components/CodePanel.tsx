import { CopyButton } from "@adem.rejeb/ui";

interface CodePanelProps {
  code: string;
}

export function CodePanel({ code }: CodePanelProps) {
  return (
    <div className="lab-code">
      <pre tabIndex={0} role="region" aria-label="Generated code">
        <code>{code}</code>
      </pre>
      <div className="lab-code__copy">
        <CopyButton value={code} size="sm" variant="ghost" label="Copy code" />
      </div>
    </div>
  );
}
