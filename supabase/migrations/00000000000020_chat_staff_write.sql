-- Allow pod staff (doctor / nutritionist / coach / admin) to insert messages
-- into any patient's chat thread they can see via their care pod assignment.
-- The sender column must match a staff role — patients cannot use this policy
-- (they can only write via chat_patient_rw where patient_id = auth.uid()).

create policy chat_staff_write on public.chat_messages
  for insert
  with check (
    public.staff_sees_patient(patient_id)
    and sender in ('doctor', 'nutritionist', 'coach', 'admin', 'ai')
  );
