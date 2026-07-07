"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo,
  Underline,
  Undo,
} from "lucide-react";
import { isAssignmentResponseEmpty } from "@/lib/assignmentHelpers";
import { useCallback, useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded text-gray-700 transition hover:bg-gray-200"
    >
      {children}
    </button>
  );
}

export default function AssignmentRichTextEditor({
  value,
  onChange,
  placeholder = "Write your assignment response here...",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInternalChange.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const syncContent = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    isInternalChange.current = false;
  }, [onChange]);

  const exec = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncContent();
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    exec("formatBlock", event.target.value);
    event.target.value = "p";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <select
          defaultValue="p"
          onChange={handleFormatChange}
          className="mr-1 h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-700"
          aria-label="Text format"
        >
          <option value="p">Paragraph</option>
          <option value="h3">Heading</option>
        </select>

        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton
          label="Bullet list"
          onClick={() => exec("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => exec("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton label="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Justify" onClick={() => exec("justifyFull")}>
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-300" />

        <ToolbarButton label="Undo" onClick={() => exec("undo")}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => exec("redo")}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {isAssignmentResponseEmpty(value) && (
          <p className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          className="min-h-[200px] px-3 py-3 text-sm leading-relaxed text-gray-800 outline-none [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
          role="textbox"
          aria-multiline="true"
          aria-label="Assignment answer"
        />
      </div>
    </div>
  );
}
