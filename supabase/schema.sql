-- =====================================================================
-- 근태·잔업 통합 관리 시스템 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣고 실행하세요.
-- =====================================================================

-- 팀원 -----------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#1428A0',  -- 캘린더 표시 색
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 부재(근태): 휴가/연차/연차교육/외출/기타 --------------------------------
create table if not exists absences (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  start_date date not null,
  end_date date not null,           -- 하루면 start=end
  type text not null check (type in ('vacation','annual','training','out','family','etc')),
  memo text,
  created_at timestamptz default now()
);

-- 잔업 가능 등록 (사람 x 날짜) -----------------------------------------
create table if not exists overtime_availability (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  date date not null,
  created_at timestamptz default now(),
  unique (member_id, date)
);

-- 잔업 확정 기록 (카운터 집계의 소스) ----------------------------------
create table if not exists overtime_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  date date not null,
  method text not null check (method in ('agree','random')),  -- 합의/랜덤
  created_at timestamptz default now(),
  unique (date)   -- 하루 1명 정책. 복수 허용 시 이 줄 제거
);

-- 설비 목록 ------------------------------------------------------------
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  created_at timestamptz default now()
);

-- 설비 사용 불가 -------------------------------------------------------
create table if not exists equipment_unavailable (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  reported_by uuid references members(id),
  created_at timestamptz default now()
);

-- 카운터 집계용 뷰 ------------------------------------------------------
create or replace view overtime_counts as
select
  m.id as member_id, m.name, m.color,
  count(oa.id) filter (
    where date_trunc('month', oa.date) = date_trunc('month', current_date)
  ) as this_month,
  count(oa.id) as total
from members m
left join overtime_assignments oa on oa.member_id = m.id
where m.active = true
group by m.id, m.name, m.color;

-- =====================================================================
-- RLS: 내부 신뢰 환경 가정 — 우선 전체 허용. 인증 붙일 때 강화하세요.
-- =====================================================================
alter table members enable row level security;
alter table absences enable row level security;
alter table overtime_availability enable row level security;
alter table overtime_assignments enable row level security;
alter table equipment enable row level security;
alter table equipment_unavailable enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'members','absences','overtime_availability',
    'overtime_assignments','equipment','equipment_unavailable'
  ]
  loop
    execute format('drop policy if exists %I on %I;', 'allow_all_' || t, t);
    execute format(
      'create policy %I on %I for all using (true) with check (true);',
      'allow_all_' || t, t
    );
  end loop;
end $$;

-- =====================================================================
-- Realtime: 실시간 갱신 대상 테이블을 publication 에 추가
-- (Database > Replication 에서 토글해도 됩니다)
-- =====================================================================
do $$
begin
  begin
    alter publication supabase_realtime add table overtime_assignments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table overtime_availability;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table absences;
  exception when duplicate_object then null;
  end;
end $$;

-- =====================================================================
-- 더미 팀원 seed (이미 있으면 건너뜀)
-- =====================================================================
insert into members (name, color)
select * from (values
  ('한별', '#1428A0'),
  ('민수', '#FF6B4A'),
  ('지우', '#16A085'),
  ('현우', '#8E44AD'),
  ('수민', '#F39C12')
) as v(name, color)
where not exists (select 1 from members);

-- 설비 seed 예시 (필요 시 수정) ----------------------------------------
insert into equipment (name, category)
select * from (values
  ('설비A', '가공'),
  ('설비B', '가공'),
  ('설비C', '검사')
) as v(name, category)
where not exists (select 1 from equipment);
