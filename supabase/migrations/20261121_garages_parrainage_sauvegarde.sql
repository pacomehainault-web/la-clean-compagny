-- Garages partenaires (voitures scannées une par une), parrainage « 10 filleuls = nettoyage offert »,
-- sauvegarde automatique vers Google Sheets. Migration uniquement additive.

-- ---------- Voitures des garages partenaires ----------
create table if not exists public.garage_cars (
  id uuid primary key default gen_random_uuid(),
  partner text not null check (char_length(partner) between 1 and 80),
  plate text not null check (char_length(plate) between 1 and 20),
  model text check (model is null or char_length(model) <= 80),
  prep text not null default 'parc' check (prep in ('parc', 'vendue', 'autre')),
  price numeric not null default 0 check (price >= 0),
  done_on date not null default (now() at time zone 'Europe/Paris')::date,
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  notes text check (notes is null or char_length(notes) <= 300),
  doc_id uuid references public.documents(id) on delete set null,
  author text check (author is null or char_length(author) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists garage_cars_partner_day_idx on public.garage_cars (partner, done_on desc);
create index if not exists garage_cars_plate_idx on public.garage_cars (plate);
create index if not exists garage_cars_doc_idx on public.garage_cars (doc_id) where doc_id is not null;
alter table public.garage_cars enable row level security;
drop policy if exists team_all_garage_cars on public.garage_cars;
create policy team_all_garage_cars on public.garage_cars for all to authenticated using (private.is_team_member()) with check (private.is_team_member());

-- ---------- Parrainage ----------
alter table public.leads add column if not exists referral_rewards_used integer not null default 0;
do $$ begin
  alter table public.leads add constraint leads_referral_rewards_used_check check (referral_rewards_used between 0 and 100);
exception when duplicate_object then null; end $$;

-- Règle d'Enzo : 10 clients amenés = un nettoyage Sortie de Concession offert, rien pour le filleul.
update public.settings
set business = coalesce(business, '{}'::jsonb)
  || jsonb_build_object('referral_goal', 10, 'referral_reward', 'Nettoyage Sortie de Concession offert')
  || jsonb_build_object('partner_rates', coalesce(business->'partner_rates', '{}'::jsonb))
where id = 1;

-- Page de suivi : un filleul ne compte qu'une fois sa première prestation faite.
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
      'loyalty_discount', v_biz->'loyalty_discount', 'referral_reward', v_biz->>'referral_reward',
      'referral_goal', coalesce(v_biz->'referral_goal', '10'::jsonb))
  );
  return v_out;
end $$;

-- ---------- Sauvegarde Google Sheets ----------
-- Le Google Sheets appelle backup_export(jeton) toutes les heures (script Apps Script).
create table if not exists private.backup_config (
  id integer primary key default 1 check (id = 1),
  token text not null default encode(extensions.gen_random_bytes(24), 'hex'),
  last_at timestamptz
);
insert into private.backup_config (id) values (1) on conflict (id) do nothing;

create or replace function public.backup_export(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_ok boolean; v_out jsonb;
begin
  select exists (select 1 from private.backup_config where id = 1 and token = p_token) into v_ok;
  if not coalesce(v_ok, false) or p_token is null or char_length(p_token) < 32 then
    raise exception 'jeton invalide' using errcode = '28000';
  end if;
  update private.backup_config set last_at = now() where id = 1;
  v_out := jsonb_build_object(
    'generated_at', now(),
    'Clients', coalesce((select jsonb_agg(x order by x.created_at) from (
      select l.created_at, l.first_name as nom, l.phone as telephone, l.email, l.address as adresse, l.city as ville,
             l.vehicle as vehicule, l.plate as plaque, l.service as prestation, l.quoted_price as prix, l.status as statut,
             l.appointment_at as rdv, l.source, l.partner as garage, l.referral_code as code_parrain, l.ref_code as parraine_par,
             l.referral_rewards_used as recompenses_utilisees, l.notes, l.id
      from public.leads l where coalesce(l.source, '') <> 'test') x), '[]'::jsonb),
    'Prestations', coalesce((select jsonb_agg(x order by x.done_at) from (
      select j.done_at as date, l.first_name as client, j.service as prestation, j.amount as montant, j.payment_method as paiement,
             j.discount as remise, j.plate as plaque, j.partner as garage, j.notes, j.id
      from public.jobs j left join public.leads l on l.id = j.lead_id) x), '[]'::jsonb),
    'Garages', coalesce((select jsonb_agg(x order by x.date, x.created_at) from (
      select g.done_on as date, g.partner as garage, g.plate as plaque, g.model as modele,
             case g.prep when 'parc' then 'Préparation parc' when 'vendue' then 'Préparation vendue' else 'Autre' end as preparation,
             g.price as tarif, d.number as facture, g.notes, g.created_at, g.id
      from public.garage_cars g left join public.documents d on d.id = g.doc_id) x), '[]'::jsonb),
    'Devis et factures', coalesce((select jsonb_agg(x order by x.date) from (
      select d.issued_at as date, d.kind as type, d.number as numero, d.client->>'name' as client, d.total, d.status as statut,
             d.paid_at as paye_le,
             (select string_agg(concat(li->>'label', ' x', coalesce(li->>'qty', '1'), ' = ', coalesce(li->>'unit_price', '0'), ' €'), ' | ')
                from jsonb_array_elements(coalesce(d.lines, '[]'::jsonb)) li) as lignes,
             d.notes, d.id
      from public.documents d) x), '[]'::jsonb),
    'Dépenses', coalesce((select jsonb_agg(to_jsonb(e) order by e.spent_on) from public.expenses e), '[]'::jsonb),
    'Tâches', coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at) from public.tasks t), '[]'::jsonb),
    'Formules', coalesce((select jsonb_agg(x order by x.created_at) from (
      select s.created_at, l.first_name as client, s.label as formule, s.price as prix, s.every_days as tous_les_jours,
             s.next_on as prochain, s.active as active, s.id
      from public.subscriptions s left join public.leads l on l.id = s.lead_id) x), '[]'::jsonb)
  );
  return v_out;
end $$;
revoke all on function public.backup_export(text) from public;
grant execute on function public.backup_export(text) to anon, authenticated;

-- Dernière sauvegarde, visible dans les réglages de l'appli.
create or replace function public.backup_status()
returns timestamptz language sql stable security definer set search_path = '' as $$
  select case when private.is_team_member() then (select last_at from private.backup_config where id = 1) end
$$;
revoke all on function public.backup_status() from public, anon;
grant execute on function public.backup_status() to authenticated;
