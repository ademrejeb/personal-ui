export type EditorMark = "bold" | "italic" | "underline" | "strike" | "code" | "highlight";

export interface EditorNode {
  type: "doc" | "paragraph" | "heading" | "text" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "codeBlock" | "horizontalRule" | "image" | "table" | "tableRow" | "tableCell" | "link" | "hardBreak" | "placeholder";
  attrs?: Record<string, unknown>;
  content?: EditorNode[];
  text?: string;
  marks?: EditorMark[];
}

export interface EditorDocument {
  type: "doc";
  content: EditorNode[];
}

export interface EditorExtension {
  id: string;
  name: string;
  nodes?: string[];
  marks?: EditorMark[];
  commands?: Record<string, (editor: EditorInstance) => void>;
  keyboardShortcuts?: Record<string, (editor: EditorInstance) => void>;
}

export interface EditorInstance {
  getHTML: () => string;
  getJSON: () => EditorDocument;
  getText: () => string;
  getWordCount: () => number;
  getCharCount: () => number;
  setContent: (html: string) => void;
  clearContent: () => void;
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
  isEditable: () => boolean;
  setEditable: (editable: boolean) => void;
  executeCommand: (name: string) => void;
  insertPlaceholder: (key: string, label?: string) => void;
  on: (event: string, cb: (...args: unknown[]) => void) => () => void;
  destroy: () => void;
  element: HTMLElement | null;
}

export interface PlaceholderDefinition {
  key: string;
  label: string;
  description?: string;
  category?: string;
  defaultValue?: string;
  format?: (value: unknown) => string;
}

export interface PlaceholderRegistry {
  variables: PlaceholderDefinition[];
  delimiter?: { open: string; close: string };
  resolve: (key: string, context: Record<string, unknown>) => string;
  validate: (content: string) => { missing: string[]; unknown: string[] };
}
