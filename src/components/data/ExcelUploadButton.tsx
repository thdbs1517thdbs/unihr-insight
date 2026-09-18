"use client";

import { useRef, useState, useTransition } from "react";
import { previewHrExcelUpload } from "@/app/data/actions";
import type { UploadPreviewResult } from "@/lib/excel/types";

type ExcelUploadButtonProps = {
  onResult: (result: UploadPreviewResult, file: File) => void;
};

export function ExcelUploadButton({ onResult }: ExcelUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setMessage(null);

    startTransition(async () => {
      const result = await previewHrExcelUpload(formData);
      onResult(result, file);
      if (!result.ok) {
        setMessage(result.message);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "파일 확인 중..." : "최신 인사자료 Excel 업로드"}
      </button>
      <p className="text-xs text-muted">
        .xlsx만 가능 · 원장에 바로 반영하지 않습니다
      </p>
      {message ? <p className="text-xs text-red-700">{message}</p> : null}
    </div>
  );
}
