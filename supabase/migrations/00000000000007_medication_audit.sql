-- Phase 3: guarantee the medication audit trail in the database.
-- CLAUDE.md rule 1: medication plans are edited only by doctors, WITH a full
-- audit trail (who, what, when, prior value). Enforcing it with a trigger means
-- the audit row cannot be skipped by any code path.

create or replace function public.medication_plan_audit_fn()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.medication_plan_audit (plan_id, changed_by, before, after)
  values (
    NEW.id,
    coalesce(auth.uid(), NEW.created_by),
    case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end,
    to_jsonb(NEW)
  );
  return NEW;
end;
$$;

create trigger trg_medication_plan_audit
  after insert or update on public.medication_plans
  for each row execute function public.medication_plan_audit_fn();
