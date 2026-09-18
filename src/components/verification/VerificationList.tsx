"use client";

import { useState } from "react";
import { VerificationDetailModal } from "@/components/verification/VerificationDetailModal";
import { VerificationPagination } from "@/components/verification/VerificationPagination";
import {
  VerificationEmpty,
  VerificationTable,
} from "@/components/verification/VerificationTable";
import type { DisclosureRow, VerificationFilters } from "@/lib/verification/types";

type VerificationListProps = {
  rows: DisclosureRow[];
  filters: VerificationFilters;
  totalCount: number;
};

export function VerificationList({
  rows,
  filters,
  totalCount,
}: VerificationListProps) {
  const [selected, setSelected] = useState<DisclosureRow | null>(null);

  return (
    <>
      {rows.length > 0 ? (
        <VerificationTable rows={rows} onOpen={setSelected} />
      ) : (
        <VerificationEmpty />
      )}
      <VerificationPagination filters={filters} totalCount={totalCount} />
      {selected ? (
        <VerificationDetailModal
          row={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
