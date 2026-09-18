"use client";

import { useState } from "react";
import { QualityIssueDetailModal } from "@/components/quality/QualityIssueDetailModal";
import {
  QualityIssueEmpty,
  QualityIssueTable,
} from "@/components/quality/QualityIssueTable";
import { QualityPagination } from "@/components/quality/QualityPagination";
import type { QualityFilters, QualityIssue } from "@/lib/quality/types";

type QualityIssueListProps = {
  rows: QualityIssue[];
  filters: QualityFilters;
  totalCount: number;
  canManage: boolean;
};

export function QualityIssueList({
  rows,
  filters,
  totalCount,
  canManage,
}: QualityIssueListProps) {
  const [selected, setSelected] = useState<QualityIssue | null>(null);

  return (
    <>
      {rows.length > 0 ? (
        <QualityIssueTable rows={rows} onOpen={setSelected} />
      ) : (
        <QualityIssueEmpty />
      )}
      <QualityPagination filters={filters} totalCount={totalCount} />
      {selected ? (
        <QualityIssueDetailModal
          issue={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
