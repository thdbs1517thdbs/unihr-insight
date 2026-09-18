type DataLoadErrorProps = {
  title?: string;
};

export function DataLoadError({ title }: DataLoadErrorProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-white px-5 py-8 text-center">
      {title ? (
        <p className="text-sm font-medium text-navy-900">{title}</p>
      ) : null}
      <p className="mt-1 text-sm text-slate-600">데이터를 불러오지 못했습니다</p>
    </section>
  );
}
