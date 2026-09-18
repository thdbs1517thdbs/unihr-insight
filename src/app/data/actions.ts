"use server";

import { analyzeHrExcel, validateExcelFileMeta } from "@/lib/excel/analyze-upload";
import type { UploadPreviewResult } from "@/lib/excel/types";

export async function previewHrExcelUpload(
  formData: FormData,
): Promise<UploadPreviewResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "업로드할 Excel 파일을 선택해 주세요." };
  }

  const meta = validateExcelFileMeta(file);
  if (!meta.ok) {
    return meta;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const analyzed = await analyzeHrExcel(buffer, meta.fileName);
  if (!analyzed.ok) {
    return analyzed;
  }

  return analyzed.preview;
}
