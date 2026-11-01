import { useState, useCallback } from "react";
import { Undo2, Redo2, Plus, Trash2 } from "lucide-react";
import { useBuilder } from "../builder/useBuilder";

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  validation?: { min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string };
  visibleIf?: string;
  column?: number;
  group?: string;
}

export interface FormGroup {
  id: string;
  title: string;
  columns?: number;
}

export interface FormSchema {
  version: 1;
  id: string;
  title: string;
  description?: string;
  groups: FormGroup[];
  fields: FormField[];
  settings?: { submitLabel?: string; columns?: number };
}

const EMPTY_FORM: FormSchema = {
  version: 1,
  id: "form-1",
  title: "Untitled form",
  groups: [{ id: "g1", title: "Details", columns: 1 }],
  fields: [],
};

let counter = 1;
function newId(p: string) { return `${p}-${counter++}`; }

export interface VisualFormBuilderProps {
  initialSchema?: FormSchema;
  onChange?: (schema: FormSchema) => void;
  className?: string;
}

export function VisualFormBuilder({ initialSchema, onChange, className }: VisualFormBuilderProps) {
  const builder = useBuilder<FormSchema>({ initial: initialSchema ?? EMPTY_FORM, onChange });
  const schema = builder.value;
  const [selected, setSelected] = useState<string | null>(null);

  const addField = useCallback((type: string) => {
    const field: FormField = { id: newId("f"), type, label: `New ${type} field`, column: 0, group: schema.groups[0]?.id };
    const next = { ...schema, fields: [...schema.fields, field] };
    builder.setValue(next);
    setSelected(field.id);
  }, [schema, builder]);

  const removeField = useCallback((id: string) => {
    const next = { ...schema, fields: schema.fields.filter((f) => f.id !== id) };
    builder.setValue(next);
    if (selected === id) setSelected(null);
  }, [schema, builder, selected]);

  const updateField = useCallback((id: string, patch: Partial<FormField>) => {
    const next = { ...schema, fields: schema.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) };
    builder.setValue(next);
  }, [schema, builder]);

  const addGroup = useCallback(() => {
    const g: FormGroup = { id: newId("g"), title: "New group", columns: 1 };
    const next = { ...schema, groups: [...schema.groups, g] };
    builder.setValue(next);
  }, [schema, builder]);

  const selectedField = schema.fields.find((f) => f.id === selected) ?? null;

  return (
    <div className={`ui-form-builder ${className ?? ""}`}>
      <div className="ui-form-builder__toolbar">
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={builder.undo} disabled={!builder.canUndo} title="Undo" aria-label="Undo"><Undo2 size={16} /></button>
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={builder.redo} disabled={!builder.canRedo} title="Redo" aria-label="Redo"><Redo2 size={16} /></button>
        <button type="button" className="ui-button ui-button--ghost ui-button--icon" onClick={addGroup} title="Add group" aria-label="Add group"><Plus size={16} /></button>
        <span className="ui-form-builder__title">{schema.title}</span>
      </div>
      <div className="ui-form-builder__workspace">
        <aside className="ui-form-builder__palette">
          <h3>Fields</h3>
          <div className="ui-form-builder__palette-list">
            {["text","textarea","number","email","select","checkbox","radio","date","file"].map((t) => (
              <button key={t} type="button" className="ui-form-builder__palette-item" onClick={() => addField(t)}>+ {t}</button>
            ))}
          </div>
        </aside>
        <main className="ui-form-builder__canvas">
          {schema.groups.map((g) => (
            <fieldset key={g.id} className="ui-form-builder__group">
              <legend>{g.title}</legend>
              <div className="ui-form-builder__group-fields" style={{ gridTemplateColumns: `repeat(${g.columns ?? 1}, 1fr)` }}>
                {schema.fields.filter((f) => f.group === g.id).map((f) => (
                  <div key={f.id} className={`ui-form-builder__field ${selected === f.id ? "ui-form-builder__field--selected" : ""}`}>
                    <button type="button" className="ui-form-builder__field-select" onClick={() => setSelected(f.id)}>{f.type} — {f.label}</button>
                    {f.required && <span className="ui-form-builder__required">*</span>}
                    <button type="button" className="ui-button ui-button--ghost ui-button--icon" aria-label="Delete" onClick={(e) => { e.stopPropagation(); removeField(f.id); }} title="Delete"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
          {schema.fields.length === 0 && <div className="ui-form-builder__empty">Add a field from the palette.</div>}
        </main>
        <aside className="ui-form-builder__inspector">
          {selectedField ? (
            <div className="ui-form-builder__inspector-body">
              <label className="ui-field"><span>Label</span><input className="ui-input ui-control" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} /></label>
              <label className="ui-field"><span>Placeholder</span><input className="ui-input ui-control" value={selectedField.placeholder ?? ""} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} /></label>
              <label className="ui-field ui-field--inline"><input type="checkbox" checked={Boolean(selectedField.required)} onChange={(e) => updateField(selectedField.id, { required: e.target.checked })} /><span>Required</span></label>
              <label className="ui-field"><span>Help text</span><textarea className="ui-textarea ui-control" value={selectedField.helpText ?? ""} onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })} /></label>
              <label className="ui-field"><span>Visible if</span><input className="ui-input ui-control" value={selectedField.visibleIf ?? ""} onChange={(e) => updateField(selectedField.id, { visibleIf: e.target.value })} /></label>
            </div>
          ) : <div className="ui-form-builder__empty">Select a field to edit.</div>}
        </aside>
      </div>
    </div>
  );
}
