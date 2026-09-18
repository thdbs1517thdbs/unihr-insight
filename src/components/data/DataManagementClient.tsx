"use client";

import { useState } from "react";
import { DataPageHeader } from "@/components/data/DataPageHeader";
import { ExcelUploadButton } from "@/components/data/ExcelUploadButton";
import { UploadPreviewPanel } from "@/components/data/UploadPreviewPanel";
import type { UploadPreviewResult } from "@/lib/excel/types";

type DataManagementClientProps = {
  asOfDate: string | null;
  totalCount: number | null;
  children: React.ReactNode;
};

export function DataManagementClient({
  asOfDate,
  totalCount,
  children,
}: DataManagementClientProps) {
  const [preview, setPreview] = useState<UploadPreviewResult | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  return (
    <>
      <DataPageHeader
        asOfDate={asOfDate}
        totalCount={totalCount}
        uploadSlot={
          <ExcelUploadButton
            onResult={(result, file) => {
              setPreview(result);
              setSourceFile(result.ok ? file : null);
            }}
          />
        }
      />
      {preview ? (
        <UploadPreviewPanel
          result={preview}
          sourceFile={sourceFile}
          onClose={() => {
            setPreview(null);
            setSourceFile(null);
          }}
        />
      ) : null}
      {children}
    </>
  );
}
