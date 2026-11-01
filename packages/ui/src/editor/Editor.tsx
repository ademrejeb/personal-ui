import { forwardRef, useEffect } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code, Minus, Link, Undo2, Redo2 } from "lucide-react";
import { useEditor } from "./useEditor";
import { createPlaceholderRegistry, interpolatePlaceholders } from "./placeholder";
import type { EditorExtension, PlaceholderDefinition } from "./types";

export interface EditorProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  extensions?: EditorExtension[];
  placeholderVariables?: PlaceholderDefinition[];
  sampleData?: Record<string, unknown>;
  preview?: boolean;
  className?: string;
  ariaLabel?: string;
  toolbar?: "full" | "basic" | "none" | string[];
  minHeight?: string;
}

const TOOLBAR_FULL = ["bold","italic","underline","strike","heading1","heading2","bulletList","orderedList","blockquote","code","horizontalRule","link","undo","redo"];
const ICONS: Record<string, React.ReactNode> = { bold: <Bold size={16}/>, italic: <Italic size={16}/>, underline: <Underline size={16}/>, strike: <Strikethrough size={16}/>, heading1: <Heading1 size={16}/>, heading2: <Heading2 size={16}/>, bulletList: <List size={16}/>, orderedList: <ListOrdered size={16}/>, blockquote: <Quote size={16}/>, code: <Code size={16}/>, horizontalRule: <Minus size={16}/>, link: <Link size={16}/>, undo: <Undo2 size={16}/>, redo: <Redo2 size={16}/> };

export const Editor = forwardRef<HTMLDivElement, EditorProps>(function Editor(props, ref) {
  const {
    id, value, defaultValue, onChange, placeholder, readOnly, disabled,
    extensions, placeholderVariables, sampleData, preview,
    className, ariaLabel, toolbar = "full", minHeight,
  } = props;

  const { editor, ref: contentRef } = useEditor({
    initialContent: value ?? defaultValue ?? "",
    editable: !(readOnly || disabled),
    extensions,
    onChange,
    placeholder,
  });

  const registry = createPlaceholderRegistry(placeholderVariables ?? []);

  const mergedRef = (node: HTMLDivElement | null) => {
    contentRef(node as unknown as HTMLElement);
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // sync controlled value
  useEffect(() => {
    if (value !== undefined && editor && editor.getHTML() !== value) {
      editor.setContent(value);
    }
  }, [value, editor]);

  const items = Array.isArray(toolbar) ? toolbar : (toolbar === "basic" ? ["bold","italic","underline","link","undo","redo"] : (toolbar === "none" ? [] : TOOLBAR_FULL));

  const label = ariaLabel ?? "Rich text editor";

  return (
    <div className={`ui-editor ${className ?? ""}`} data-readonly={readOnly || undefined} data-disabled={disabled || undefined}>
      {!readOnly && items.length > 0 && (
        <div className="ui-editor__toolbar" role="toolbar" aria-label={`${label} toolbar`}>
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="ui-editor__toolbar-btn"
              disabled={disabled}
              onClick={() => editor?.executeCommand(item)}
              title={item}
            >
              {ICONS[item] ?? item}
            </button>
          ))}
        </div>
      )}
      <div
        ref={mergedRef}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        aria-readonly={readOnly || undefined}
        className="ui-editor__content"
        style={{ minHeight: minHeight ?? "8rem" }}
        data-placeholder={placeholder}
      />
      {preview && value && sampleData && (
        <div className="ui-editor__preview" dangerouslySetInnerHTML={{ __html: interpolatePlaceholders(value, registry, sampleData) }} />
      )}
    </div>
  );
});
