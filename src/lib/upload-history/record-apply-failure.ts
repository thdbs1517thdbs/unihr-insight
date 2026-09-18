import "server-only";

export type ApplyFailureRecordInput = {
  fileName: string;
  totalRows: number;
  errorRows: number;
  remarks: string;
};

export async function recordApplyFailure(input: ApplyFailureRecordInput) {
  void input;
  return {
    recorded: false as const,
    reason: "not_connected" as const,
  };
}
