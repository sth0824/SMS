# 근태·잔업 통합 관리 시스템

팀 근태(부재)와 잔업을 한 화면에서 관리하는 대시보드. 잔업 가능 인원 등록, 합의/랜덤 지정, 실시간 잔업 횟수 카운터, 설비 사용 불가 알림판을 제공합니다.

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **스타일**: Tailwind CSS + Pretendard (삼성 색감 디자인 토큰)
- **DB / 실시간**: Supabase (Postgres + Realtime)
- **배포**: Vercel + Supabase

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com/dashboard)에서 프로젝트 생성
2. **SQL Editor**에 [`supabase/schema.sql`](supabase/schema.sql) 전체를 붙여넣고 실행
   - 테이블 + 뷰 + RLS(전체 허용) + Realtime publication + 더미 팀원/설비 seed가 한 번에 생성됩니다.
3. **Settings → API**에서 `Project URL`과 `anon public` 키 복사

### 3. 환경변수

[`.env.local`](.env.local)에 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> 환경변수가 비어 있으면 앱은 크래시 대신 설정 안내 배너를 표시합니다.

### 4. 개발 서버

```bash
npm run dev
# http://localhost:3000
```

## 라우트

| 경로          | 설명                                          |
| ------------- | --------------------------------------------- |
| `/`           | 메인 대시보드 (월간 캘린더 + 잔업 카운터)     |
| `/equipment`  | 사용 불가 설비 알림판                         |
| `/admin`      | 팀원 / 설비 목록 관리 (CRUD)                  |

## 주요 기능

- **3-way 뷰 토글**: 근태 / 잔업 / 통합 — 캘린더 셀에 표시할 레이어 필터링
- **부재 관리**: 휴가·연차·연차교육·외출·기타, 기간 등록/수정/삭제
- **잔업 가능 등록**: 날짜 상세 모달에서 팀원 칩 토글
- **잔업 확정**: 합의 지정 또는 🎲 랜덤 추첨(롤링 애니메이션)
- **실시간 카운터**: `overtime_assignments` 변경을 Realtime 구독해 월/누적 횟수 자동 갱신. 최다 인원 강조, 0회 흐림 처리로 공정 배정 유도
- **설비 알림판**: 오늘 기준 사용 불가 / 예정된 불가 구분 표시

## Vercel 배포

1. 코드를 GitHub에 push
2. Vercel → New Project → 레포 import
3. Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력
4. Deploy — 이후 `main` push마다 자동 재배포

## 폴더 구조

```
app/                  # 라우트 (page.tsx, equipment/, admin/)
components/
  calendar/           # Calendar, CalendarCell, AbsencePill
  modals/             # DateDetailModal, AbsenceModal, RandomPicker
  counter/            # OvertimeCounter
  ui/                 # Button, Modal, Field, SetupBanner
lib/
  supabase.ts         # 클라이언트 초기화
  queries.ts          # CRUD 함수
  date.ts             # 월 그리드 생성 등 날짜 유틸
  hooks.ts            # SWR + Realtime 데이터 훅
types/index.ts        # 도메인 타입
supabase/schema.sql   # DB 스키마 + seed
```
