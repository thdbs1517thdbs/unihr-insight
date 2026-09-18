export const WORKFLOW_STEPS = [
  { key: "DATA", label: "데이터", href: "/data" },
  { key: "CHECK", label: "품질관리", href: "/quality" },
  { key: "ANALYZE", label: "분석", href: "/analysis" },
  { key: "VERIFY", label: "검증", href: "/verification" },
  { key: "REPORT", label: "보고서", href: "/reports" },
] as const;

export const NAV_ITEMS = [
  {
    href: "/",
    label: "홈",
    description: "인사 현황 요약",
  },
  {
    href: "/data",
    label: "데이터 관리",
    description: "교직원 기초자료 관리",
    step: "DATA",
  },
  {
    href: "/quality",
    label: "데이터 품질관리",
    description: "누락·오류·중복 점검",
    step: "CHECK",
  },
  {
    href: "/analysis",
    label: "인사현황 분석",
    description: "구성·추이·분포 분석",
    step: "ANALYZE",
  },
  {
    href: "/verification",
    label: "통계자료 검증",
    description: "시스템 집계·제출자료 대조",
    step: "VERIFY",
  },
  {
    href: "/reports",
    label: "AI 인사보고서",
    description: "생성형 AI 보고서 초안",
    step: "REPORT",
  },
] as const;
