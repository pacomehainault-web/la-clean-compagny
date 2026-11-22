-- SMS automatiques (Brevo) : confirmation de demande, relances des demandes sans
-- réservation, rappel la veille du RDV, demande d'avis + relance, rappel d'entretien.
--
-- Tout est INACTIF tant que :
--   1) la clé API Brevo n'est pas enregistrée (Réglages → SMS automatiques) ;
--   2) chaque type de SMS n'est pas activé (interrupteurs, tous éteints par défaut).
-- Envois du lundi au samedi, 8 h - 20 h (heure de Paris), 25 SMS maximum par passage.
-- Relances, avis et entretien : seulement si le client a coché la case d'accord,
-- avec la mention STOP (Brevo remplace [STOP_CODE] par son numéro STOP).

create table if not exists private.sms_config (
  id int primary key default 1 check (id = 1),
  api_key text,
  sender text not null default 'LaClean',
  updated_at timestamptz not null default now()
);
insert into private.sms_config (id) values (1) on conflict (id) do nothing;

create table if not exists public.auto_messages (
  id bigserial primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  kind text not null,
  dedupe text not null unique,
  phone text,
  body text,
  status text not null default 'en_cours',
  request_id bigint,
  response text,
  created_at timestamptz not null default now()
);
create index if not exists auto_messages_lead_idx on public.auto_messages (lead_id);
alter table public.auto_messages enable row level security;
drop policy if exists team_select_auto_messages on public.auto_messages;
create policy team_select_auto_messages on public.auto_messages for select to authenticated using (private.is_team_member());
grant select on public.auto_messages to authenticated;

-- Numéro de portable français → format international sans « + » (ex. 33612345678), sinon null.
create or replace function private.sms_phone(p text) returns text
language sql immutable set search_path = '' as $$
  select case
    when d ~ '^0[67][0-9]{8}$' then '33' || substr(d, 2)
    when d ~ '^33[67][0-9]{8}$' then d
    when d ~ '^0033[67][0-9]{8}$' then substr(d, 3)
    else null end
  from (select regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g') as d) x
$$;

-- Famille de prestation → délai avant rappel d'entretien (même logique que lib/catalog.js).
create or replace function private.recall_days(p_service text) returns int
language sql immutable set search_path = '' as $$
  select case
    when s ~ 'canap|matelas|tapis|tissu' then 180
    when s ~ 'phare|optique' then 365
    when s ~ 'moto' then 60
    when s ~ 'c[ée]ramique' then 365
    when s ~ 'lustrage|polissage|correction' then 180
    when s ~ 'int[ée]rieur \+ ext|complet' then 60
    when s ~ 'int[ée]rieur|propre|concession|ozone' then 90
    when s ~ 'ext|lavage|d[ée]contamination' then 30
    else 120 end
  from (select lower(coalesce(p_service, '')) as s) x
$$;

create or replace function private.sms_default_template(p_kind text) returns text
language sql immutable set search_path = '' as $$
  select case p_kind
    when 'confirmation' then 'Bonjour {prenom}, merci pour votre demande ! Enzo de La Clean Compagny vous rappelle très vite. Réserver directement : {lien_reserver}'
    when 'confirmation_rdv' then 'Bonjour {prenom}, votre RDV La Clean Compagny est bien enregistré : {date} à {heure}. Suivi et infos : {lien_suivi}'
    when 'relance1' then 'Bonjour {prenom}, c''est Enzo de La Clean Compagny. Toujours partant pour votre nettoyage ? Choisissez votre créneau en 1 min : {lien_reserver} STOP au [STOP_CODE]'
    when 'relance2' then 'Bonjour {prenom}, dernier petit message : il reste des créneaux pour votre nettoyage à domicile. {lien_reserver} ou appelez le {telephone}. STOP au [STOP_CODE]'
    when 'veille' then 'Rappel La Clean Compagny : Enzo passe {date} à {heure} pour votre {prestation}. Pensez à vider le véhicule. Un souci ? {telephone}'
    when 'avis' then 'Merci {prenom} pour votre confiance ! Votre avis Google aide beaucoup La Clean Compagny (30 s) : {lien_avis} STOP au [STOP_CODE]'
    when 'relance_avis' then 'Bonjour {prenom}, si vous avez 30 secondes, votre avis sur La Clean Compagny nous aiderait énormément : {lien_avis} Merci ! STOP au [STOP_CODE]'
    when 'entretien' then 'Bonjour {prenom}, c''est le bon moment pour un nouveau nettoyage de votre véhicule ! Créneaux en ligne : {lien_reserver} STOP au [STOP_CODE]'
    else null end
$$;

-- Texte final d'un SMS pour un prospect (modèle modifiable dans settings.automations.templates).
create or replace function private.sms_render(p_kind text, p_lead public.leads, p_auto jsonb, p_biz jsonb) returns text
language plpgsql stable set search_path = '' as $$
declare
  v_tpl text := coalesce(nullif(trim(p_auto -> 'templates' ->> p_kind), ''), private.sms_default_template(p_kind));
  v_local timestamp := p_lead.appointment_at at time zone 'Europe/Paris';
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_days text[] := array['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  v_date text;
begin
  if v_tpl is null then return null; end if;
  if v_local is not null then
    v_date := case
      when v_local::date = v_today then 'aujourd''hui'
      when v_local::date = v_today + 1 then 'demain'
      else v_days[extract(isodow from v_local)::int] || ' ' || to_char(v_local, 'DD/MM') end;
  end if;
  return left(
    replace(replace(replace(replace(replace(replace(replace(replace(v_tpl,
      '{prenom}', coalesce(nullif(split_part(trim(coalesce(p_lead.first_name, '')), ' ', 1), ''), '')),
      '{date}', coalesce(v_date, '')),
      '{heure}', coalesce(replace(to_char(v_local, 'FMHH24"h"MI'), 'h00', 'h'), '')),
      '{prestation}', coalesce(lower(left(translate(nullif(p_lead.service, ''), '–—’', '--'''''), 40)), 'nettoyage')),
      '{lien_reserver}', 'lacleancompagny.com/reserver'),
      '{lien_suivi}', 'lacleancompagny.com/suivi/' || coalesce(p_lead.track_token, '')),
      '{lien_avis}', coalesce(nullif(p_biz ->> 'review_url', ''), 'https://g.page/r/CSFtfbCI8GR-EBM/review')),
      '{telephone}', coalesce(nullif(p_biz ->> 'phone', ''), '06 38 57 83 04')),
    480);
end $$;

-- Envoi d'un SMS (enregistré une seule fois grâce à « dedupe »). Renvoie true si parti.
create or replace function private.sms_send(p_lead uuid, p_kind text, p_dedupe text, p_phone text, p_body text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  cfg private.sms_config; v_id bigint; v_req bigint;
begin
  select * into cfg from private.sms_config where id = 1;
  if cfg.api_key is null or cfg.api_key = '' or p_phone is null or coalesce(p_body, '') = '' then return false; end if;
  insert into public.auto_messages (lead_id, kind, dedupe, phone, body)
  values (p_lead, p_kind, p_dedupe, p_phone, p_body)
  on conflict (dedupe) do nothing
  returning id into v_id;
  if v_id is null then return false; end if;
  v_req := net.http_post(
    url := 'https://api.brevo.com/v3/transactionalSMS/send',
    body := jsonb_build_object('sender', cfg.sender, 'recipient', p_phone, 'content', p_body,
                               'type', case when p_body like '%[STOP_CODE]%' then 'marketing' else 'transactional' end,
                               'tag', 'lcc-' || p_kind),
    headers := jsonb_build_object('Content-Type', 'application/json', 'accept', 'application/json', 'api-key', cfg.api_key),
    timeout_milliseconds := 15000
  );
  update public.auto_messages set request_id = v_req where id = v_id;
  if p_lead is not null then
    insert into public.activities (lead_id, author, kind, content) values (p_lead, 'automatique', 'sms_auto', p_body);
  end if;
  return true;
end $$;

-- Passage automatique (toutes les 10 minutes).
create or replace function private.run_auto_sms() returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_auto jsonb; v_biz jsonb; v_local timestamp := now() at time zone 'Europe/Paris';
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_hour int := extract(hour from now() at time zone 'Europe/Paris');
  v_count int := 0; v_max int := 25; r record; v_has_key boolean;
begin
  -- Résultat des envois précédents (réponse de Brevo).
  update public.auto_messages m
     set status = case when resp.status_code between 200 and 299 then 'envoye' else 'erreur' end,
         response = left(coalesce(resp.content, resp.error_msg, ''), 500)
    from net._http_response resp
   where m.request_id = resp.id and m.status = 'en_cours';

  select (api_key is not null and api_key <> '') into v_has_key from private.sms_config where id = 1;
  if not coalesce(v_has_key, false) then return 0; end if;
  if extract(isodow from v_local) = 7 or v_hour < 8 or v_hour >= 20 then return 0; end if;
  select coalesce(automations, '{}'::jsonb), coalesce(business, '{}'::jsonb) into v_auto, v_biz from public.settings where id = 1;

  for r in
    with base as (
      select l.*, private.sms_phone(l.phone) as intl,
             (select max(j.done_at) from public.jobs j where j.lead_id = l.id) as last_done
        from public.leads l
       where coalesce(l.source, '') <> 'test' and l.partner is null and private.sms_phone(l.phone) is not null
    ),
    c as (
      -- Confirmation d'une demande ou d'une réservation reçue sur le site.
      select b.id, b.intl, case when b.booked_online then 'confirmation_rdv' else 'confirmation' end as kind,
             'confirmation:' || b.id as dedupe, 1 as prio
        from base b
       where (v_auto ->> 'sms_confirmation')::boolean is true
         and b.created_at > now() - interval '12 hours'
         and (b.booked_online or b.source like 'accueil%' or b.source like 'prestation-%' or b.source like 'devis%')
         and (not b.booked_online or b.appointment_at > now())
      union all
      -- Rappel la veille (envoyé entre 17 h et 20 h ; le samedi pour les RDV du lundi).
      select b.id, b.intl, 'veille', 'veille:' || b.id || ':' || (b.appointment_at at time zone 'Europe/Paris')::date, 2
        from base b
       where (v_auto ->> 'sms_veille')::boolean is true and v_hour >= 17
         and b.status = 'reserve' and b.appointment_at is not null
         and ((b.appointment_at at time zone 'Europe/Paris')::date = v_today + 1
              or (extract(isodow from v_local) = 6 and (b.appointment_at at time zone 'Europe/Paris')::date = v_today + 2))
      union all
      -- 1re relance : demande sans RDV depuis ~1 jour.
      select b.id, b.intl, 'relance1', 'relance1:' || b.id, 3
        from base b
       where (v_auto ->> 'sms_relance')::boolean is true and b.consent_relance
         and v_hour between 9 and 19
         and b.status in ('nouveau', 'contacte', 'devis_envoye') and b.appointment_at is null
         and b.created_at between now() - interval '7 days' and now() - interval '20 hours'
      union all
      -- 2e relance : ~3 jours après la demande, 40 h minimum après la 1re.
      select b.id, b.intl, 'relance2', 'relance2:' || b.id, 4
        from base b
       where (v_auto ->> 'sms_relance')::boolean is true and b.consent_relance
         and v_hour between 9 and 19
         and b.status in ('nouveau', 'contacte', 'devis_envoye') and b.appointment_at is null
         and b.created_at between now() - interval '10 days' and now() - interval '68 hours'
         and exists (select 1 from public.auto_messages m where m.dedupe = 'relance1:' || b.id and m.created_at < now() - interval '40 hours')
      union all
      -- Demande d'avis : prestation faite il y a 2 h à 14 jours, avis jamais demandé.
      select b.id, b.intl, 'avis', 'avis:' || b.id, 5
        from base b
       where (v_auto ->> 'sms_avis')::boolean is true and b.consent_relance
         and v_hour between 10 and 19
         and b.status = 'fait' and b.review_requested_at is null and not coalesce(b.review_done, false)
         and b.last_done between v_today - 14 and v_today and b.updated_at < now() - interval '2 hours'
      union all
      -- Relance d'avis : 3 à 14 jours après la demande, avis pas reçu.
      select b.id, b.intl, 'relance_avis', 'relance_avis:' || b.id, 6
        from base b
       where (v_auto ->> 'sms_avis')::boolean is true and b.consent_relance
         and v_hour between 10 and 19
         and b.status = 'avis_demande' and not coalesce(b.review_done, false)
         and b.review_requested_at between now() - interval '14 days' and now() - interval '3 days'
      union all
      -- Rappel d'entretien : au bon délai selon la prestation (fenêtre de 7 jours).
      select b.id, b.intl, 'entretien', 'entretien:' || b.id || ':' || b.last_done, 7
        from base b
       where (v_auto ->> 'sms_entretien')::boolean is true and b.consent_relance
         and v_hour between 10 and 19
         and b.status in ('fait', 'avis_demande', 'avis_recu') and b.last_done is not null
         and v_today - b.last_done between private.recall_days(b.service) and private.recall_days(b.service) + 7
         and b.next_followup_at is null
         and not (b.appointment_at is not null and b.appointment_at > now())
    )
    select c.*, l as lead_row from c join public.leads l on l.id = c.id
     where not exists (select 1 from public.auto_messages m where m.dedupe = c.dedupe)
     order by c.prio
     limit v_max
  loop
    if private.sms_send(r.id, r.kind, r.dedupe, r.intl, private.sms_render(r.kind, r.lead_row, v_auto, v_biz)) then
      v_count := v_count + 1;
      if r.kind = 'avis' then
        update public.leads set review_requested_at = now(), status = 'avis_demande' where id = r.id and status = 'fait';
      end if;
    end if;
  end loop;
  return v_count;
end $$;

-- ---------- Fonctions appelées par l'appli (équipe connectée uniquement) ----------

create or replace function public.sms_status() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare cfg private.sms_config;
begin
  if not private.is_team_member() then raise exception 'interdit'; end if;
  select * into cfg from private.sms_config where id = 1;
  return jsonb_build_object(
    'configured', cfg.api_key is not null and cfg.api_key <> '',
    'key_hint', case when cfg.api_key is not null and length(cfg.api_key) > 8 then '…' || right(cfg.api_key, 4) else null end,
    'sender', cfg.sender,
    'sent_30d', (select count(*) from public.auto_messages where status = 'envoye' and created_at > now() - interval '30 days'),
    'errors_7d', (select count(*) from public.auto_messages where status = 'erreur' and created_at > now() - interval '7 days'));
end $$;

-- p_key : null = ne pas changer, '' = supprimer la clé.
create or replace function public.sms_config_set(p_key text, p_sender text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_team_member() then raise exception 'interdit'; end if;
  if p_sender is not null and p_sender !~ '^[A-Za-z0-9]{3,11}$' then raise exception 'expediteur'; end if;
  update private.sms_config
     set api_key = case when p_key is null then api_key else nullif(trim(p_key), '') end,
         sender = coalesce(p_sender, sender),
         updated_at = now()
   where id = 1;
end $$;

create or replace function public.sms_test(p_phone text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_intl text := private.sms_phone(p_phone);
begin
  if not private.is_team_member() then raise exception 'interdit'; end if;
  if v_intl is null then raise exception 'telephone'; end if;
  if (select count(*) from public.auto_messages where kind = 'test' and created_at > now() - interval '1 hour') >= 5 then raise exception 'limite'; end if;
  return private.sms_send(null, 'test', 'test:' || gen_random_uuid(), v_intl,
    'Test La Clean Compagny : les SMS automatiques fonctionnent.');
end $$;

revoke all on function public.sms_status() from public, anon;
revoke all on function public.sms_config_set(text, text) from public, anon;
revoke all on function public.sms_test(text) from public, anon;
grant execute on function public.sms_status() to authenticated;
grant execute on function public.sms_config_set(text, text) to authenticated;
grant execute on function public.sms_test(text) to authenticated;
revoke all on function private.sms_send(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function private.run_auto_sms() from public, anon, authenticated;

-- Toutes les 10 minutes (ne fait rien tant que la clé et les interrupteurs ne sont pas activés).
select cron.unschedule('lcc-sms-auto') where exists (select 1 from cron.job where jobname = 'lcc-sms-auto');
select cron.schedule('lcc-sms-auto', '*/10 * * * *', 'select private.run_auto_sms()');
