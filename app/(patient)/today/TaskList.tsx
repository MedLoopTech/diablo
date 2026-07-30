"use client";

import { useState, useTransition, useRef } from "react";
import { Card, Pill } from "@/components/ui";
import type { Task } from "@/lib/types";
import { toggleTask } from "../actions";

const KIND_ICON: Record<string, string> = {
  glucose: "🩸",
  meal: "🍽️",
  walk: "🚶",
  yoga_live: "🧘",
  custom: "📋",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [rows, setRows] = useState<Task[]>(tasks);
  const [, startTransition] = useTransition();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  const doneCount = rows.filter((t) => t.done_at).length;

  const flip = (task: Task) => {
    // Required-photo tasks must use the camera button, not the checkbox.
    if (task.photo_mode === "required") return;
    const done = !task.done_at;
    setRows((rs) =>
      rs.map((t) =>
        t.id === task.id
          ? { ...t, done_at: done ? new Date().toISOString() : null }
          : t
      )
    );
    startTransition(async () => {
      const res = await toggleTask(task.id, done);
      if (!res.ok) {
        setRows((rs) =>
          rs.map((t) => (t.id === task.id ? { ...t, done_at: task.done_at } : t))
        );
      }
    });
  };

  const submitEvidence = async (task: Task, file: File) => {
    setUploading((u) => ({ ...u, [task.id]: true }));
    setUploadError((e) => ({ ...e, [task.id]: "" }));
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`/api/tasks/${task.id}/evidence`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError((e) => ({ ...e, [task.id]: data.error ?? "Upload failed." }));
        return;
      }
      // Mark done + store signed URL (or a placeholder) so the thumbnail shows.
      setRows((rs) =>
        rs.map((t) =>
          t.id === task.id
            ? {
                ...t,
                done_at: t.done_at ?? new Date().toISOString(),
                evidence_url: data.signedUrl ?? "submitted",
              }
            : t
        )
      );
    } catch {
      setUploadError((e) => ({ ...e, [task.id]: "Network error — try again." }));
    } finally {
      setUploading((u) => ({ ...u, [task.id]: false }));
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="eyebrow">Today&apos;s plan</div>
        <span className="font-body text-[12px] text-ink-soft">
          {doneCount}/{rows.length} done
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((task) => {
          const done = Boolean(task.done_at);
          const hasEvidence = Boolean(task.evidence_url);
          const isUploading = uploading[task.id];
          const errMsg = uploadError[task.id];
          const needsPhoto = task.photo_mode === "required";
          const bonusPhoto = task.photo_mode === "optional";

          return (
            <Card
              key={task.id}
              className="px-3.5 py-3"
              style={{ opacity: done && !needsPhoto ? 0.65 : 1 }}
            >
              {/* Hidden camera input — opens native camera on mobile */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                ref={(el) => { fileRefs.current[task.id] = el; }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) submitEvidence(task, file);
                  e.target.value = "";
                }}
              />

              <div className="flex w-full items-center gap-3">
                {/* Left: checkbox (off/optional) or camera-done indicator (required) */}
                {needsPhoto ? (
                  <span
                    className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-lg text-[13px] text-white"
                    style={{
                      border: `2px solid ${done ? "#14664F" : "#DEE9E1"}`,
                      background: done ? "#14664F" : "#fff",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                ) : (
                  <button
                    onClick={() => flip(task)}
                    aria-pressed={done}
                    className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-lg text-[13px] text-white"
                    style={{
                      border: `2px solid ${done ? "#14664F" : "#DEE9E1"}`,
                      background: done ? "#14664F" : "#fff",
                    }}
                  >
                    {done ? "✓" : ""}
                  </button>
                )}

                {/* Middle: title, subtitle, photo prompt */}
                <span className="min-w-0 flex-1">
                  <span
                    className="block font-body text-[14px] font-semibold text-ink"
                    style={{ textDecoration: done && !needsPhoto ? "line-through" : "none" }}
                  >
                    {KIND_ICON[task.kind] ?? ""} {task.title}
                  </span>
                  {task.subtitle && (
                    <span className="block font-body text-[11.5px] text-ink-soft">
                      {task.subtitle}
                    </span>
                  )}
                  {task.photo_prompt && !done && (
                    <span className="mt-0.5 block font-body text-[11px] italic text-ink-soft">
                      {task.photo_prompt}
                    </span>
                  )}
                  {errMsg && (
                    <span className="mt-0.5 block font-body text-[11px] text-red-500">
                      {errMsg}
                    </span>
                  )}
                </span>

                {/* Right: evidence badge, camera button, or yoga pill */}
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {/* Evidence submitted indicator */}
                  {hasEvidence && (
                    <span
                      title="Photo submitted"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-[15px]"
                    >
                      📷
                    </span>
                  )}

                  {/* Uploading spinner */}
                  {isUploading && (
                    <span className="font-body text-[11px] text-ink-soft">
                      Uploading…
                    </span>
                  )}

                  {/* Camera button — required tasks (primary) */}
                  {!isUploading && !hasEvidence && needsPhoto && (
                    <button
                      onClick={() => fileRefs.current[task.id]?.click()}
                      className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-body text-[12px] font-bold text-white"
                    >
                      📷 Add photo
                    </button>
                  )}

                  {/* Camera button — optional tasks (secondary) */}
                  {!isUploading && !hasEvidence && bonusPhoto && (
                    <button
                      onClick={() => fileRefs.current[task.id]?.click()}
                      className="flex items-center gap-1 rounded-full border border-marigold bg-marigold-soft px-2.5 py-1 font-body text-[12px] font-semibold text-[#9A6A14]"
                    >
                      📷
                      {task.photo_points_bonus > 0 && (
                        <span>+{task.photo_points_bonus}pts</span>
                      )}
                    </button>
                  )}

                  {/* Yoga live pill (only when no evidence yet) */}
                  {task.kind === "yoga_live" && !hasEvidence && !bonusPhoto && (
                    <Pill className="bg-coral-soft text-coral">Live 6pm</Pill>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
