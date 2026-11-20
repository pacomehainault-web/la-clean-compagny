-- Relevé Google automatique (fonction google-sync) : secret d'appel, journal, tâche quotidienne.
create table if not exists private.sync_config (
  id integer primary key default 1 check (id = 1),
  secret text not null default encode(extensions.gen_random_bytes(24), 'hex')
);
insert into private.sync_config (id) values (1) on conflict (id) do nothing;

create or replace function public.sync_check(p_secret text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.sync_config where id = 1 and secret = p_secret)
$$;
revoke all on function public.sync_check(text) from public, anon, authenticated;
grant execute on function public.sync_check(text) to service_role;

create table if not exists public.sync_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  result jsonb not null default '{}'::jsonb
);
alter table public.sync_log enable row level security;
drop policy if exists team_read_sync_log on public.sync_log;
create policy team_read_sync_log on public.sync_log for select to authenticated using (private.is_team_member());

create or replace function private.run_google_sync()
returns void language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  select secret into v_secret from private.sync_config where id = 1;
  perform net.http_post(
    url := 'https://ibeejsvztajwploqmnkh.supabase.co/functions/v1/google-sync',
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-sync-secret', v_secret),
    timeout_milliseconds := 60000
  );
end $$;

select cron.unschedule('lcc-google-sync') where exists (select 1 from cron.job where jobname = 'lcc-google-sync');
select cron.schedule('lcc-google-sync', '20 5 * * *', 'select private.run_google_sync()');
