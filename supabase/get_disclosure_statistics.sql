-- public.get_disclosure_statistics
-- 이 파일은 저장만 합니다. Supabase에 직접 실행하지 마세요.
-- disclosure_statistics 테이블 SELECT를 anon에 주지 않고, 읽기 전용 집계만 노출합니다.
-- employees / RLS / HOME·DATA·CHECK·ANALYZE 공개 RPC는 변경하지 않습니다.

create or replace function public.get_disclosure_statistics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SECURITY DEFINER: anon이 테이블 직접 SELECT 없이 검증용 통계 행만 읽게 합니다.
  return coalesce(
    (
      select jsonb_agg(to_jsonb(d))
      from public.disclosure_statistics d
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_disclosure_statistics() from public;
revoke all on function public.get_disclosure_statistics() from anon, authenticated;
grant execute on function public.get_disclosure_statistics() to anon, authenticated;
