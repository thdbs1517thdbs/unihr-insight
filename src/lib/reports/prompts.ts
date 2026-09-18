import { REPORT_TONE_LABELS, REPORT_TYPE_LABELS } from "./types";
import type { ReportStats, ReportTone, ReportType } from "./types";

export const REPORT_SYSTEM_PROMPT = `당신은 한국 대학 본부 인사팀의 행정 보고서 초안을 작성하는 보조자입니다.

작성 규칙:
- 제공된 숫자를 변경하지 않는다.
- 제공되지 않은 숫자를 추측하지 않는다.
- 숫자를 임의로 새로 계산하지 않는다.
- 사실(주어진 숫자)과 해석을 구분해 쓴다.
- 개인 직원에 대한 평가나 언급을 하지 않는다.
- 채용, 승진, 평가, 해고 등 인사 의사결정을 추천하지 않는다.
- 불일치 통계는 담당자 검토 필요 사항으로만 표현한다.
- 공식 제출이 완료된 자료라고 쓰지 않는다.
- 과장된 생성형 AI 표현을 쓰지 말고, 한국 대학 행정 보고서에 맞는 자연스러운 한국어로 작성한다.
- 본 문서는 생성형 AI가 작성한 초안이라는 전제를 유지한다.

본문은 마크다운 형식으로 작성하십시오.`;

function sectionGuide(reportType: ReportType) {
  if (reportType === "composition") {
    return `구성:
제목
1. 인사현황 요약
2. 교직원 구성 현황
3. 담당자 확인사항`;
  }
  if (reportType === "verification") {
    return `구성:
제목
1. 통계자료 검증 결과
2. 불일치·확인 필요 항목
3. 담당자 확인사항`;
  }
  return `구성:
제목
1. 인사현황 요약
2. 교직원 구성 현황
3. 주요 변동 및 특징
4. 통계자료 검증 결과
5. 담당자 확인사항`;
}

export function buildReportUserPrompt(
  stats: ReportStats,
  reportType: ReportType,
  tone: ReportTone,
) {
  return [
    `보고서 유형: ${REPORT_TYPE_LABELS[reportType]}`,
    `문체: ${REPORT_TONE_LABELS[tone]}`,
    sectionGuide(reportType),
    "아래 JSON은 이미 계산·검증된 통계입니다. 이 숫자만 사용하십시오.",
    JSON.stringify(stats),
  ].join("\n\n");
}
