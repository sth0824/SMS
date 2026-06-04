-- =====================================================================
-- 실제 팀원 / 설비 데이터 seed
-- SQL Editor에 붙여넣고 Run 하세요.
-- 기존 데이터를 전부 삭제하고 실제 명단과 설비 목록으로 완전 교체합니다.
-- =====================================================================

-- 기존 데이터 전체 삭제 (cascade 로 관련 부재/잔업 기록도 함께 삭제됨)
truncate table equipment_unavailable restart identity cascade;
truncate table overtime_assignments  restart identity cascade;
truncate table overtime_availability restart identity cascade;
truncate table absences              restart identity cascade;
truncate table equipment             restart identity cascade;
truncate table members               restart identity cascade;

-- =====================================================================
-- 팀원 삽입 (이미 있으면 건너뜀)
-- =====================================================================
insert into members (name, color)
select * from (values
  ('은비',   '#1428A0'),
  ('유정',   '#FF6B4A'),
  ('승리',   '#16A085'),
  ('한별',   '#8E44AD'),
  ('혜리',   '#F39C12'),
  ('재이',   '#E74C3C')
) as v(name, color)
where not exists (select 1 from members where name = v.name);

-- =====================================================================
-- 설비 삽입 (이미 있으면 건너뜀)
-- =====================================================================
insert into equipment (name, category)
select * from (values
  -- STEPPER
  ('STEPP1',  'STEPPER'),
  ('STEPP2',  'STEPPER'),
  -- TRACK
  ('TRACK9',  'TRACK'),
  ('TRACK10', 'TRACK'),
  -- ALIGNER
  ('ALIGN6',  'ALIGNER'),
  ('ALIGN2',  'ALIGNER'),
  -- PECVD
  ('PECVD1A', 'PECVD'),
  ('PECVD1B', 'PECVD'),
  ('PECVD1C', 'PECVD'),
  ('PECVD1D', 'PECVD'),
  ('PECVD2A', 'PECVD'),
  ('PECVD2B', 'PECVD'),
  ('PECVD2C', 'PECVD'),
  ('PECVD2D', 'PECVD'),
  ('PECVD5',  'PECVD'),
  -- FURNACE
  ('FURNA2',  'FURNACE'),
  ('FURNA5A', 'FURNACE'),
  ('FURNA5B', 'FURNACE'),
  ('FURNA5C', 'FURNACE'),
  ('FURNA6',  'FURNACE'),
  -- RTP
  ('RTPAN1',  'RTP'),
  ('RTPAN4',  'RTP'),
  -- SPUTTER
  ('SPUTT1A', 'SPUTTER'),
  ('SPUTT1B', 'SPUTTER'),
  ('SPUTT1C', 'SPUTTER'),
  ('SPUTT2A', 'SPUTTER'),
  ('SPUTT2B', 'SPUTTER'),
  ('SPUTT2C', 'SPUTTER'),
  ('SPUTT31', 'SPUTTER'),
  ('SPUTT32', 'SPUTTER'),
  ('SPUTT33', 'SPUTTER'),
  ('SPUTT34', 'SPUTTER'),
  -- ETCHER
  ('ETCHE7A', 'ETCHER'),
  ('ETCHE7B', 'ETCHER'),
  ('ETCHE7C', 'ETCHER'),
  ('ETCHE7D', 'ETCHER'),
  ('ETCHE8',  'ETCHER')
) as v(name, category)
where not exists (select 1 from equipment where name = v.name);

-- 결과 확인
select 'members' as tbl, count(*) from members
union all
select 'equipment', count(*) from equipment;
