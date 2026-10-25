-- 나의 서재 접근 권한 설정 (회원제)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 아래 '여기에-주인-UID' 두 곳은 기존 서재 주인(나)의 User UID 로 바꿔주세요.
--
-- 저장 방식
--   <UID>          : 회원 각자의 서재
--   public:<UID>   : 그 회원의 보여주기용 공개 사본
--   main, public   : 1인용 시절의 예전 서재 (주인이 처음 로그인할 때 자동으로 <UID> 행으로 옮겨짐)

-- 1) 접근 권한(RLS) 켜기
alter table public.library_data enable row level security;

-- 2) 예전 정책 모두 지우기
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'library_data' loop
    execute format('drop policy %I on public.library_data', p.policyname);
  end loop;
end $$;

-- 3) 회원은 자기 서재와 자기 공개 사본만 읽고 쓰기
create policy "own library" on public.library_data
  for all to authenticated
  using (id = auth.uid()::text or id = 'public:' || auth.uid()::text)
  with check (id = auth.uid()::text or id = 'public:' || auth.uid()::text);

-- 4) 공개 사본은 누구나 읽기만
create policy "public copies read" on public.library_data
  for select to anon, authenticated
  using (id like 'public:%');

-- 5) 예전 서재(main, public)는 주인만 (옮기기용)
create policy "owner legacy rows" on public.library_data
  for all to authenticated
  using (auth.uid() = '여기에-주인-UID'::uuid and id in ('main', 'public'))
  with check (auth.uid() = '여기에-주인-UID'::uuid and id in ('main', 'public'));
