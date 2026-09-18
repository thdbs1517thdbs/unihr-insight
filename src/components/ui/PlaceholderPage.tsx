import { PageHeader } from "@/components/ui/PageHeader";

type PlaceholderPageProps = {
  title: string;
  description: string;
  step: string;
  nextFeature: string;
  items: string[];
};

export function PlaceholderPage({
  title,
  description,
  step,
  nextFeature,
  items,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} step={step} />
      <section className="rounded-lg border border-line bg-white p-6">
        <p className="text-sm font-medium text-navy-900">현재 단계</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          이 화면은 사이트 구조와 업무 흐름을 확인하기 위한 프로토타입입니다.
          실제 데이터 연동, Excel 업로드, 생성형 AI 기능은 이후 단계에서
          연결합니다.
        </p>
        <p className="mt-4 text-sm text-muted">예정 기능</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          다음 구현 예정: {nextFeature}
        </p>
      </section>
    </>
  );
}
