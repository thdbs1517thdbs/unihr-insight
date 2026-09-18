-- public.get_recent_appointments
-- 이 파일은 저장만 합니다. Supabase에 직접 실행하지 마세요.
-- appointment_history 테이블 SELECT를 anon에 주지 않고, 읽기 전용 RPC만 노출합니다.
-- employees / RLS / HOME·DATA 공개 RPC는 변경하지 않습니다.

create or replace function public.get_recent_appointments()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_has_table boolean;
  v_type_col text;
  v_date_col text;
  v_has_employee_id boolean;
  v_types jsonb := '[]'::jsonb;
  v_recent jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_date_expr text;
  v_order_expr text;
  v_join_sql text := '';
  v_name_sql text := 'null::text';
  v_dept_sql text := 'null::text';
  v_org_sql text := 'null::text';
begin
  -- SECURITY DEFINER: anon이 appointment_history 직접 SELECT 없이 집계만 읽게 합니다.
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'appointment_history'
  ) into v_has_table;

  if not v_has_table then
    return jsonb_build_object('ok', false, 'message', 'appointment_history 없음');
  end if;

  select c.column_name
  into v_type_col
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'appointment_history'
    and c.column_name in ('appointment_type', 'event_type', 'change_type', 'type')
  order by case c.column_name
    when 'appointment_type' then 1
    when 'event_type' then 2
    when 'change_type' then 3
    else 4
  end
  limit 1;

  select c.column_name
  into v_date_col
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'appointment_history'
    and c.column_name in ('appointment_date', 'effective_date', 'issued_date', 'event_date')
  order by case c.column_name
    when 'appointment_date' then 1
    when 'effective_date' then 2
    when 'issued_date' then 3
    else 4
  end
  limit 1;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointment_history'
      and column_name = 'employee_id'
  ) into v_has_employee_id;

  if v_type_col is null then
    return jsonb_build_object('ok', false, 'message', '발령 유형 컬럼 없음');
  end if;

  execute format(
    'select coalesce(jsonb_agg(jsonb_build_object(''type'', t.type, ''count'', t.cnt) order by t.cnt desc, t.type), ''[]''::jsonb),
            coalesce(sum(t.cnt), 0)
     from (
       select nullif(btrim(%I::text), '''') as type, count(*)::int as cnt
       from public.appointment_history
       group by 1
       having nullif(btrim(%I::text), '''') is not null
     ) t',
    v_type_col,
    v_type_col
  ) into v_types, v_total;

  v_date_expr := case
    when v_date_col is not null then format('h.%I', v_date_col)
    else 'null'
  end;
  v_order_expr := case
    when v_date_col is not null then format('h.%I desc nulls last', v_date_col)
    else '1'
  end;

  if v_has_employee_id then
    v_join_sql := 'left join public.employees e on e.employee_id = h.employee_id';
    v_name_sql := 'e.name';
    v_dept_sql := 'e.department';
    v_org_sql := 'e.parent_organization';
  end if;

  execute format(
    'select coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb)
     from (
       select
         nullif(btrim(h.%I::text), '''') as appointment_type,
         %s as appointment_date,
         %s as employee_id,
         %s as name,
         %s as department,
         %s as parent_organization
       from public.appointment_history h
       %s
       order by %s
       limit 8
     ) x',
    v_type_col,
    v_date_expr,
    case when v_has_employee_id then 'h.employee_id' else 'null::text' end,
    v_name_sql,
    v_dept_sql,
    v_org_sql,
    v_join_sql,
    v_order_expr
  ) into v_recent;

  return jsonb_build_object(
    'ok', true,
    'total', coalesce(v_total, 0),
    'types', coalesce(v_types, '[]'::jsonb),
    'recent', coalesce(v_recent, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_recent_appointments() from public;
revoke all on function public.get_recent_appointments() from anon, authenticated;
grant execute on function public.get_recent_appointments() to anon, authenticated;
