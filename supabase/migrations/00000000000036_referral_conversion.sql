-- Referral payout was gated on nothing but "signed up with a valid code" —
-- a patient could enter a code, save a name, and vanish, and the referrer
-- still showed a pending PKR payout. Add a real conversion event (enrolled
-- into a cohort — the point they become an actual pod patient) between
-- "referred" and "paid", so unconverted referrals are visible as a
-- follow-up list rather than payable.

alter table public.referrals add column converted_at timestamptz;

alter table public.referrals drop constraint if exists referrals_payout_status_check;
alter table public.referrals rename column payout_status to status;
-- The old default ('pending') survives the rename and isn't a valid value
-- under the new constraint below — every future signup would violate it
-- until this is replaced.
alter table public.referrals alter column status set default 'referred';
alter table public.referrals add constraint referrals_status_check
  check (status in ('referred', 'converted', 'paid'));

-- Backfill: anyone already enrolled in a cohort counts as converted;
-- anyone already marked paid stays paid (paid implies converted).
update public.referrals r
set converted_at = cm.joined_at,
    status = case when r.status = 'paid' then 'paid' else 'converted' end
from public.cohort_members cm
where cm.patient_id = r.patient_id and r.status <> 'paid';

-- Auto-convert the moment a referred patient is enrolled in a cohort —
-- covers the admin "enroll patient" action, the seed script, and anything
-- else that inserts into cohort_members, without each call site having to
-- remember to flip the referral itself.
create or replace function public.convert_referral_on_enrollment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.referrals
  set status = 'converted', converted_at = coalesce(converted_at, now())
  where patient_id = new.patient_id and status = 'referred';
  return new;
end;
$$;

create trigger referral_conversion_trigger
  after insert on public.cohort_members
  for each row execute function public.convert_referral_on_enrollment();
