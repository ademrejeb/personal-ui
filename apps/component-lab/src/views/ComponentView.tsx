import { useEffect, useMemo, useState } from "react";
import { Badge } from "@personal-ui/ui";
import { generateCode, initialState } from "../registry";
import type { ComponentEntry, DemoState, DemoValue } from "../registry/types";
import { CodePanel } from "../components/CodePanel";
import { ControlsPanel } from "../components/ControlsPanel";
import { Playground } from "../components/Playground";
import { PropsTable } from "../components/PropsTable";

interface ComponentViewProps {
  entry: ComponentEntry;
}

export function ComponentView({ entry }: ComponentViewProps) {
  const [state, setState] = useState<DemoState>(() => initialState(entry));

  useEffect(() => {
    setState(initialState(entry));
  }, [entry]);

  const code = useMemo(() => generateCode(entry, state), [entry, state]);

  return (
    <div className="lab-content">
      <header className="lab-hero">
        <div className="lab-hero__eyebrow">
          <Badge variant="primary" size="sm">
            {entry.category}
          </Badge>
          {entry.controls?.length ? (
            <span className="lab-muted" style={{ fontSize: "0.75rem" }}>
              {entry.controls.length} props
            </span>
          ) : null}
        </div>
        <h1 className="lab-hero__title">{entry.name}</h1>
        <p className="lab-hero__description">{entry.description}</p>
      </header>

      <div className="lab-playground">
        <div style={{ minWidth: 0 }}>
          <h2 className="ui-visually-hidden">Preview and code</h2>
          <Playground>{entry.render(state)}</Playground>
          <CodePanel code={code} />
        </div>
        {entry.controls?.length ? (
          <ControlsPanel
            controls={entry.controls}
            state={state}
            onChange={(name: string, value: DemoValue) =>
              setState((prev) => ({ ...prev, [name]: value }))
            }
            onReset={() => setState(initialState(entry))}
          />
        ) : null}
      </div>

      {entry.props?.length ? (
        <section className="lab-section">
          <h2 className="lab-section__title">Props</h2>
          <PropsTable props={entry.props} />
        </section>
      ) : null}

      {entry.notes?.length ? (
        <section className="lab-section">
          <h2 className="lab-section__title">Usage &amp; accessibility</h2>
          <ul className="lab-notes">
            {entry.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
