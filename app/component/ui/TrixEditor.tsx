"use client";

import { useEffect, useRef, useMemo, useState } from "react";
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

// FORCE HMR UPDATE: v3

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
  const [fontSize, setFontSize] = useState(13);

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

  useEffect(() => {
    const editor = containerRef.current?.querySelector('trix-editor') as HTMLElement | null;
    if (editor) editor.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Mount the editor manually to hide its internal DOM from React
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Register alignment block attributes
    const TrixObj = (window as any).Trix;
    if (TrixObj) {
      TrixObj.config.blockAttributes.alignLeft = {
        tagName: "div", attributes: { class: "text-align-left" }, nestable: true,
      };
      TrixObj.config.blockAttributes.alignCenter = {
        tagName: "div", attributes: { class: "text-align-center" }, nestable: true,
      };
      TrixObj.config.blockAttributes.alignRight = {
        tagName: "div", attributes: { class: "text-align-right" }, nestable: true,
      };
      TrixObj.config.blockAttributes.alignJustify = {
        tagName: "div", attributes: { class: "text-align-justify" }, nestable: true,
      };
    }

    // Inject alignment toolbar buttons after editor initializes
    const injectToolbarButtons = () => {
      const toolbar = container.querySelector('trix-toolbar');
      if (!toolbar) return;
      const row = toolbar.querySelector('.trix-button-row');
      if (!row) return;
      // Avoid duplicate injection
      if (row.querySelector('[data-trix-attribute="alignLeft"]')) return;
      const group = document.createElement('span');
      group.className = 'trix-button-group';
      group.innerHTML = `
        <button type="button" class="trix-button" data-trix-attribute="alignLeft" title="Rata Kiri" tabindex="-1">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM1 6h10v2H1zM1 10h14v2H1zM1 14h10v2H1z" fill="currentColor"/></svg>
        </button>
        <button type="button" class="trix-button" data-trix-attribute="alignCenter" title="Rata Tengah" tabindex="-1">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM3 6h10v2H3zM1 10h14v2H1zM3 14h10v2H3z" fill="currentColor"/></svg>
        </button>
        <button type="button" class="trix-button" data-trix-attribute="alignRight" title="Rata Kanan" tabindex="-1">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM5 6h10v2H5zM1 10h14v2H1zM5 14h10v2H5z" fill="currentColor"/></svg>
        </button>
        <button type="button" class="trix-button" data-trix-attribute="alignJustify" title="Rata Kanan-Kiri" tabindex="-1">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM1 6h14v2H1zM1 10h14v2H1zM1 14h14v2H1z" fill="currentColor"/></svg>
        </button>
      `;
      row.appendChild(group);
    };

    // Create the HTML structure manually
    container.innerHTML = `
      <input id="${inputId}" type="hidden" />
      <trix-editor input="${inputId}" placeholder="${placeholder}" style="min-height:${minHeight}"></trix-editor>
    `;

    const inputEl = container.querySelector("input") as HTMLInputElement;
    const editorEl = container.querySelector("trix-editor") as any;

    // Inject toolbar buttons after Trix initializes
    const onInitOrReady = () => {
      injectToolbarButtons();
      if (value) editorEl.editor?.loadHTML(value);
    };

    // Initialize value
    if (value) {
      inputEl.value = value;
      lastReportedValue.current = value;
    }
    if (editorEl.editor) {
      onInitOrReady();
    } else {
      editorEl.addEventListener("trix-initialize", onInitOrReady, { once: true });
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
        const file = attachment.file;
        
        // Upload ke Cloudinary
        const response = await uploadApi.upload(file, uploadFileType);
        
        // Hapus attachment pending HANYA SETELAH upload selesai
        attachment.remove();

        // Dapatkan object Trix
        let TrixObj: any = (window as any).Trix;
        if (!TrixObj) {
          const TrixModule = await import("trix");
          TrixObj = TrixModule.default || TrixModule;
        }

        if (TrixObj && TrixObj.Attachment) {
          const newAttachment = new TrixObj.Attachment({
            url: response.url,
            href: response.url,
            contentType: file.type || "image/jpeg",
            filename: file.name
          });
          editorEl.editor.insertAttachment(newAttachment);
        } else {
          const attachmentData = JSON.stringify({
            contentType: file.type || "image/jpeg",
            url: response.url,
            href: response.url,
            filename: file.name
          }).replace(/'/g, "&#39;");
          const imgHtml = `<figure data-trix-attachment='${attachmentData}' data-trix-content-type="${file.type || 'image/jpeg'}" class="attachment attachment--preview"><img src="${response.url}"><figcaption class="attachment__caption"><span class="attachment__name">${file.name}</span></figcaption></figure>`;
          editorEl.editor.insertHTML(imgHtml);
        }

        // KRITIS: Tunggu Trix selesai memperbarui hidden input-nya,
        // lalu sinkronisasi. Set lastReportedValue DULU sebelum memanggil
        // onChange untuk mencegah useEffect([value]) mereset editor kembali.
        setTimeout(() => {
          const html = inputEl.value ?? "";
          // Dengan meng-set lastReportedValue terlebih dahulu, useEffect([value])
          // tidak akan memicu loadHTML ulang karena value === lastReportedValue.current
          lastReportedValue.current = html;
          onChangeRef.current?.(html);
        }, 300);
      } catch (error) {
        console.error("TrixEditor upload failed:", error);
        alert("Gagal mengupload gambar.");
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

    // Only sync if the incoming value is different from what we last reported.
    // This prevents overwriting the editor after an image upload completes.
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
      <div className="flex items-center gap-2 px-2 py-1 border-b border-[#e8e9ef] bg-[#fcfbff]">
        <label className="text-[11px] text-[#7a7e8a]">Font:</label>
        <input type="number" min="8" max="72" value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value) || 13)}
          className="w-14 h-7 rounded border border-[#d9d7df] px-2 text-xs text-center outline-none" />
      </div>
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
        .trix-editor-wrapper trix-editor .text-align-left { text-align: left; }
        .trix-editor-wrapper trix-editor .text-align-center { text-align: center; }
        .trix-editor-wrapper trix-editor .text-align-right { text-align: right; }
        .trix-editor-wrapper trix-editor .text-align-justify { text-align: justify; }
        .trix-editor-wrapper trix-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
