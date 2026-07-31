export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";
import { ConsultForm } from "./ConsultForm";
import { MeetUrlForm } from "./MeetUrlForm";

type Booking = {
  id: string;
  slot_time: string;
  status: string;
  patient_name: string | null;
};

type Window = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  meet_url: string | null;
  bookings: Booking[];
};

export default async function ConsultsPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: raw } = user
    ? await supabase
        .from("consult_windows")
        .select(
          "id, date, start_time, end_time, slot_minutes, meet_url, consult_bookings(id, slot_time, status, profiles:patient_id(full_name))"
        )
        .eq("staff_id", user.id)
        .order("date", { ascending: false })
    : { data: [] };

  const windows: Window[] = (raw ?? []).map((w: unknown) => {
    const row = w as {
      id: string;
      date: string;
      start_time: string;
      end_time: string;
      slot_minutes: number;
      meet_url?: string | null;
      consult_bookings?: {
        id: string;
        slot_time: string;
        status: string;
        profiles?: { full_name?: string };
      }[];
    };
    return {
      id: row.id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      slot_minutes: row.slot_minutes,
      meet_url: row.meet_url ?? null,
      bookings: (row.consult_bookings ?? []).map((b) => ({
        id: b.id,
        slot_time: b.slot_time,
        status: b.status,
        patient_name: b.profiles?.full_name ?? null,
      })),
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Consult windows</h1>
      </div>

      <ConsultForm />

      <section>
        <h2 className="eyebrow mb-3">Your windows</h2>
        {!windows.length ? (
          <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
            No windows opened yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {windows.map((w) => (
              <div key={w.id} className="rounded-card border border-line bg-card p-3">
                <div className="flex items-center justify-between font-body text-[13px]">
                  <span className="font-bold text-ink">{w.date}</span>
                  <span className="text-ink-soft">
                    {w.start_time.slice(0, 5)}–{w.end_time.slice(0, 5)} · {w.slot_minutes}-min slots
                  </span>
                </div>
                {w.bookings.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">
                    {w.bookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between font-body text-[12.5px]">
                        <span className="text-ink">
                          <span className="font-semibold">{b.slot_time.slice(0, 5)}</span>
                          {" — "}{b.patient_name ?? "Patient"}
                        </span>
                        <span className="rounded-full bg-mint px-2 py-0.5 font-body text-[11px] font-semibold text-primary-deep">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <MeetUrlForm windowId={w.id} currentUrl={w.meet_url} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
