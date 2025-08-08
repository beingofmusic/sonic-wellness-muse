
-- 1) Logging table for broken content issues
create table if not exists public.content_issue_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  routine_id uuid null,
  page text null,
  issue_type text not null, -- e.g., ROUTINE_NOT_FOUND, NO_BLOCKS, ACCESS_DENIED, BROKEN_LINK, MISMATCHED_ID, OTHER
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists content_issue_logs_routine_id_idx on public.content_issue_logs (routine_id);
create index if not exists content_issue_logs_created_at_idx on public.content_issue_logs (created_at desc);

-- RLS
alter table public.content_issue_logs enable row level security;

-- Insert: any authenticated user can log issues
drop policy if exists "Users can insert content issue logs" on public.content_issue_logs;
create policy "Users can insert content issue logs"
  on public.content_issue_logs
  for insert
  to authenticated
  with check (true);

-- Select: only admins/team can read logs
drop policy if exists "Admins/team can read content issue logs" on public.content_issue_logs;
create policy "Admins/team can read content issue logs"
  on public.content_issue_logs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin'::user_role, 'team'::user_role)
    )
  );

-- Optional: set user_id automatically if not provided
create or replace function public.set_issue_log_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_issue_log_user_trg on public.content_issue_logs;
create trigger set_issue_log_user_trg
before insert on public.content_issue_logs
for each row
execute function public.set_issue_log_user();

-- 2) Audit function to list templates with zero blocks
create or replace function public.get_orphan_templates()
returns table(
  routine_id uuid,
  title text,
  created_by uuid,
  visibility text,
  is_template boolean,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $function$
  select
    r.id as routine_id,
    r.title,
    r.created_by,
    r.visibility,
    r.is_template,
    r.updated_at
  from public.routines r
  left join public.routine_blocks b on b.routine_id = r.id
  where (r.is_template = true or r.visibility = 'public')
  group by r.id, r.title, r.created_by, r.visibility, r.is_template, r.updated_at
  having count(b.id) = 0
$function$;

-- 3) Repair function to auto-add a placeholder block for any orphan template
create or replace function public.ensure_placeholder_blocks_for_orphans(p_default_duration integer default 3)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer := 0;
  r record;
begin
  for r in
    select r.id as routine_id
    from public.routines r
    left join public.routine_blocks b on b.routine_id = r.id
    where (r.is_template = true or r.visibility = 'public')
    group by r.id
    having count(b.id) = 0
  loop
    insert into public.routine_blocks (
      routine_id,
      order_index,
      duration,
      type,
      content,
      instructions
    ) values (
      r.routine_id,
      0,
      coalesce(p_default_duration, 3),
      'Warm-up',
      'Placeholder content',
      'Auto-generated placeholder block so this routine can be opened.'
    )
    on conflict do nothing;
    v_inserted := v_inserted + 1;
  end loop;
  return v_inserted;
end;
$$;
