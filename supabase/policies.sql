-- 나의 서재 접근 권한 설정
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 실행 전에 아래 두 곳의 '여기에-내-UID' 를 내 계정의 User UID 로 바꿔주세요.
-- (Authentication → Users 에서 내 계정을 누르면 User UID 가 보여요.)

-- 1) 접근 권한(RLS) 켜기
alter table public.library_data enable row level security;

-- 2) 예전에 만든 정책을 모두 지우기 (누구나 읽고 쓰던 정책이 남아 있으면 막히지 않아요)
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'library_data' loop
    execute format('drop policy %I on public.library_data', p.policyname);
  end loop;
end $$;

-- 3) 주인(내 계정)만 모든 데이터를 읽고 쓰기
create policy "owner full access" on public.library_data
  for all to authenticated
  using (auth.uid() = '여기에-내-UID'::uuid)
  with check (auth.uid() = '여기에-내-UID'::uuid);

-- 4) 보여주기 링크용 공개 사본(public 행)은 누구나 읽기만 가능
create policy "public copy read" on public.library_data
  for select to anon, authenticated
  using (id = 'public');
