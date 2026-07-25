import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { ConsultForm } from "./ConsultForm";

export default async function ConsultsPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: windows } = user
    ? await supabase
        .from("consult_windows")
        .select("id, date, start_time, end_time, slot_minutes")
        .eq("staff_id", user.id)
        .order("date", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/staff" className="font-body text-[12.5px] text-ink-soft hover:underline">
          ← Back to queue
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Consult windows</h1>
      </div>

      <ConsultForm />

      <section>
        <h2 className="eyebrow mb-3">Your windows</h2>
        {!windows?.length ? (
          <div className="rounded-card border border-line bg-card p-4 font-body text-[13px] text-ink-soft">
            No windows opened yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {windows.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-card border border-line bg-card p-3 font-body text-[13px]">
                <span className="font-bold text-ink">{w.date}</span>
                <span className="text-ink-soft">
                  {w.start_time.slice(0, 5)}–{w.end_time.slice(0, 5)} · {w.slot_minutes}-min slots
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
