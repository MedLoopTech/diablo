-- Referral rewards were cash-only, which only makes sense for staff/partner
-- referrers. A patient referring another patient wants a free consult, a
-- plan bump, or a partner voucher, not PKR — and admin needs to fulfill
-- whichever kind of reward a code actually offers, with a record of what
-- was given (a generated voucher code, which tier was granted, etc.).

create type public.reward_type as enum ('cash', 'consult', 'resource', 'plan_upgrade', 'voucher');

alter table public.referral_codes
  add column reward_type public.reward_type not null default 'cash',
  add column reward_value jsonb not null default '{}'::jsonb;

-- reward_value shape depends on reward_type:
--   cash:         { amount_pkr: 2000 }
--   consult:      { role: 'nutritionist' | 'coach' | 'doctor', sessions: 1 }
--   plan_upgrade: { tier: 'plus' | 'premium', duration_days: 30 }
--   voucher:      { partner: 'City Lab', discount_pct: 20 }
--   resource:     { note: 'Free copy of the meal-plan guide' }

create table public.reward_fulfillments (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references public.referrals (id) on delete cascade,
  reward_type  public.reward_type not null,
  fulfilled_by uuid not null references public.profiles (id),
  fulfilled_at timestamptz not null default now(),
  -- What was actually given — e.g. a generated voucher code, the plan tier
  -- applied, or the amount paid. Free-form per reward_type, same reasoning
  -- as reward_value above.
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index on public.reward_fulfillments (referral_id);

alter table public.reward_fulfillments enable row level security;

create policy reward_fulfillments_admin_all on public.reward_fulfillments
  for all using (public.is_admin()) with check (public.is_admin());

-- The referrer can see what they earned; the referred patient can see what
-- they triggered (relevant once patients can refer patients).
create policy reward_fulfillments_referrer_read on public.reward_fulfillments
  for select using (
    exists (
      select 1 from public.referrals r
      where r.id = reward_fulfillments.referral_id and r.referrer_id = auth.uid()
    )
  );

create policy reward_fulfillments_patient_read on public.reward_fulfillments
  for select using (
    exists (
      select 1 from public.referrals r
      where r.id = reward_fulfillments.referral_id and r.patient_id = auth.uid()
    )
  );
