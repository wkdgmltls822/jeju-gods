-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하세요. (여러 번 실행해도 안전합니다)

-- 즐겨찾기한 신
create table if not exists favorite_gods (
  id bigint generated always as identity primary key,
  nickname text not null,
  god_id text not null,
  created_at timestamptz not null default now(),
  unique (nickname, god_id)
);

-- 신과 나눈 대화 기록
create table if not exists chat_logs (
  id bigint generated always as identity primary key,
  nickname text not null,
  god_id text not null,
  role text not null check (role in ('user', 'assistant')),
  text text not null,
  created_at timestamptz not null default now()
);

-- 로그인 없이 닉네임으로 구분하는 과제용 설정입니다.
-- anon 키로 읽기·쓰기를 허용하므로, 실제 서비스라면 Supabase Auth 로 바꿔야 합니다.
alter table favorite_gods enable row level security;
alter table chat_logs enable row level security;

drop policy if exists "favorite_gods anon all" on favorite_gods;
create policy "favorite_gods anon all" on favorite_gods
  for all to anon using (true) with check (true);

drop policy if exists "chat_logs anon read" on chat_logs;
create policy "chat_logs anon read" on chat_logs for select to anon using (true);
drop policy if exists "chat_logs anon insert" on chat_logs;
create policy "chat_logs anon insert" on chat_logs for insert to anon with check (true);
