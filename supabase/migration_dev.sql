-- =====================================================================
-- dev 브랜치 신규 기능 마이그레이션
-- dev Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. (재실행 안전)
-- =====================================================================

-- [기능 2] 잔업 복수 인원 허용 ----------------------------------------
-- 기존 "하루 1명" unique(date) 제약을 제거하고,
-- 같은 날 같은 사람 중복만 막는다.
alter table overtime_assignments
  drop constraint if exists overtime_assignments_date_key;

do $$
begin
  alter table overtime_assignments
    add constraint overtime_assignments_date_member_key unique (date, member_id);
exception when duplicate_object then null;
end $$;

-- [기능 3] 부재 유형 직접 입력 (커스텀 라벨) --------------------------
alter table absences
  add column if not exists label text;

-- [기능 4] 부재 유형에 '패밀리데이'(family) 추가 ----------------------
-- 월급날(21일)이 포함된 주의 금요일. 캘린더 자동 배지 + 수동 등록용.
alter table absences
  drop constraint if exists absences_type_check;
alter table absences
  add constraint absences_type_check
  check (type in ('vacation','annual','training','out','family','etc'));
