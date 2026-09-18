-- public.data_issues 품질점검 연계
-- 이 파일은 저장만 합니다. Supabase SQL Editor에서 직접 실행하기 전까지 적용되지 않습니다.
-- employees, upload_history, HOME/DATA 공개 RPC, RLS는 변경하지 않습니다.
-- DROP / TRUNCATE / 전체 DELETE는 사용하지 않습니다.

-- 열린 품질 이슈만 유일해야 합니다.
-- 처리 완료 후 같은 문제가 다시 탐지되면 새 행을 넣을 수 있습니다.
create unique index if not exists data_issues_open_quality_key
  on public.data_issues (
    dataset_type,
    coalesce(employee_id, ''),
    issue_type,
    coalesce(field_name, '')
  )
  where dataset_type = 'quality_check'
    and issue_status in ('확인 필요', '확인 중');

create index if not exists data_issues_quality_lookup
  on public.data_issues (dataset_type, employee_id, issue_status)
  where dataset_type = 'quality_check';

-- 조회용 READ RPC. 페이지 로드 시 INSERT하지 않습니다.
create or replace function public.get_quality_data_issues()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SECURITY DEFINER: anon이 data_issues 테이블 SELECT 권한 없이 품질 이슈만 읽게 합니다.
  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'employee_id', d.employee_id,
          'issue_type', d.issue_type,
          'field_name', d.field_name,
          'issue_status', d.issue_status,
          'issue_description', d.issue_description,
          'detected_at', d.detected_at,
          'resolved_at', d.resolved_at
        )
        order by d.detected_at desc
      )
      from public.data_issues d
      where d.dataset_type = 'quality_check'
    ),
    '[]'::jsonb
  );
end;
$$;

-- 관리자 서버만 호출. 열린 동일 키는 건너뛰고 새 문제만 INSERT합니다.
create or replace function public.sync_quality_data_issues(p_issues jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_employee_id text;
  v_issue_type text;
  v_field_name text;
  v_description text;
  v_row_number integer;
  v_inserted integer := 0;
  v_skipped_open integer := 0;
  v_reopened integer := 0;
  v_allowed_types text[] := array[
    'missing',
    'duplicate',
    'date',
    'category',
    'statusMismatch'
  ];
begin
  if p_issues is null or jsonb_typeof(p_issues) <> 'array' then
    raise exception '품질 이슈 payload가 올바르지 않습니다.';
  end if;

  for v_row in
    select value
    from jsonb_array_elements(p_issues)
  loop
    v_employee_id := nullif(btrim(coalesce(v_row->>'employee_id', '')), '');
    v_issue_type := nullif(btrim(coalesce(v_row->>'issue_type', '')), '');
    v_field_name := nullif(btrim(coalesce(v_row->>'field_name', '')), '');
    v_description := nullif(btrim(coalesce(v_row->>'issue_description', '')), '');
    v_row_number := case
      when coalesce(v_row->>'row_number', '') ~ '^[0-9]+$' then (v_row->>'row_number')::integer
      else null
    end;

    if v_issue_type is null or not (v_issue_type = any (v_allowed_types)) then
      raise exception '허용되지 않은 문제 유형입니다.';
    end if;

    if v_field_name is null then
      raise exception 'field_name이 필요합니다.';
    end if;

    if v_description is null then
      raise exception 'issue_description이 필요합니다.';
    end if;

    if exists (
      select 1
      from public.data_issues d
      where d.dataset_type = 'quality_check'
        and coalesce(d.employee_id, '') = coalesce(v_employee_id, '')
        and d.issue_type = v_issue_type
        and coalesce(d.field_name, '') = v_field_name
        and d.issue_status in ('확인 필요', '확인 중')
    ) then
      v_skipped_open := v_skipped_open + 1;
      continue;
    end if;

    if exists (
      select 1
      from public.data_issues d
      where d.dataset_type = 'quality_check'
        and coalesce(d.employee_id, '') = coalesce(v_employee_id, '')
        and d.issue_type = v_issue_type
        and coalesce(d.field_name, '') = v_field_name
        and d.issue_status = '처리 완료'
    ) then
      v_reopened := v_reopened + 1;
    end if;

    insert into public.data_issues (
      upload_id,
      dataset_type,
      employee_id,
      row_number,
      issue_type,
      field_name,
      issue_description,
      issue_status,
      detected_at,
      resolved_at
    ) values (
      null,
      'quality_check',
      v_employee_id,
      v_row_number,
      v_issue_type,
      v_field_name,
      v_description,
      '확인 필요',
      now(),
      null
    );

    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object(
    'inserted', v_inserted,
    'skipped_open', v_skipped_open,
    'reopened_as_new', v_reopened
  );
end;
$$;

-- 관리자 서버만 호출. 상태값과 대상 행을 서버에서 검증합니다.
create or replace function public.update_quality_issue_status(
  p_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := nullif(btrim(coalesce(p_status, '')), '');
  v_updated integer := 0;
begin
  if v_status is null or v_status not in ('확인 필요', '확인 중', '처리 완료') then
    raise exception '허용되지 않은 처리상태입니다.';
  end if;

  if p_id is null then
    raise exception '이슈 id가 필요합니다.';
  end if;

  update public.data_issues
  set
    issue_status = v_status,
    resolved_at = case
      when v_status = '처리 완료' then now()
      else null
    end
  where id = p_id
    and dataset_type = 'quality_check';

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    raise exception '품질 이슈를 찾을 수 없습니다.';
  end if;

  return jsonb_build_object(
    'id', p_id,
    'issue_status', v_status,
    'resolved_at_set', v_status = '처리 완료'
  );
end;
$$;

revoke all on function public.get_quality_data_issues() from public;
revoke all on function public.sync_quality_data_issues(jsonb) from public;
revoke all on function public.update_quality_issue_status(uuid, text) from public;

grant execute on function public.get_quality_data_issues() to anon, authenticated;

revoke all on function public.sync_quality_data_issues(jsonb) from anon, authenticated;
revoke all on function public.update_quality_issue_status(uuid, text) from anon, authenticated;

grant execute on function public.sync_quality_data_issues(jsonb) to service_role;
grant execute on function public.update_quality_issue_status(uuid, text) to service_role;
