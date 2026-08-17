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

// Register custom alignment elements (Web Components) — once globally
let alignElementsRegistered = false;
function ensureAlignElements() {
  if (alignElementsRegistered) return;
  alignElementsRegistered = true;
  if (typeof window === "undefined" || typeof customElements === "undefined") return;

  const alignments: Record<string, string> = {
    "align-left": "left",
    "align-center": "center",
    "align-right": "right",
    "align-justify": "justify",
  };

  for (const [tag, alignment] of Object.entries(alignments)) {
    if (!customElements.get(tag)) {
      customElements.define(
        tag,
        class extends HTMLElement {
          connectedCallback() {
            this.style.display = "block";
            this.style.textAlign = alignment;
          }
        }
      );
    }
  }
}

// Register Trix block attributes — once globally
let trixAlignConfigured = false;
function ensureTrixAlignConfig() {
  if (trixAlignConfigured) return;
  const TrixObj = (window as any).Trix;
  if (!TrixObj) return;
  trixAlignConfigured = true;

  TrixObj.config.blockAttributes.alignLeft = {
    tagName: "align-left",
    parse: false,
    nestable: false,
    exclusive: true,
  };
  TrixObj.config.blockAttributes.alignCenter = {
    tagName: "align-center",
    parse: false,
    nestable: false,
    exclusive: true,
  };
  TrixObj.config.blockAttributes.alignRight = {
    tagName: "align-right",
    parse: false,
    nestable: false,
    exclusive: true,
  };
  TrixObj.config.blockAttributes.alignJustify = {
    tagName: "align-justify",
    parse: false,
    nestable: false,
    exclusive: true,
  };
}

function toEmbedUrl(raw: string): string {
  const s = raw.trim();
  const gMatch = s.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (gMatch && !s.includes('/embed')) {
    return `https://docs.google.com/presentation/d/${gMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }
  return s;
}

interface TrixEditorProps {
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
  uploadFileType?: string;
  allowSlidesEmbed?: boolean;
}

// FORCE HMR UPDATE: v5

export default function TrixEditor({
  id,
  placeholder = "",
  value = "",
  onChange,
  minHeight = "120px",
  uploadFileType = "MATERI_IMAGE",
  allowSlidesEmbed = false,
}: TrixEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastReportedValue = useRef<string | null>(null);
  const [fontSize, setFontSize] = useState(13);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [slideUrl, setSlideUrl] = useState('');
  const allowSlidesEmbedRef = useRef(allowSlidesEmbed);
  allowSlidesEmbedRef.current = allowSlidesEmbed;
  const slideUrlRef = useRef(slideUrl);
  slideUrlRef.current = slideUrl;

  // Keep a stable ref to the latest onChange callback
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Ensure Trix + custom elements are loaded
  useEffect(() => {
    ensureTrixLoaded();
    ensureAlignElements();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    import("trix").then(() => {
      ensureTrixAlignConfig();
    }).catch(() => {});
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

    // Make sure Trix block attributes are registered before editor mounts
    ensureTrixAlignConfig();

    const ALIGN_ATTRS = ["alignLeft", "alignCenter", "alignRight", "alignJustify"] as const;

    // Inject alignment toolbar buttons after editor initializes
    const injectToolbarButtons = () => {
      const toolbar = container.querySelector('trix-toolbar');
      if (!toolbar) return;
      const row = toolbar.querySelector('.trix-button-row');
      if (!row) return;
      // Avoid duplicate injection
      if (row.querySelector('.trix-align-btn')) return;

      const editorEl = container.querySelector('trix-editor') as any;
      const group = document.createElement('span');
      group.className = 'trix-button-group trix-button-group--align';

      const buttons = [
        { attr: 'alignLeft' as const, title: 'Rata Kiri', svg: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM1 6h10v2H1zM1 10h14v2H1zM1 14h10v2H1z" fill="currentColor"/></svg>' },
        { attr: 'alignCenter' as const, title: 'Rata Tengah', svg: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM3 6h10v2H3zM1 10h14v2H1zM3 14h10v2H3z" fill="currentColor"/></svg>' },
        { attr: 'alignRight' as const, title: 'Rata Kanan', svg: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM5 6h10v2H5zM1 10h14v2H1zM5 14h10v2H5z" fill="currentColor"/></svg>' },
        { attr: 'alignJustify' as const, title: 'Rata Kanan-Kiri', svg: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M1 2h14v2H1zM1 6h14v2H1zM1 10h14v2H1zM1 14h14v2H1z" fill="currentColor"/></svg>' },
      ];

      buttons.forEach(({ attr, title, svg }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'trix-button trix-align-btn';
        btn.title = title;
        btn.tabIndex = -1;
        btn.innerHTML = svg;

        // Prevent focus loss on mousedown
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
        });

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!editorEl?.editor) return;

          const editor = editorEl.editor;
          const isActive = editor.attributeIsActive(attr);

          // Deactivate all alignment attributes first (mutual exclusion)
          for (const a of ALIGN_ATTRS) {
            if (editor.attributeIsActive(a)) {
              editor.deactivateAttribute(a);
            }
          }

          // Toggle: if wasn't active, activate it
          if (!isActive) {
            editor.activateAttribute(attr);
          }

          // Update button visual states
          updateAlignButtonStates(group, editorEl);
        });

        group.appendChild(btn);
      });

      row.appendChild(group);

      // Slides embed button
      if (allowSlidesEmbedRef.current) {
        const slidesGroup = document.createElement('span');
        slidesGroup.className = 'trix-button-group trix-button-group--slides';
        const slidesBtn = document.createElement('button');
        slidesBtn.type = 'button';
        slidesBtn.className = 'trix-button trix-slides-btn';
        slidesBtn.title = 'Sisipkan Presentasi';
        slidesBtn.tabIndex = -1;
        slidesBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 15h4M8 12v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5.5 8.5l2-2 1.5 1.5L11 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        slidesBtn.addEventListener('mousedown', (e) => e.preventDefault());
        slidesBtn.addEventListener('click', (e) => {
          e.preventDefault();
          setShowSlideModal(true);
        });
        slidesGroup.appendChild(slidesBtn);
        row.appendChild(slidesGroup);
      }

      // Listen for selection changes to update button states
      editorEl.addEventListener('trix-selection-change', () => {
        updateAlignButtonStates(group, editorEl);
      });
    };

    const updateAlignButtonStates = (group: HTMLElement, editorEl: any) => {
      if (!editorEl?.editor) return;
      const btns = group.querySelectorAll('.trix-align-btn');
      btns.forEach((btn) => {
        const attr = ALIGN_ATTRS[Array.from(btns).indexOf(btn)];
        if (attr && editorEl.editor.attributeIsActive(attr)) {
          btn.classList.add('trix-active');
        } else {
          btn.classList.remove('trix-active');
        }
      });
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
          const imgHtml = `<figure data-trix-attachment='${attachmentData}' data-trix-content-type="${file.type || 'image/jpeg'}" class="attachment attachment--preview"><img src="${response.url}"></figure>`;
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

  function handleInsertSlide() {
    const url = slideUrlRef.current.trim();
    if (!url) return;
    const embedUrl = toEmbedUrl(url);
    const iframeHtml = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="border-radius:8px;display:block;"></iframe>`;
    const TrixObj = (window as any).Trix;
    const editorEl = containerRef.current?.querySelector('trix-editor') as any;
    const inputEl = containerRef.current?.querySelector('input') as HTMLInputElement | null;
    if (TrixObj?.Attachment && editorEl?.editor) {
      editorEl.editor.insertAttachment(new TrixObj.Attachment({
        content: iframeHtml,
        contentType: 'application/x-presentation',
      }));
      setTimeout(() => {
        if (inputEl) {
          const h = inputEl.value ?? '';
          lastReportedValue.current = h;
          onChangeRef.current?.(h);
        }
      }, 100);
    }
    setShowSlideModal(false);
    setSlideUrl('');
  }

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
        /* Alignment styles for custom elements */
        .trix-editor-wrapper trix-editor align-left {
          display: block;
          text-align: left;
        }
        .trix-editor-wrapper trix-editor align-center {
          display: block;
          text-align: center;
        }
        .trix-editor-wrapper trix-editor align-right {
          display: block;
          text-align: right;
        }
        .trix-editor-wrapper trix-editor align-justify {
          display: block;
          text-align: justify;
        }
        .trix-editor-wrapper trix-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 0.5em 0;
        }
        .trix-button-group--align {
          display: inline-flex;
          gap: 1px;
        }
        .trix-button-group--slides {
          display: inline-flex;
        }
      `}</style>
      {allowSlidesEmbed && showSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={(e) => { if (e.target === e.currentTarget) { setShowSlideModal(false); setSlideUrl(''); } }}>
          <div className="w-[480px] rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-sm font-semibold text-[#232530]">Sisipkan Presentasi</h3>
            <p className="mb-3 text-[11px] text-[#7a7e8a]">
              Tempel URL Google Slides (tautan berbagi atau publikasi). Untuk PowerPoint, gunakan URL embed dari OneDrive.
            </p>
            <input
              type="text"
              value={slideUrl}
              onChange={(e) => setSlideUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleInsertSlide(); if (e.key === 'Escape') { setShowSlideModal(false); setSlideUrl(''); } }}
              placeholder="https://docs.google.com/presentation/d/..."
              className="w-full rounded-lg border border-[#d9d7df] px-3 py-2 text-[12px] outline-none focus:border-[#7054dc]"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowSlideModal(false); setSlideUrl(''); }} className="rounded-lg px-4 py-2 text-[12px] text-[#7a7e8a] hover:bg-[#f5f4f8]">Batal</button>
              <button type="button" onClick={handleInsertSlide} disabled={!slideUrl.trim()} className="rounded-lg bg-[#7054dc] px-4 py-2 text-[12px] text-white disabled:opacity-40 hover:bg-[#5e43c3]">Sisipkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
