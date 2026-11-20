-- Appli équipe v2 : suivi client en direct, réservation en ligne, photos,
-- fidélité / parrainage, garages partenaires, stock, abonnements.
-- Migration uniquement additive : aucune colonne ni donnée supprimée.

-- ---------- Prospects / clients ----------
alter table public.leads
  add column if not exists track_token text,
  add column if not exists track_stage text,
  add column if not exists eta_at timestamptz,
  add column if not exists checklist jsonb not null default '{}'::jsonb,
  add column if not exists inspection jsonb not null default '{}'::jsonb,
  add column if not exists referral_code text,
  add column if not exists ref_code text,
  add column if not exists partner text,
  add column if not exists plate text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists booked_online boolean not null default false;

update public.leads set track_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 20) where track_token is null;
update public.leads set referral_code = upper(substr(md5(gen_random_uuid()::text), 1, 6)) where referral_code is null;

alter table public.leads
  alter column track_token set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 20),
  alter column track_token set not null,
  alter column referral_code set default upper(substr(md5(gen_random_uuid()::text), 1, 6));

do $$ begin
  alter table public.leads add constraint leads_track_token_key unique (track_token);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_referral_code_key unique (referral_code);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_track_stage_check check (track_stage is null or track_stage in ('en_route', 'sur_place', 'termine'));
  alter table public.leads add constraint leads_ref_code_check check (ref_code is null or char_length(ref_code) <= 20);
  alter table public.leads add constraint leads_partner_check check (partner is null or char_length(partner) <= 80);
  alter table public.leads add constraint leads_plate_check check (plate is null or char_length(plate) <= 20);
exception when duplicate_object then null; end $$;

create index if not exists leads_ref_code_idx on public.leads (ref_code) where ref_code is not null;

-- Les formulaires du site ne peuvent pas remplir les champs internes.
drop policy if exists site_insert_leads on public.leads;
create policy site_insert_leads on public.leads for insert to anon with check (
  status = 'nouveau' and notes is null and quoted_price is null and appointment_at is null
  and next_followup_at is null and lost_reason is null and review_requested_at is null
  and track_stage is null and partner is null and booked_online = false
);

-- ---------- Prestations ----------
alter table public.jobs
  add column if not exists minutes integer,
  add column if not exists partner text,
  add column if not exists plate text,
  add column if not exists discount numeric not null default 0;

-- ---------- Photos (avant / après / état des lieux / signature) ----------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null check (kind in ('avant', 'apres', 'etat', 'signature')),
  path text not null check (char_length(path) <= 300),
  caption text check (caption is null or char_length(caption) <= 300),
  taken_on date not null default (now() at time zone 'Europe/Paris')::date,
  created_at timestamptz not null default now()
);
create index if not exists photos_lead_idx on public.photos (lead_id, created_at desc);
create index if not exists photos_day_idx on public.photos (taken_on);
alter table public.photos enable row level security;
drop policy if exists team_all_photos on public.photos;
create policy team_all_photos on public.photos for all to authenticated using (private.is_team_member()) with check (private.is_team_member());

-- Fichiers : lecture publique par URL (noms impossibles à deviner), écriture réservée à l'équipe.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
drop policy if exists team_photos_insert on storage.objects;
drop policy if exists team_photos_update on storage.objects;
drop policy if exists team_photos_delete on storage.objects;
create policy team_photos_insert on storage.objects for insert to authenticated with check (bucket_id = 'photos' and private.is_team_member());
create policy team_photos_update on storage.objects for update to authenticated using (bucket_id = 'photos' and private.is_team_member());
create policy team_photos_delete on storage.objects for delete to authenticated using (bucket_id = 'photos' and private.is_team_member());

-- ---------- Stock produits ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  unit text not null default 'L' check (char_length(unit) <= 20),
  stock numeric not null default 0,
  per_job numeric not null default 0 check (per_job >= 0),
  applies_to text not null default 'tout' check (applies_to in ('tout', 'interieur', 'exterieur', 'lustrage')),
  alert_at numeric not null default 0 check (alert_at >= 0),
  price numeric check (price is null or price >= 0),
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists team_all_products on public.products;
create policy team_all_products on public.products for all to authenticated using (private.is_team_member()) with check (private.is_team_member());

-- ---------- Formules d'entretien (abonnements) ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  price numeric not null default 0 check (price >= 0),
  every_days integer not null default 30 check (every_days between 7 and 365),
  next_on date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_lead_idx on public.subscriptions (lead_id);
alter table public.subscriptions enable row level security;
drop policy if exists team_all_subscriptions on public.subscriptions;
create policy team_all_subscriptions on public.subscriptions for all to authenticated using (private.is_team_member()) with check (private.is_team_member());

-- ---------- Réglages par défaut (sans écraser l'existant) ----------
update public.settings
set business = jsonb_build_object(
  'travel_buffer_min', 30,
  'loyalty_every', 5,
  'loyalty_discount', 20,
  'referral_reward', '-10 % pour vous et votre filleul',
  'payment_link', '',
  'deposit_pct', 0,
  'base_address', 'Angers'
) || business
where id = 1;

-- ---------- Alerte : réservation en ligne ----------
create or replace function private.on_new_lead()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_on boolean;
begin
  if new.source = 'test' then return new; end if;
  select coalesce((automations->>'new_lead')::boolean, true) into v_on from public.settings where id = 1;
  if not coalesce(v_on, true) then return new; end if;
  if new.booked_online then
    perform private.ntfy_post(
      'Nouvelle réservation : ' || coalesce(new.first_name, '?'),
      concat_ws(' · ', to_char(new.appointment_at at time zone 'Europe/Paris', 'DD/MM à HH24"h"MI'), nullif(new.service, ''), nullif(new.city, '')),
      'calendar');
  else
    perform private.ntfy_post(
      'Nouveau prospect : ' || coalesce(new.first_name, '?'),
      concat_ws(' · ', nullif(new.service, ''), nullif(new.city, ''), nullif(new.vehicle, '')) || E'\nÀ rappeler vite !',
      'rotating_light');
  end if;
  return new;
end $$;

-- ---------- Page de suivi client (lien secret) ----------
create or replace function public.get_tracking(p_token text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare l public.leads; v_biz jsonb; v_out jsonb;
begin
  if p_token is null or char_length(p_token) < 16 then return null; end if;
  select * into l from public.leads where track_token = p_token;
  if not found then return null; end if;
  select business into v_biz from public.settings where id = 1;
  v_out := jsonb_build_object(
    'first_name', l.first_name,
    'service', l.service,
    'vehicle', l.vehicle,
    'address', l.address,
    'city', l.city,
    'appointment_at', l.appointment_at,
    'duration_min', l.duration_min,
    'status', l.status,
    'track_stage', l.track_stage,
    'eta_at', l.eta_at,
    'quoted_price', l.quoted_price,
    'referral_code', l.referral_code,
    'review_done', l.review_done,
    'visits', (select count(*) from public.jobs j where j.lead_id = l.id),
    'filleuls', (select count(*) from public.leads f where f.ref_code is not null and upper(f.ref_code) = l.referral_code and f.id <> l.id),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object('kind', p.kind, 'path', p.path, 'taken_on', p.taken_on) order by p.created_at)
      from (select * from public.photos p where p.lead_id = l.id and p.kind in ('avant', 'apres')
            and p.taken_on = (select max(taken_on) from public.photos x where x.lead_id = l.id and x.kind in ('avant', 'apres'))
            order by p.created_at limit 16) p), '[]'::jsonb),
    'invoice', (
      select jsonb_build_object('number', d.number, 'issued_at', d.issued_at, 'lines', d.lines, 'total', d.total, 'status', d.status, 'paid_at', d.paid_at, 'client', d.client)
      from public.documents d where d.lead_id = l.id and d.kind = 'facture' and d.status <> 'annule' order by d.created_at desc limit 1),
    'quote', (
      select jsonb_build_object('id', d.id, 'number', d.number, 'lines', d.lines, 'total', d.total, 'status', d.status, 'due_at', d.due_at, 'issued_at', d.issued_at)
      from public.documents d where d.lead_id = l.id and d.kind = 'devis' and d.status in ('envoye', 'accepte') order by d.created_at desc limit 1),
    'biz', jsonb_build_object(
      'name', v_biz->>'name', 'owner', v_biz->>'owner', 'siret', v_biz->>'siret', 'phone', v_biz->>'phone',
      'email', v_biz->>'email', 'address', v_biz->>'address', 'vat_note', v_biz->>'vat_note',
      'payment_terms', v_biz->>'payment_terms', 'payment_link', v_biz->>'payment_link',
      'deposit_pct', v_biz->'deposit_pct', 'loyalty_every', v_biz->'loyalty_every',
      'loyalty_discount', v_biz->'loyalty_discount', 'referral_reward', v_biz->>'referral_reward')
  );
  return v_out;
end $$;

-- Le client accepte son devis depuis sa page de suivi.
create or replace function public.accept_quote(p_token text, p_doc uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare l public.leads; d public.documents;
begin
  if p_token is null or char_length(p_token) < 16 then return false; end if;
  select * into l from public.leads where track_token = p_token;
  if not found then return false; end if;
  select * into d from public.documents where id = p_doc and lead_id = l.id and kind = 'devis';
  if not found or d.status <> 'envoye' then return false; end if;
  update public.documents set status = 'accepte' where id = d.id;
  if l.status in ('nouveau', 'contacte', 'devis_envoye') then
    update public.leads set status = 'reserve', quoted_price = d.total, next_followup_at = null where id = l.id;
  end if;
  insert into public.activities (lead_id, kind, content, author) values (l.id, 'statut', 'Devis ' || d.number || ' accepté en ligne par le client', 'client');
  perform private.ntfy_post('Devis accepté : ' || coalesce(l.first_name, '?'), 'Devis ' || d.number || ' (' || d.total || ' €) accepté en ligne. À planifier !', 'tada');
  return true;
end $$;

-- Créneaux occupés (heures seulement, aucune donnée client) pour la réservation en ligne.
create or replace function public.public_busy(p_from date, p_days integer default 21)
returns table (s timestamptz, e timestamptz) language sql stable security definer set search_path = '' as $$
  select l.appointment_at,
         l.appointment_at + make_interval(mins => coalesce(l.duration_min, 150) + coalesce((st.business->>'travel_buffer_min')::int, 30))
  from public.leads l cross join public.settings st
  where st.id = 1 and l.appointment_at is not null and l.status <> 'perdu'
    and l.appointment_at >= p_from::timestamptz - interval '1 day'
    and l.appointment_at < p_from::timestamptz + make_interval(days => least(greatest(p_days, 1), 45))
$$;

-- Réservation en ligne : vérifie le créneau et crée le RDV, renvoie le lien de suivi.
create or replace function public.book_slot(
  p_first_name text, p_phone text, p_email text, p_service text, p_vehicle_size text, p_vehicle text,
  p_address text, p_city text, p_start timestamptz, p_minutes integer, p_price numeric, p_notes text, p_ref_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_buf int; v_local timestamp; v_digits text; v_token text;
begin
  v_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  if char_length(trim(coalesce(p_first_name, ''))) < 1 or char_length(p_first_name) > 80 then raise exception 'nom'; end if;
  if v_digits !~ '^(\+33|0033|0)[1-9][0-9]{8}$' then raise exception 'telephone'; end if;
  if char_length(trim(coalesce(p_address, ''))) < 3 or char_length(p_address) > 300 then raise exception 'adresse'; end if;
  if p_minutes is null or p_minutes < 30 or p_minutes > 600 then raise exception 'duree'; end if;
  if p_start < now() + interval '2 hours' or p_start > now() + interval '60 days' then raise exception 'date'; end if;
  v_local := p_start at time zone 'Europe/Paris';
  if extract(isodow from v_local) = 7 then raise exception 'dimanche'; end if;
  if extract(hour from v_local) < 8 or v_local + make_interval(mins => p_minutes) > date_trunc('day', v_local) + interval '19 hours' then raise exception 'horaires'; end if;
  if p_vehicle_size is not null and p_vehicle_size not in ('citadine', 'compacte-berline', 'suv-break', 'grand-suv', 'utilitaire', 'moto', 'autre') then raise exception 'gabarit'; end if;

  perform pg_advisory_xact_lock(hashtext('lcc-booking'));
  -- Anti-abus : 2 réservations par numéro et par jour, 15 par heure au total.
  if (select count(*) from public.leads where booked_online and regexp_replace(phone, '[^0-9+]', '', 'g') = v_digits and created_at > now() - interval '1 day') >= 2 then raise exception 'limite'; end if;
  if (select count(*) from public.leads where booked_online and created_at > now() - interval '1 hour') >= 15 then raise exception 'limite'; end if;

  select coalesce((business->>'travel_buffer_min')::int, 30) into v_buf from public.settings where id = 1;
  if exists (
    select 1 from public.leads l
    where l.appointment_at is not null and l.status <> 'perdu'
      and l.appointment_at < p_start + make_interval(mins => p_minutes + v_buf)
      and l.appointment_at + make_interval(mins => coalesce(l.duration_min, 150) + v_buf) > p_start
  ) then raise exception 'pris'; end if;

  insert into public.leads (first_name, phone, email, service, vehicle_size, vehicle, address, city, appointment_at, duration_min,
                            quoted_price, message, ref_code, status, source, booked_online)
  values (trim(p_first_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''), left(nullif(trim(coalesce(p_service, '')), ''), 120), p_vehicle_size,
          left(nullif(trim(coalesce(p_vehicle, '')), ''), 300), left(trim(p_address), 300), left(nullif(trim(coalesce(p_city, '')), ''), 120),
          p_start, p_minutes, case when p_price between 0 and 5000 then p_price else null end,
          left(nullif(trim(coalesce(p_notes, '')), ''), 3000), left(nullif(upper(trim(coalesce(p_ref_code, ''))), ''), 20),
          'reserve', 'reservation-en-ligne', true)
  returning track_token into v_token;
  return v_token;
end $$;

revoke all on function public.get_tracking(text) from public;
revoke all on function public.accept_quote(text, uuid) from public;
revoke all on function public.public_busy(date, integer) from public;
revoke all on function public.book_slot(text, text, text, text, text, text, text, text, timestamptz, integer, numeric, text, text) from public;
grant execute on function public.get_tracking(text) to anon, authenticated;
grant execute on function public.accept_quote(text, uuid) to anon, authenticated;
grant execute on function public.public_busy(date, integer) to anon, authenticated;
grant execute on function public.book_slot(text, text, text, text, text, text, text, text, timestamptz, integer, numeric, text, text) to anon, authenticated;
