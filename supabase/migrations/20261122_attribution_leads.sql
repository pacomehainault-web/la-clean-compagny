-- Origine de chaque demande (pub Meta, Google Ads, fiche Google, Google naturel, réseaux…)
-- Rempli par le site à partir des paramètres UTM / gclid / fbclid et du site d'origine,
-- gardés 30 jours dans le navigateur du visiteur et envoyés seulement avec un formulaire.

alter table public.leads add column if not exists attribution jsonb;
alter table public.leads drop constraint if exists leads_attribution_size;
alter table public.leads add constraint leads_attribution_size check (attribution is null or pg_column_size(attribution) < 4000);

-- Réservation en ligne : ajoute l'origine et l'accord pour les relances (paramètres facultatifs,
-- l'ancienne version du site qui ne les envoie pas continue de fonctionner).
drop function if exists public.book_slot(text, text, text, text, text, text, text, text, timestamptz, integer, numeric, text, text);

create or replace function public.book_slot(
  p_first_name text, p_phone text, p_email text, p_service text, p_vehicle_size text, p_vehicle text,
  p_address text, p_city text, p_start timestamptz, p_minutes integer, p_price numeric, p_notes text, p_ref_code text,
  p_attribution jsonb default null, p_consent boolean default false)
 returns text
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_buf int; v_local timestamp; v_digits text; v_token text; v_attr jsonb;
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
  v_attr := case when p_attribution is not null and jsonb_typeof(p_attribution) = 'object' and pg_column_size(p_attribution) < 4000 then p_attribution else null end;

  perform pg_advisory_xact_lock(hashtext('lcc-booking'));
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
                            quoted_price, message, ref_code, status, source, booked_online, attribution, consent_relance)
  values (trim(p_first_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''), left(nullif(trim(coalesce(p_service, '')), ''), 120), p_vehicle_size,
          left(nullif(trim(coalesce(p_vehicle, '')), ''), 300), left(trim(p_address), 300), left(nullif(trim(coalesce(p_city, '')), ''), 120),
          p_start, p_minutes, case when p_price between 0 and 5000 then p_price else null end,
          left(nullif(trim(coalesce(p_notes, '')), ''), 3000), left(nullif(upper(trim(coalesce(p_ref_code, ''))), ''), 20),
          'reserve', 'reservation-en-ligne', true, v_attr, coalesce(p_consent, false))
  returning track_token into v_token;
  return v_token;
end $function$;

grant execute on function public.book_slot(text, text, text, text, text, text, text, text, timestamptz, integer, numeric, text, text, jsonb, boolean) to anon, authenticated;
