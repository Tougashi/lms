"use client";

import { useEffect, useRef, useMemo } from "react";
import { uploadApi } from "../../lib/api";

// Import Trix CSS & JS on first mount
let trixLoaded = false;
function ensureTrixLoaded() {
  if (trixLoaded) return;
  trixLoaded = true;
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/trix@2.1.12/dist/trix.css";
    document.head.appendChild(link);
  }
}

interface TrixEditorProps {
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
  uploadFileType?: string;
}

export default function TrixEditor({
  id,
  placeholder = "",
  value = "",
  onChange,
  minHeight = "120px",
  uploadFileType = "MATERI_IMAGE",
}: TrixEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastReportedValue = useRef<string | null>(null);

  // Keep a stable ref to the latest onChange callback
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Ensure Trix is loaded
  useEffect(() => {
    ensureTrixLoaded();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    import("trix").catch(() => {});
  }, []);

  const inputId = useMemo(() => `trix-input-${id}`, [id]);

  // Mount the editor manually to hide its internal DOM from React
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the HTML structure manually
    container.innerHTML = `
      <input id="${inputId}" type="hidden" />
      <trix-editor input="${inputId}" placeholder="${placeholder}" style="min-height:${minHeight}"></trix-editor>
    `;

    const inputEl = container.querySelector("input") as HTMLInputElement;
    const editorEl = container.querySelector("trix-editor") as any;

    // Initialize value
    if (value) {
      inputEl.value = value;
      lastReportedValue.current = value;
      // We must wait for trix-initialize before loading HTML
      const onInit = () => {
        editorEl.editor?.loadHTML(value);
      };
      if (editorEl.editor) {
        editorEl.editor.loadHTML(value);
      } else {
        editorEl.addEventListener("trix-initialize", onInit, { once: true });
      }
    }

    const handleTrixChange = () => {
      const html = inputEl.value ?? "";
      lastReportedValue.current = html;
      onChangeRef.current?.(html);
    };

    const handleAttachmentAdd = async (event: any) => {
      const { attachment } = event;
      if (!attachment.file) return;
      try {
        attachment.setUploadProgress(0);
        const result = await uploadApi.upload(attachment.file, uploadFileType);
        attachment.setUploadProgress(1);
        attachment.setAttributes({
          url: result.url,
          href: result.url,
        });
      } catch (error) {
        console.error("TrixEditor upload failed:", error);
      }
    };

    editorEl.addEventListener("trix-change", handleTrixChange);
    editorEl.addEventListener("trix-attachment-add", handleAttachmentAdd);

    return () => {
      editorEl.removeEventListener("trix-change", handleTrixChange);
      editorEl.removeEventListener("trix-attachment-add", handleAttachmentAdd);
      container.innerHTML = "";
    };
  }, [inputId, placeholder, minHeight, uploadFileType]);

  // Sync external value changes into the editor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const editorEl = container.querySelector("trix-editor") as any;
    if (!editorEl?.editor) return;

    // Only sync if the incoming value is different from what we last reported
    if (value !== lastReportedValue.current) {
      lastReportedValue.current = value;

      // Save cursor position if focused
      const isFocused = document.activeElement === editorEl;
      let pos = null;
      if (isFocused) {
        pos = editorEl.editor.getSelectedRange();
      }

      editorEl.editor.loadHTML(value || "");

      // Restore cursor position
      if (pos) {
        editorEl.editor.setSelectedRange(pos);
      }
    }
  }, [value]);

  return (
    <div className="trix-editor-wrapper prose-trix">
      <div ref={containerRef} />
      <style>{`
        .trix-editor-wrapper {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #d9d7df;
          background: #fff;
        }
        .trix-editor-wrapper trix-toolbar {
          border-bottom: 1px solid #e8e9ef;
          background: #fcfbff;
          padding: 4px 8px;
        }
        .trix-editor-wrapper trix-toolbar .trix-button-row {
          flex-wrap: wrap;
        }
        .trix-editor-wrapper trix-toolbar .trix-button-group {
          border: none;
          margin-bottom: 0;
        }
        .trix-editor-wrapper trix-toolbar .trix-button {
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #232530;
          padding: 0 6px;
          width: auto;
          min-width: 28px;
          height: 28px;
        }
        .trix-editor-wrapper trix-toolbar .trix-button:hover {
          background: #f5f4fb;
        }
        .trix-editor-wrapper trix-toolbar .trix-button.trix-active {
          background: #ece7ff;
          color: #7054dc;
        }
        .trix-editor-wrapper trix-toolbar .trix-button-group:not(:first-child)::before {
          content: "";
          display: inline-block;
          width: 1px;
          height: 16px;
          background: #e4e5eb;
          margin: 0 4px;
          vertical-align: middle;
        }
        .trix-editor-wrapper trix-editor {
          border: none;
          padding: 12px;
          font-size: 13px;
          color: #232530;
          min-height: ${minHeight};
          outline: none;
        }
        .trix-editor-wrapper trix-editor:empty:not(:focus)::before {
          color: #9aa0ad;
          font-size: 12px;
        }
        .trix-editor-wrapper trix-editor h1 {
          font-size: 1.5em;
          font-weight: 700;
          line-height: 1.3;
          margin: 0.5em 0;
        }
        .trix-editor-wrapper trix-editor h2 {
          font-size: 1.25em;
          font-weight: 600;
          line-height: 1.3;
          margin: 0.4em 0;
        }
        .trix-editor-wrapper trix-editor a {
          color: #7054dc;
          text-decoration: underline;
        }
        .trix-editor-wrapper trix-editor ul {
          padding-left: 1.5em;
          margin: 0.5em 0;
          list-style-type: disc;
        }
        .trix-editor-wrapper trix-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
          list-style-type: decimal;
        }
        .trix-editor-wrapper trix-editor li {
          margin-bottom: 0.25em;
        }
        .trix-editor-wrapper trix-editor blockquote {
          border-left: 3px solid #d9d7df;
          padding-left: 12px;
          margin: 0.5em 0;
          color: #6f7381;
        }
        .trix-editor-wrapper trix-editor pre {
          background: #f5f4fb;
          border-radius: 6px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 12px;
          margin: 0.5em 0;
          overflow-x: auto;
        }
        .trix-editor-wrapper trix-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
