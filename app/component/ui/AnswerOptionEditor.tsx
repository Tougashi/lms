"use client";

import TrixEditor from "./TrixEditor";
import LatexKeyboard from "./LatexKeyboard";

interface AnswerOptionEditorProps {
  id: string;
  value: string;
  onChange: (html: string) => void;
  uploadFileType?: string;
}

export default function AnswerOptionEditor({
  id,
  value,
  onChange,
  uploadFileType = "SOAL_IMAGE",
}: AnswerOptionEditorProps) {
  function handleLatexInsert(latex: string) {
    const editorEl = document.querySelector(
      `trix-editor[input="trix-input-${id}"]`,
    ) as any;
    if (editorEl?.editor) {
      editorEl.focus();
      editorEl.editor.insertString(latex);
    }
  }

  return (
    <div className="flex-1 min-w-0">
      <TrixEditor
        id={id}
        value={value}
        onChange={onChange}
        minHeight="70px"
        uploadFileType={uploadFileType}
        placeholder="Masukkan Jawaban"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <LatexKeyboard onInsert={handleLatexInsert} />
        <span className="text-[10px] text-[#b0aec0]">
          Dukung gambar, format teks, dan LaTeX ($...$)
        </span>
      </div>
    </div>
  );
}
