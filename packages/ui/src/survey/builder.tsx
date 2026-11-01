import { useState, useCallback } from "react";
import { ArrowUp, ArrowDown, Copy, Trash2, Undo2, Redo2, Download } from "lucide-react";
import { SurveyRenderer } from "./renderer";
import type { SurveySchema } from "./types";

export interface SurveyBuilderProps {
  initialSchema?: SurveySchema;
  onChange?: (schema: SurveySchema) => void;
  className?: string;
}

const EMPTY_SCHEMA: SurveySchema = {
  version: 1,
  id: "survey-1",
  title: "Untitled survey",
  pages: [{ id: "page-1", title: "Page 1", questions: [] }],
};

let counter = 1;
function newId(prefix: string) { return `${prefix}-${counter++}`; }

export function SurveyBuilder({ initialSchema, onChange, className }: SurveyBuilderProps) {
  const [schema, setSchema] = useState<SurveySchema>(() => initialSchema ?? EMPTY_SCHEMA);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<SurveySchema[]>([]);
  const [future, setFuture] = useState<SurveySchema[]>([]);

  const commit = useCallback((next: unknown) => {
    setHistory((h) => [...h, schema]);
    setFuture([]);
    setSchema(next as SurveySchema);
    onChange?.(next as SurveySchema);
  }, [schema, onChange]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [schema, ...f]);
      setSchema(prev as SurveySchema);
      onChange?.(prev as SurveySchema);
      return h.slice(0, -1);
    });
  }, [schema, onChange]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, schema]);
      setSchema(next as SurveySchema);
      onChange?.(next as SurveySchema);
      return f.slice(1);
    });
  }, [schema, onChange]);

  const page = schema.pages[0];
  const questions = page.questions;

  const addQuestion = useCallback((type: string) => {
    const q = { id: newId("q"), type, title: `New ${type} question` } as unknown as (typeof questions)[number];
    const next = { ...schema, pages: [{ ...page, questions: [...questions, q] }] };
    commit(next);
    setSelected(q.id);
  }, [schema, page, questions, commit]);

  const removeQuestion = useCallback((id: string) => {
    const next = { ...schema, pages: [{ ...page, questions: questions.filter((q) => q.id !== id) }] };
    commit(next);
    if (selected === id) setSelected(null);
  }, [schema, page, questions, commit, selected]);

  const duplicateQuestion = useCallback((id: string) => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const copy = { ...questions[idx], id: newId("q"), title: questions[idx].title + " (copy)" };
    const nextQs = [...questions];
    nextQs.splice(idx + 1, 0, copy as (typeof questions)[number]);
    const next = { ...schema, pages: [{ ...page, questions: nextQs }] };
    commit(next);
    setSelected((copy as { id: string }).id);
  }, [schema, page, questions, commit]);

  const moveQuestion = useCallback((id: string, dir: -1 | 1) => {
    const idx = questions.findIndex((q) => q.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= questions.length) return;
    const nextQs = [...questions];
    [nextQs[idx], nextQs[target]] = [nextQs[target], nextQs[idx]];
    const next = { ...schema, pages: [{ ...page, questions: nextQs }] };
    commit(next);
  }, [schema, page, questions, commit]);

  const updateQuestion = useCallback((id: string, patch: Record<string, unknown>) => {
    const nextQs = questions.map((q) => (q.id === id ? ({ ...q, ...patch } as (typeof questions)[number]) : q));
    const next = { ...schema, pages: [{ ...page, questions: nextQs }] };
    commit(next);
  }, [schema, page, questions, commit]);

  const selectedQ = questions.find((q) => q.id === selected) ?? null;

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${schema.id}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [schema]);

  return (
    <div className={`ui-survey-builder ${className ?? ""}`}>
      <div className="ui-survey-builder__toolbar">
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)" aria-label="Undo"><Undo2 size={16} /></button>
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)" aria-label="Redo"><Redo2 size={16} /></button>
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={exportJson} title="Export JSON" aria-label="Export JSON"><Download size={16} /></button>
        <span className="ui-survey-builder__title">{schema.title}</span>
      </div>
      <div className="ui-survey-builder__workspace">
        <aside className="ui-survey-builder__palette" aria-label="Question palette">
          <h3>Questions</h3>
          <div className="ui-survey-builder__palette-list">
            {["text","longtext","number","single","multiple","dropdown","boolean","rating","opinion","date","time","datetime","email","url","phone","content"].map((t) => (
              <button key={t} type="button" className="ui-survey-builder__palette-item" onClick={() => addQuestion(t)}>
                + {t}
              </button>
            ))}
          </div>
        </aside>
        <main className="ui-survey-builder__canvas" aria-label="Survey canvas">
          {questions.length === 0 ? (
            <div className="ui-survey-builder__empty">Add a question from the palette to get started.</div>
          ) : (
            <ol className="ui-survey-builder__list">
              {questions.map((q, idx) => (
                <li
                  key={q.id}
                >
                  <button type="button" className="ui-survey-builder__item-select" onClick={() => setSelected(q.id)}>{q.type}</button>
                  <span className="ui-survey-builder__item-title">{q.title}</span>
                  <div className="ui-survey-builder__item-actions">
                    <button type="button" className="ui-button ui-button--ghost ui-button--icon" aria-label="Move up" disabled={idx === 0} onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, -1); }} title="Move up"><ArrowUp size={14} /></button>
                    <button type="button" className="ui-button ui-button--ghost ui-button--icon" aria-label="Move down" disabled={idx === questions.length - 1} onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 1); }} title="Move down"><ArrowDown size={14} /></button>
                    <button type="button" className="ui-button ui-button--ghost ui-button--icon" aria-label="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateQuestion(q.id); }} title="Duplicate"><Copy size={14} /></button>
                    <button type="button" className="ui-button ui-button--ghost ui-button--icon" aria-label="Delete" onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </main>
        <aside className="ui-survey-builder__inspector" aria-label="Properties inspector">
          {selectedQ ? (
            <div className="ui-survey-builder__inspector-body">
              <label className="ui-field">
                <span>Title</span>
                <input className="ui-input ui-control" value={selectedQ.title} onChange={(e) => updateQuestion(selectedQ.id, { title: e.target.value })} />
              </label>
              <label className="ui-field">
                <span>Description</span>
                <textarea className="ui-textarea ui-control" value={selectedQ.description ?? ""} onChange={(e) => updateQuestion(selectedQ.id, { description: e.target.value })} />
              </label>
              <label className="ui-field">
                <span>Placeholder</span>
                <input className="ui-input ui-control" value={selectedQ.placeholder ?? ""} onChange={(e) => updateQuestion(selectedQ.id, { placeholder: e.target.value })} />
              </label>
              <label className="ui-field ui-field--inline">
                <input type="checkbox" checked={Boolean(selectedQ.validation?.required)} onChange={(e) => updateQuestion(selectedQ.id, { validation: { ...selectedQ.validation, required: e.target.checked } })} />
                <span>Required</span>
              </label>
              <label className="ui-field">
                <span>Visible if (expression)</span>
                <input className="ui-input ui-control" value={selectedQ.visibleIf?.expression ?? ""} onChange={(e) => updateQuestion(selectedQ.id, { visibleIf: e.target.value ? { expression: e.target.value } : undefined })} />
              </label>
            </div>
          ) : (
            <div className="ui-survey-builder__empty">Select a question to edit its properties.</div>
          )}
        </aside>
      </div>
      <div className="ui-survey-builder__preview">
        <h3>Live preview</h3>
        <SurveyRenderer schema={schema} />
      </div>
    </div>
  );
}
