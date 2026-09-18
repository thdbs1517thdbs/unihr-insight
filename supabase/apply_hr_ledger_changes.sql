-- public.apply_hr_ledger_changes
-- 이 파일은 저장만 합니다. 아직 실행하지 마세요.
-- employees RLS, 공개 조회 RPC, hr_snapshots는 변경하지 않습니다.

create or replace function public.apply_hr_ledger_changes(
  p_file_name text,
  p_reference_date date,
  p_total_rows integer,
  p_error_rows integer,
  p_created jsonb,
  p_changed jsonb,
  p_retired_ids jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upload_id public.upload_history.id%type;
  v_now timestamptz := now();
  v_created integer := 0;
  v_changed integer := 0;
  v_retired integer := 0;
  v_row jsonb;
  v_id text;
  v_patch jsonb;
  v_keys text[];
  v_created_payload jsonb := coalesce(p_created, '[]'::jsonb);
  v_changed_payload jsonb := coalesce(p_changed, '[]'::jsonb);
  v_retired_payload jsonb := coalesce(p_retired_ids, '[]'::jsonb);
  v_allowed_employee_keys text[] := array[
    'employee_id',
    'name',
    'birth_date',
    'gender',
    'employee_category',
    'organization_category',
    'parent_organization',
    'department',
    'job_group',
    'position',
    'faculty_type',
    'non_tenure_type',
    'employment_type',
    'first_appointment_date',
    'current_position_date',
    'contract_start_date',
    'contract_end_date',
    'employment_status',
    'leave_start_date',
    'expected_leave_end_date',
    'retirement_date',
    'reference_date'
  ];
  v_allowed_patch_keys text[] := array[
    'name',
    'birth_date',
    'gender',
    'employee_category',
    'organization_category',
    'parent_organization',
    'department',
    'job_group',
    'position',
    'faculty_type',
    'non_tenure_type',
    'employment_type',
    'first_appointment_date',
    'current_position_date',
    'contract_start_date',
    'contract_end_date',
    'employment_status',
    'leave_start_date',
    'expected_leave_end_date',
    'retirement_date',
    'reference_date'
  ];
begin
  if p_file_name is null or btrim(p_file_name) = '' then
    raise exception 'file_name이 필요합니다.';
  end if;

  if p_reference_date is null then
    raise exception 'reference_date(적용 기준일)가 필요합니다.';
  end if;

  if jsonb_typeof(v_created_payload) <> 'array' then
    raise exception 'p_created는 JSON 배열이어야 합니다.';
  end if;

  if jsonb_typeof(v_changed_payload) <> 'array' then
    raise exception 'p_changed는 JSON 배열이어야 합니다.';
  end if;

  if jsonb_typeof(v_retired_payload) <> 'array' then
    raise exception 'p_retired_ids는 JSON 배열이어야 합니다.';
  end if;

  for v_row in
    select value
    from jsonb_array_elements(v_created_payload)
  loop
    v_id := nullif(btrim(v_row->>'employee_id'), '');
    if v_id is null then
      raise exception '신규 payload에 employee_id가 없습니다.';
    end if;

    select array_agg(k)
    into v_keys
    from jsonb_object_keys(v_row) as k;

    if v_keys is not null and exists (
      select 1
      from unnest(v_keys) as k
      where k <> all (v_allowed_employee_keys)
    ) then
      raise exception '신규 payload에 허용되지 않은 필드가 있습니다. employee_id=%', v_id;
    end if;

    if exists (
      select 1
      from public.employees e
      where e.employee_id = v_id
    ) then
      raise exception '이미 존재하는 employee_id입니다: %', v_id;
    end if;

    insert into public.employees (
      employee_id,
      name,
      birth_date,
      gender,
      employee_category,
      organization_category,
      parent_organization,
      department,
      job_group,
      position,
      faculty_type,
      non_tenure_type,
      employment_type,
      first_appointment_date,
      current_position_date,
      contract_start_date,
      contract_end_date,
      employment_status,
      leave_start_date,
      expected_leave_end_date,
      retirement_date,
      reference_date
    ) values (
      v_id,
      case
        when v_row->'name' = 'null'::jsonb then null
        else v_row->>'name'
      end,
      case
        when v_row->'birth_date' = 'null'::jsonb then null
        else nullif(v_row->>'birth_date', '')::date
      end,
      case
        when v_row->'gender' = 'null'::jsonb then null
        else v_row->>'gender'
      end,
      case
        when v_row->'employee_category' = 'null'::jsonb then null
        else v_row->>'employee_category'
      end,
      case
        when v_row->'organization_category' = 'null'::jsonb then null
        else v_row->>'organization_category'
      end,
      case
        when v_row->'parent_organization' = 'null'::jsonb then null
        else v_row->>'parent_organization'
      end,
      case
        when v_row->'department' = 'null'::jsonb then null
        else v_row->>'department'
      end,
      case
        when v_row->'job_group' = 'null'::jsonb then null
        else v_row->>'job_group'
      end,
      case
        when v_row->'position' = 'null'::jsonb then null
        else v_row->>'position'
      end,
      case
        when v_row->'faculty_type' = 'null'::jsonb then null
        else v_row->>'faculty_type'
      end,
      case
        when v_row->'non_tenure_type' = 'null'::jsonb then null
        else v_row->>'non_tenure_type'
      end,
      case
        when v_row->'employment_type' = 'null'::jsonb then null
        else v_row->>'employment_type'
      end,
      case
        when v_row->'first_appointment_date' = 'null'::jsonb then null
        else nullif(v_row->>'first_appointment_date', '')::date
      end,
      case
        when v_row->'current_position_date' = 'null'::jsonb then null
        else nullif(v_row->>'current_position_date', '')::date
      end,
      case
        when v_row->'contract_start_date' = 'null'::jsonb then null
        else nullif(v_row->>'contract_start_date', '')::date
      end,
      case
        when v_row->'contract_end_date' = 'null'::jsonb then null
        else nullif(v_row->>'contract_end_date', '')::date
      end,
      case
        when v_row->'employment_status' = 'null'::jsonb then null
        else v_row->>'employment_status'
      end,
      case
        when v_row->'leave_start_date' = 'null'::jsonb then null
        else nullif(v_row->>'leave_start_date', '')::date
      end,
      case
        when v_row->'expected_leave_end_date' = 'null'::jsonb then null
        else nullif(v_row->>'expected_leave_end_date', '')::date
      end,
      case
        when v_row->'retirement_date' = 'null'::jsonb then null
        else nullif(v_row->>'retirement_date', '')::date
      end,
      case
        when v_row->'reference_date' = 'null'::jsonb then null
        else nullif(v_row->>'reference_date', '')::date
      end
    );

    v_created := v_created + 1;
  end loop;

  for v_row in
    select value
    from jsonb_array_elements(v_changed_payload)
  loop
    v_id := nullif(btrim(v_row->>'employee_id'), '');
    v_patch := coalesce(v_row->'changes', '{}'::jsonb);

    if v_id is null then
      raise exception '변경 payload에 employee_id가 없습니다.';
    end if;

    if jsonb_typeof(v_patch) <> 'object' or v_patch = '{}'::jsonb then
      raise exception '변경 필드가 없습니다. employee_id=%', v_id;
    end if;

    select array_agg(k)
    into v_keys
    from jsonb_object_keys(v_patch) as k;

    if exists (
      select 1
      from unnest(v_keys) as k
      where k <> all (v_allowed_patch_keys)
    ) then
      raise exception '변경 payload에 허용되지 않은 필드가 있습니다. employee_id=%', v_id;
    end if;

    if not exists (
      select 1
      from public.employees e
      where e.employee_id = v_id
    ) then
      raise exception '변경 대상 employee_id를 찾을 수 없습니다: %', v_id;
    end if;

    update public.employees e
    set
      name = case
        when v_patch ? 'name' then
          case when v_patch->'name' = 'null'::jsonb then null else v_patch->>'name' end
        else e.name
      end,
      birth_date = case
        when v_patch ? 'birth_date' then
          case
            when v_patch->'birth_date' = 'null'::jsonb then null
            else nullif(v_patch->>'birth_date', '')::date
          end
        else e.birth_date
      end,
      gender = case
        when v_patch ? 'gender' then
          case when v_patch->'gender' = 'null'::jsonb then null else v_patch->>'gender' end
        else e.gender
      end,
      employee_category = case
        when v_patch ? 'employee_category' then
          case when v_patch->'employee_category' = 'null'::jsonb then null else v_patch->>'employee_category' end
        else e.employee_category
      end,
      organization_category = case
        when v_patch ? 'organization_category' then
          case when v_patch->'organization_category' = 'null'::jsonb then null else v_patch->>'organization_category' end
        else e.organization_category
      end,
      parent_organization = case
        when v_patch ? 'parent_organization' then
          case when v_patch->'parent_organization' = 'null'::jsonb then null else v_patch->>'parent_organization' end
        else e.parent_organization
      end,
      department = case
        when v_patch ? 'department' then
          case when v_patch->'department' = 'null'::jsonb then null else v_patch->>'department' end
        else e.department
      end,
      job_group = case
        when v_patch ? 'job_group' then
          case when v_patch->'job_group' = 'null'::jsonb then null else v_patch->>'job_group' end
        else e.job_group
      end,
      position = case
        when v_patch ? 'position' then
          case when v_patch->'position' = 'null'::jsonb then null else v_patch->>'position' end
        else e.position
      end,
      faculty_type = case
        when v_patch ? 'faculty_type' then
          case when v_patch->'faculty_type' = 'null'::jsonb then null else v_patch->>'faculty_type' end
        else e.faculty_type
      end,
      non_tenure_type = case
        when v_patch ? 'non_tenure_type' then
          case when v_patch->'non_tenure_type' = 'null'::jsonb then null else v_patch->>'non_tenure_type' end
        else e.non_tenure_type
      end,
      employment_type = case
        when v_patch ? 'employment_type' then
          case when v_patch->'employment_type' = 'null'::jsonb then null else v_patch->>'employment_type' end
        else e.employment_type
      end,
      first_appointment_date = case
        when v_patch ? 'first_appointment_date' then
          case
            when v_patch->'first_appointment_date' = 'null'::jsonb then null
            else nullif(v_patch->>'first_appointment_date', '')::date
          end
        else e.first_appointment_date
      end,
      current_position_date = case
        when v_patch ? 'current_position_date' then
          case
            when v_patch->'current_position_date' = 'null'::jsonb then null
            else nullif(v_patch->>'current_position_date', '')::date
          end
        else e.current_position_date
      end,
      contract_start_date = case
        when v_patch ? 'contract_start_date' then
          case
            when v_patch->'contract_start_date' = 'null'::jsonb then null
            else nullif(v_patch->>'contract_start_date', '')::date
          end
        else e.contract_start_date
      end,
      contract_end_date = case
        when v_patch ? 'contract_end_date' then
          case
            when v_patch->'contract_end_date' = 'null'::jsonb then null
            else nullif(v_patch->>'contract_end_date', '')::date
          end
        else e.contract_end_date
      end,
      employment_status = case
        when v_patch ? 'employment_status' then
          case when v_patch->'employment_status' = 'null'::jsonb then null else v_patch->>'employment_status' end
        else e.employment_status
      end,
      leave_start_date = case
        when v_patch ? 'leave_start_date' then
          case
            when v_patch->'leave_start_date' = 'null'::jsonb then null
            else nullif(v_patch->>'leave_start_date', '')::date
          end
        else e.leave_start_date
      end,
      expected_leave_end_date = case
        when v_patch ? 'expected_leave_end_date' then
          case
            when v_patch->'expected_leave_end_date' = 'null'::jsonb then null
            else nullif(v_patch->>'expected_leave_end_date', '')::date
          end
        else e.expected_leave_end_date
      end,
      retirement_date = case
        when v_patch ? 'retirement_date' then
          case
            when v_patch->'retirement_date' = 'null'::jsonb then null
            else nullif(v_patch->>'retirement_date', '')::date
          end
        else e.retirement_date
      end,
      reference_date = case
        when v_patch ? 'reference_date' then
          case
            when v_patch->'reference_date' = 'null'::jsonb then null
            else nullif(v_patch->>'reference_date', '')::date
          end
        else e.reference_date
      end
    where e.employee_id = v_id;

    v_changed := v_changed + 1;
  end loop;

  for v_id in
    select nullif(btrim(jsonb_array_elements_text(v_retired_payload)), '')
  loop
    if v_id is null then
      raise exception '퇴직 후보 payload에 빈 employee_id가 있습니다.';
    end if;

    if not exists (
      select 1
      from public.employees e
      where e.employee_id = v_id
    ) then
      raise exception '퇴직 처리 대상 employee_id를 찾을 수 없습니다: %', v_id;
    end if;

    update public.employees
    set
      employment_status = '퇴직',
      retirement_date = p_reference_date
    where employee_id = v_id
      and employment_status is distinct from '퇴직';

    if found then
      v_retired := v_retired + 1;
    end if;
  end loop;

  insert into public.upload_history (
    dataset_type,
    file_name,
    upload_status,
    total_rows,
    new_rows,
    changed_rows,
    error_rows,
    uploaded_at,
    applied_at,
    remarks
  ) values (
    'employees',
    p_file_name,
    'applied',
    coalesce(p_total_rows, 0),
    v_created,
    v_changed,
    coalesce(p_error_rows, 0),
    v_now,
    v_now,
    format('retired_processed=%s; reference_date=%s', v_retired, p_reference_date)
  )
  returning id into v_upload_id;

  return jsonb_build_object(
    'upload_id', v_upload_id,
    'upload_status', 'applied',
    'created_rows', v_created,
    'new_rows', v_created,
    'changed_rows', v_changed,
    'retired_processed', v_retired,
    'error_rows', coalesce(p_error_rows, 0),
    'reference_date', p_reference_date
  );
end;
$$;

revoke all on function public.apply_hr_ledger_changes(
  text, date, integer, integer, jsonb, jsonb, jsonb
) from public;

revoke all on function public.apply_hr_ledger_changes(
  text, date, integer, integer, jsonb, jsonb, jsonb
) from anon, authenticated;

grant execute on function public.apply_hr_ledger_changes(
  text, date, integer, integer, jsonb, jsonb, jsonb
) to service_role;
