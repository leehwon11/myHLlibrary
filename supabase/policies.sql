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

-- ──────────────────────────────────────────────
-- 가입 코드: 이 코드를 입력한 사람만 회원가입 가능
-- '여기에-가입-코드' 를 원하는 코드로 바꿔서 실행하세요. 코드를 바꿀 때도 이 부분만 다시 실행하면 돼요.
-- 앱이 가입 요청에 invite_code 를 담아 보내고, 계정이 만들어지기 직전에 여기서 확인해요.
-- 맞으면 코드는 저장하지 않고 지우고, 틀리면 계정을 만들지 않아요.
create or replace function public.check_invite_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'invite_code', '') <> '여기에-가입-코드' then
    raise exception 'INVALID_INVITE_CODE';
  end if;
  new.raw_user_meta_data := new.raw_user_meta_data - 'invite_code';
  return new;
end;
$$;

revoke execute on function public.check_invite_code() from public, anon, authenticated;

drop trigger if exists check_invite_code on auth.users;
create trigger check_invite_code
  before insert on auth.users
  for each row execute function public.check_invite_code();
