-- Factures au format du logiciel d'Enzo (TVA 20 %), avoirs, numérotation continue,
-- prix HT sur les RDV, notification des nouveaux avis Google avec réponse prête.

-- ---------------------------------------------------------------------------
-- 1. Documents : TVA, remise, dates, dossier, envoi
-- ---------------------------------------------------------------------------
alter table public.documents add column if not exists discount_pct numeric not null default 0;
alter table public.documents add column if not exists vat_rate numeric;            -- null = ancien document sans TVA
alter table public.documents add column if not exists total_ht numeric;
alter table public.documents add column if not exists delivery_on date;            -- date de la prestation
alter table public.documents add column if not exists payment_terms text;
alter table public.documents add column if not exists folder text;                 -- dossier : nom du client pro, ou « Particuliers »
alter table public.documents add column if not exists issuer jsonb;                -- coordonnées de l'entreprise figées à la validation
alter table public.documents add column if not exists finalized_at timestamptz;
alter table public.documents add column if not exists sent_at timestamptz;
alter table public.documents add column if not exists sent_to text;

alter table public.documents drop constraint if exists documents_kind_check;
alter table public.documents add constraint documents_kind_check check (kind in ('devis', 'facture', 'avoir'));
alter table public.documents drop constraint if exists documents_discount_check;
alter table public.documents add constraint documents_discount_check check (discount_pct >= 0 and discount_pct <= 100);

-- ---------------------------------------------------------------------------
-- 2. Numérotation : AAAA-MM-NNNN, compteur continu (à la suite du logiciel actuel)
--    Factures : 2026-11-0184, 2026-12-0185…   Avoirs : AV-2026-11-0001   Devis : D-2026-11-0001
--    Une facture reçoit son numéro définitif quand elle quitte l'état « Brouillon »
--    (aucun trou possible si un brouillon est supprimé).
-- ---------------------------------------------------------------------------
create schema if not exists private;
create table if not exists private.doc_counters (
  kind text primary key,
  last_number integer not null default 0
);
insert into private.doc_counters (kind, last_number) values ('facture', 183), ('avoir', 0), ('devis', 0)
on conflict (kind) do nothing;

create or replace function private.take_doc_number(p_kind text)
 returns text
 language plpgsql
 security definer
 set search_path to ''
as $$
declare v_n int; v_prefix text;
begin
  update private.doc_counters set last_number = last_number + 1 where kind = p_kind returning last_number into v_n;
  if v_n is null then raise exception 'kind'; end if;
  v_prefix := case p_kind when 'devis' then 'D-' when 'avoir' then 'AV-' else '' end;
  return v_prefix || to_char(now() at time zone 'Europe/Paris', 'YYYY-MM') || '-' || lpad(v_n::text, 4, '0');
end $$;

create or replace function public.next_document_number(p_kind text)
 returns text
 language plpgsql
 security definer
 set search_path to ''
as $$
begin
  if not private.is_team_member() then raise exception 'forbidden'; end if;
  if p_kind = 'devis' then return private.take_doc_number('devis'); end if;
  if p_kind in ('facture', 'avoir') then
    return 'BROUILLON-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  end if;
  raise exception 'kind';
end $$;

-- Validation d'une facture / d'un avoir : numéro définitif, date du jour, coordonnées figées.
-- Une facture validée ne se modifie plus (seuls l'état, le paiement et l'envoi bougent).
create or replace function private.documents_guard()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $$
declare v_today date := (now() at time zone 'Europe/Paris')::date;
begin
  if new.kind not in ('facture', 'avoir') then return new; end if;

  if tg_op = 'UPDATE' and old.status <> 'brouillon' then
    if new.status = 'brouillon' then raise exception 'facture_validee'; end if;
    if new.number is distinct from old.number or new.lines is distinct from old.lines or new.client is distinct from old.client
       or new.total is distinct from old.total or new.total_ht is distinct from old.total_ht or new.discount_pct is distinct from old.discount_pct
       or new.vat_rate is distinct from old.vat_rate or new.issued_at is distinct from old.issued_at or new.kind is distinct from old.kind
       or new.delivery_on is distinct from old.delivery_on then
      raise exception 'facture_validee';
    end if;
    return new;
  end if;

  if new.status <> 'brouillon' and (tg_op = 'INSERT' or old.status = 'brouillon') then
    if new.number is null or new.number like 'BROUILLON-%' then
      new.number := private.take_doc_number(new.kind);
    end if;
    new.finalized_at := now();
    new.issued_at := v_today;
    if new.due_at is null or new.due_at < v_today then new.due_at := v_today; end if;
    new.issuer := (select s.business from public.settings s where s.id = 1);
  end if;
  return new;
end $$;

drop trigger if exists documents_guard on public.documents;
create trigger documents_guard before insert or update on public.documents
  for each row execute function private.documents_guard();

create or replace function private.documents_no_delete()
 returns trigger
 language plpgsql
 set search_path to ''
as $$
begin
  if old.kind in ('facture', 'avoir') and old.status <> 'brouillon' then
    raise exception 'facture_validee';
  end if;
  return old;
end $$;

drop trigger if exists documents_no_delete on public.documents;
create trigger documents_no_delete before delete on public.documents
  for each row execute function private.documents_no_delete();

-- Brouillons existants : numéro provisoire (ils prendront un vrai numéro à la validation).
update public.documents
   set number = 'BROUILLON-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
 where kind = 'facture' and status = 'brouillon' and number not like 'BROUILLON-%';

-- Dossier par défaut des documents existants.
update public.documents
   set folder = coalesce(nullif(trim(client->>'company'), ''), 'Particuliers')
 where folder is null;

-- ---------------------------------------------------------------------------
-- 3. TVA de l'entreprise (Enzo facture la TVA à 20 %)
-- ---------------------------------------------------------------------------
update public.settings
   set business = (coalesce(business, '{}'::jsonb) - 'vat_note')
       || jsonb_build_object('vat_rate', 20, 'payment_terms', 'immédiat', 'legal_name', 'Enzo Soldet EI',
                             'rm', 'Enregistré au RM de Maine-et-Loire')
 where id = 1 and coalesce(business->>'vat_rate', '') = '';

-- ---------------------------------------------------------------------------
-- 4. Prix des RDV en HT
--    Les prix du site sont TTC (affichage consommateur) : la réservation en ligne
--    enregistre désormais le prix HT, comme quand Enzo le saisit lui-même.
-- ---------------------------------------------------------------------------
update public.leads l
   set quoted_price = round(l.quoted_price / 1.2, 2)
 where l.booked_online and l.quoted_price is not null
   and not exists (select 1 from public.documents d where d.lead_id = l.id);

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
  v_buf int; v_local timestamp; v_digits text; v_token text; v_attr jsonb; v_vat numeric;
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

  select coalesce((business->>'travel_buffer_min')::int, 30), coalesce((business->>'vat_rate')::numeric, 0)
    into v_buf, v_vat from public.settings where id = 1;
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
          p_start, p_minutes,
          case when p_price between 0 and 5000 then round(p_price / (1 + v_vat / 100), 2) else null end,
          left(nullif(trim(coalesce(p_notes, '')), ''), 3000), left(nullif(upper(trim(coalesce(p_ref_code, ''))), ''), 20),
          'reserve', 'reservation-en-ligne', true, v_attr, coalesce(p_consent, false))
  returning track_token into v_token;
  return v_token;
end $function$;

grant execute on function public.book_slot(text, text, text, text, text, text, text, text, timestamptz, integer, numeric, text, text, jsonb, boolean) to anon, authenticated;

-- Devis accepté en ligne : le prix du RDV reste en HT.
create or replace function public.accept_quote(p_token text, p_doc uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare l public.leads; d public.documents;
begin
  if p_token is null or char_length(p_token) < 16 then return false; end if;
  select * into l from public.leads where track_token = p_token;
  if not found then return false; end if;
  select * into d from public.documents where id = p_doc and lead_id = l.id and kind = 'devis';
  if not found or d.status <> 'envoye' then return false; end if;
  update public.documents set status = 'accepte' where id = d.id;
  if l.status in ('nouveau', 'contacte', 'devis_envoye') then
    update public.leads set status = 'reserve', quoted_price = coalesce(d.total_ht, d.total), next_followup_at = null where id = l.id;
  end if;
  insert into public.activities (lead_id, kind, content, author) values (l.id, 'statut', 'Devis ' || d.number || ' accepté en ligne par le client', 'client');
  perform private.ntfy_post('Devis accepté : ' || coalesce(l.first_name, '?'), 'Devis ' || d.number || ' (' || d.total || ' € TTC) accepté en ligne. À planifier !', 'tada');
  perform private.push_post('Devis accepté : ' || coalesce(l.first_name, '?'), 'Devis ' || d.number || ' (' || d.total || ' € TTC) accepté en ligne. À planifier !', '/equipe-15d6wpvzsq', 'devis-' || d.id);
  return true;
end $function$;

-- ---------------------------------------------------------------------------
-- 5. Page client (/suivi) : TVA, remise et prix TTC
-- ---------------------------------------------------------------------------
create or replace function public.get_tracking(p_token text)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
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
    'quoted_price', case when l.quoted_price is null then null
                         else round(l.quoted_price * (1 + coalesce((v_biz->>'vat_rate')::numeric, 0) / 100), 2) end,
    'referral_code', l.referral_code,
    'review_done', l.review_done,
    'visits', (select count(*) from public.jobs j where j.lead_id = l.id),
    'filleuls', (select count(*) from public.leads f where f.ref_code is not null and upper(f.ref_code) = l.referral_code and f.id <> l.id
                   and exists (select 1 from public.jobs j where j.lead_id = f.id)),
    'filleuls_attente', (select count(*) from public.leads f where f.ref_code is not null and upper(f.ref_code) = l.referral_code and f.id <> l.id
                   and not exists (select 1 from public.jobs j where j.lead_id = f.id) and f.status not in ('perdu')),
    'rewards_used', l.referral_rewards_used,
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object('kind', p.kind, 'path', p.path, 'taken_on', p.taken_on) order by p.created_at)
      from (select * from public.photos p where p.lead_id = l.id and p.kind in ('avant', 'apres')
            and p.taken_on = (select max(taken_on) from public.photos x where x.lead_id = l.id and x.kind in ('avant', 'apres'))
            order by p.created_at limit 16) p), '[]'::jsonb),
    'invoice', (
      select jsonb_build_object('number', d.number, 'issued_at', d.issued_at, 'lines', d.lines, 'total', d.total, 'status', d.status,
                                'paid_at', d.paid_at, 'client', d.client, 'total_ht', d.total_ht, 'vat_rate', d.vat_rate,
                                'discount_pct', d.discount_pct)
      from public.documents d where d.lead_id = l.id and d.kind = 'facture' and d.status not in ('annule', 'brouillon') order by d.created_at desc limit 1),
    'quote', (
      select jsonb_build_object('id', d.id, 'number', d.number, 'lines', d.lines, 'total', d.total, 'status', d.status, 'due_at', d.due_at,
                                'issued_at', d.issued_at, 'total_ht', d.total_ht, 'vat_rate', d.vat_rate, 'discount_pct', d.discount_pct)
      from public.documents d where d.lead_id = l.id and d.kind = 'devis' and d.status in ('envoye', 'accepte') order by d.created_at desc limit 1),
    'biz', jsonb_build_object(
      'name', v_biz->>'name', 'owner', v_biz->>'owner', 'siret', v_biz->>'siret', 'phone', v_biz->>'phone',
      'email', v_biz->>'email', 'address', v_biz->>'address', 'vat_note', v_biz->>'vat_note', 'vat_rate', v_biz->'vat_rate',
      'vat_number', v_biz->>'vat_number',
      'payment_terms', v_biz->>'payment_terms', 'payment_link', v_biz->>'payment_link',
      'deposit_pct', v_biz->'deposit_pct', 'loyalty_every', v_biz->'loyalty_every',
      'loyalty_discount', v_biz->'loyalty_discount', 'referral_reward', v_biz->>'referral_reward',
      'referral_goal', coalesce(v_biz->'referral_goal', '10'::jsonb))
  );
  return v_out;
end $function$;

-- ---------------------------------------------------------------------------
-- 6. Nouvel avis Google : réponse prête au prénom du client + notification
-- ---------------------------------------------------------------------------
create or replace function private.review_reply_draft(p_author text, p_rating int, p_seed text)
 returns text
 language plpgsql
 immutable
 set search_path to ''
as $$
declare
  v_name text := initcap(split_part(trim(coalesce(p_author, '')), ' ', 1));
  v_i int := abs(hashtext(coalesce(p_seed, ''))) % 3;
  v_hi text := case when v_name = '' or v_name ilike 'client%' then 'Bonjour' else 'Bonjour ' || v_name end;
begin
  if coalesce(p_rating, 5) >= 4 then
    return case v_i
      when 0 then v_hi || ', merci beaucoup pour votre avis ! Ravi que le résultat vous plaise. C''était un plaisir de m''occuper de votre voiture, à très bientôt pour le prochain nettoyage ✨ Enzo – La Clean Compagny'
      when 1 then v_hi || ', merci pour votre confiance et pour ce super retour ! Content que votre voiture ait retrouvé son éclat. Au plaisir de vous revoir pour un prochain nettoyage à domicile 🚗 Enzo – La Clean Compagny'
      else v_hi || ', un grand merci pour ces quelques mots ! Votre satisfaction est la meilleure récompense. N''hésitez pas à me recontacter quand votre voiture aura besoin d''un coup de propre 😉 Enzo – La Clean Compagny'
    end;
  elsif p_rating = 3 then
    return v_hi || ', merci pour votre avis. Je suis désolé que tout n''ait pas été parfait : pouvez-vous me dire ce qui vous a manqué ? Je tiens à ce que chaque client soit pleinement satisfait. Enzo – La Clean Compagny';
  else
    return v_hi || ', merci d''avoir pris le temps de laisser un avis. Je suis sincèrement désolé que la prestation ne vous ait pas satisfait. Contactez-moi directement au 06 38 57 83 04 pour qu''on trouve une solution ensemble. Enzo – La Clean Compagny';
  end if;
end $$;

create or replace function private.google_review_new()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $$
declare v_first text; v_lead uuid; v_n int;
begin
  if new.reply_draft is null and not coalesce(new.replied, false) then
    new.reply_draft := private.review_reply_draft(new.author, new.rating, new.id);
  end if;
  -- Seulement les avis récents (pas les anciens avis lors du premier relevé).
  if new.review_date is null or new.review_date >= (now() at time zone 'Europe/Paris')::date - 14 then
    perform private.push_post(
      '⭐ Nouvel avis Google' || case when new.rating is not null then ' (' || new.rating || '★)' else '' end,
      coalesce(new.author, 'Un client') || coalesce(' : « ' || left(new.body, 90) || case when length(new.body) > 90 then '…' else '' end || ' »', '') || ' — réponse prête dans l''appli',
      '/equipe-15d6wpvzsq?vue=avis', 'avis-' || new.id);
    -- Le client qui a laissé l'avis passe en « Avis reçu » (si un seul client en attente porte ce prénom).
    v_first := lower(split_part(trim(coalesce(new.author, '')), ' ', 1));
    if v_first <> '' then
      select count(*), min(id::text)::uuid into v_n, v_lead from public.leads
       where status = 'avis_demande' and lower(split_part(trim(first_name), ' ', 1)) = v_first;
      if v_n = 1 then
        update public.leads set status = 'avis_recu', review_done = true where id = v_lead;
        insert into public.activities (lead_id, kind, content, author) values (v_lead, 'statut', 'Avis Google reçu (' || coalesce(new.rating::text, '?') || '★)', 'google');
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists google_review_new on public.google_reviews;
create trigger google_review_new before insert on public.google_reviews
  for each row execute function private.google_review_new();

-- Brouillons de réponse pour les avis déjà relevés et sans réponse.
update public.google_reviews
   set reply_draft = private.review_reply_draft(author, rating, id)
 where not coalesce(replied, false) and coalesce(reply_draft, '') = '';

-- Google ne renvoie que 5 avis : si le nombre total augmente sans nouvel avis relevé, on prévient quand même.
create or replace function private.review_count_watch()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $$
declare v_prev numeric;
begin
  if new.source <> 'gbp' or new.metric <> 'avis_total' then return new; end if;
  select value into v_prev from public.stats_daily
   where source = 'gbp' and metric = 'avis_total' and day < new.day order by day desc limit 1;
  if tg_op = 'UPDATE' then v_prev := greatest(coalesce(v_prev, 0), coalesce(old.value, 0)); end if;
  if v_prev is not null and new.value > v_prev
     and not exists (select 1 from public.google_reviews where fetched_at > now() - interval '15 minutes'
                     and (review_date is null or review_date >= current_date - 14)) then
    perform private.push_post('⭐ Nouvel avis Google',
      'Vous avez maintenant ' || new.value::int || ' avis. Ouvrez la fiche Google pour le lire et y répondre.',
      '/equipe-15d6wpvzsq?vue=avis', 'avis-total');
  end if;
  return new;
end $$;

drop trigger if exists review_count_watch on public.stats_daily;
create trigger review_count_watch after insert or update of value on public.stats_daily
  for each row execute function private.review_count_watch();

-- Relevé Google aussi en journée (avis vus dans les 3 h au lieu du lendemain matin).
select cron.unschedule('lcc-google-sync-journee') where exists (select 1 from cron.job where jobname = 'lcc-google-sync-journee');
select cron.schedule('lcc-google-sync-journee', '20 8,11,14,17 * * *', 'select private.run_google_sync()');
