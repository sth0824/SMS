export default function SetupBanner() {
  return (
    <div className="mx-auto my-8 max-w-2xl rounded-lg border border-warning/40 bg-warning/10 p-5 text-sm text-gray-700">
      <h2 className="mb-2 text-base font-semibold text-gray-900">
        ⚙️ Supabase 연결이 필요합니다
      </h2>
      <p className="mb-3 leading-relaxed">
        데이터를 저장·공유하려면 Supabase 환경변수를 설정해야 합니다. 아래 순서를 따라
        주세요.
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          <a
            className="font-medium text-samsung underline"
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            Supabase
          </a>{" "}
          프로젝트 생성
        </li>
        <li>
          SQL Editor 에 <code className="rounded bg-gray-200 px-1">supabase/schema.sql</code>{" "}
          실행
        </li>
        <li>
          Settings → API 에서 URL / anon key 복사 후{" "}
          <code className="rounded bg-gray-200 px-1">.env.local</code> 에 입력
        </li>
        <li>개발 서버 재시작</li>
      </ol>
    </div>
  );
}
