import { useCallback, useRef, useState } from "react";
import type { EditorInstance, EditorExtension } from "./types";

export interface UseEditorOptions {
  initialContent?: string;
  editable?: boolean;
  extensions?: EditorExtension[];
  onChange?: (html: string) => void;
  onSelectionChange?: () => void;
  placeholder?: string;
}

export function useEditor(options: UseEditorOptions = {}): { editor: EditorInstance | null; ref: (node: HTMLElement | null) => void } {
  const elementRef = useRef<HTMLElement | null>(null);
  const listenersRef = useRef<Map<string, Set<(...args: unknown[]) => void>>>(new Map());
  const [editable, setEditable] = useState(options.editable ?? true);

  const emit = useCallback((event: string, ...args: unknown[]) => {
    const set = listenersRef.current.get(event);
    if (set) set.forEach((cb) => cb(...args));
  }, []);

  const editorRef = useRef<EditorInstance | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (elementRef.current === node) return;
    // cleanup previous
    if (elementRef.current && editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }
    elementRef.current = node;
    if (!node) return;

    const inst: EditorInstance = {
      element: node,
      getHTML: () => node.innerHTML,
      getJSON: () => ({ type: "doc", content: [] }),
      getText: () => node.innerText || "",
      getWordCount: () => (node.innerText || "").trim().split(/\s+/).filter(Boolean).length,
      getCharCount: () => (node.innerText || "").length,
      setContent: (html: string) => { node.innerHTML = html; emit("update"); options.onChange?.(html); },
      clearContent: () => { node.innerHTML = ""; emit("update"); options.onChange?.(""); },
      focus: () => node.focus(),
      blur: () => node.blur(),
      isFocused: () => document.activeElement === node,
      isEditable: () => editable,
      setEditable: (v: boolean) => { node.contentEditable = v ? "true" : "false"; setEditable(v); },
      executeCommand: (name: string) => {
        // map common commands to execCommand
        const cmdMap: Record<string, string> = {
          bold: "bold", italic: "italic", underline: "underline", strike: "strikeThrough",
          code: "formatBlock", heading1: "formatBlock", heading2: "formatBlock",
          bulletList: "insertUnorderedList", orderedList: "insertOrderedList",
          blockquote: "formatBlock", horizontalRule: "insertHorizontalRule",
          undo: "undo", redo: "redo", link: "createLink",
        };
        const ec = cmdMap[name];
        if (ec) {
          if (name === "heading1") document.execCommand("formatBlock", false, "h1");
          else if (name === "heading2") document.execCommand("formatBlock", false, "h2");
          else if (name === "blockquote") document.execCommand("formatBlock", false, "blockquote");
          else if (name === "code") document.execCommand("formatBlock", false, "pre");
          else document.execCommand(ec, false);
          emit("update");
          options.onChange?.(node.innerHTML);
        }
      },
      insertPlaceholder: (key: string, label?: string) => {
        const span = document.createElement("span");
        span.className = "ui-editor__placeholder";
        span.contentEditable = "false";
        span.dataset.placeholder = key;
        span.textContent = label ?? `{{${key}}}`;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(span);
          range.setStartAfter(span);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          node.appendChild(span);
        }
        emit("update");
        options.onChange?.(node.innerHTML);
      },
      on: (event: string, cb: (...args: unknown[]) => void) => {
        if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
        listenersRef.current.get(event)!.add(cb);
        return () => { listenersRef.current.get(event)?.delete(cb); };
      },
      destroy: () => { listenersRef.current.clear(); },
    };

    node.contentEditable = editable ? "true" : "false";
    node.classList.add("ui-editor__content");
    if (options.initialContent) node.innerHTML = options.initialContent;
    node.addEventListener("input", () => { emit("update"); options.onChange?.(node.innerHTML); });
    node.addEventListener("focus", () => emit("focus"));
    node.addEventListener("blur", () => emit("blur"));

    editorRef.current = inst;
    options.extensions?.forEach((ext) => {
      if (ext.commands) Object.assign(inst, {}); // extension commands registered conceptually
    });
  }, [editable, options, emit]);

  return { editor: editorRef.current, ref };
}
