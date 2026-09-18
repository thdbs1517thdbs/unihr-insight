export const recentChanges = [
  {
    date: "2026.09.01",
    type: "승진",
    name: "김서연",
    affiliation: "인문대학 국어국문학과",
    detail: "조교수 → 부교수",
  },
  {
    date: "2026.08.16",
    type: "전보",
    name: "이준호",
    affiliation: "기획처 기획팀",
    detail: "교무처 학사팀에서 전입",
  },
  {
    date: "2026.08.01",
    type: "신규임용",
    name: "박민지",
    affiliation: "자연과학대학 화학과",
    detail: "조교수 신규임용",
  },
  {
    date: "2026.07.15",
    type: "휴직",
    name: "최유진",
    affiliation: "학생처 장학복지팀",
    detail: "육아휴직 개시",
  },
  {
    date: "2026.07.01",
    type: "퇴직",
    name: "정한결",
    affiliation: "공과대학 기계공학과",
    detail: "정년퇴직",
  },
];

export const qualityStatus = {
  checkedAt: "2026.09.15 09:40",
  passRate: 96.4,
  items: [
    { label: "필수값 누락", count: 12, severity: "high" as const },
    { label: "코드 불일치", count: 5, severity: "medium" as const },
    { label: "중복 의심", count: 3, severity: "medium" as const },
    { label: "형식 오류", count: 8, severity: "low" as const },
  ],
};

export const verifyStatus = {
  target: "2026학년도 대학정보공시",
  items: [
    { label: "전임교원 현황", status: "일치" as const, note: "공시값과 동일" },
    { label: "직원 현황", status: "차이" as const, note: "2명 차이 확인 필요" },
    { label: "외국인 교원", status: "일치" as const, note: "공시값과 동일" },
    { label: "휴직자 현황", status: "검토중" as const, note: "기준일 확인 중" },
  ],
};
