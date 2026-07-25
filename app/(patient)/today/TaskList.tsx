"use client";

import { useState, useTransition } from "react";
import { Card, Pill } from "@/components/ui";
import type { Task } from "@/lib/types";
import { toggleTask } from "../actions";

export function TaskList({ tasks }: { tasks: Task[] }) {
  // Seeded from server data; we own the optimistic flip locally and reconcile
  // on failure. revalidatePath keeps other views in sync.
  const [rows, setRows] = useState<Task[]>(tasks);
  const [, startTransition] = useTransition();
  const doneCount = rows.filter((t) => t.done_at).length;

  const flip = (task: Task) => {
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
        // Revert on failure.
        setRows((rs) =>
          rs.map((t) => (t.id === task.id ? { ...t, done_at: task.done_at } : t))
        );
      }
    });
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
          return (
            <Card
              key={task.id}
              className="px-3.5 py-3"
              style={{ opacity: done ? 0.65 : 1 }}
            >
              <button
                onClick={() => flip(task)}
                className="flex w-full items-center gap-3 text-left"
                aria-pressed={done}
              >
                <span
                  className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-lg text-[13px] text-white"
                  style={{
                    border: `2px solid ${done ? "#14664F" : "#DEE9E1"}`,
                    background: done ? "#14664F" : "#fff",
                  }}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="flex-1">
                  <span
                    className="block font-body text-[14px] font-semibold text-ink"
                    style={{ textDecoration: done ? "line-through" : "none" }}
                  >
                    {task.title}
                  </span>
                  {task.subtitle && (
                    <span className="block font-body text-[11.5px] text-ink-soft">
                      {task.subtitle}
                    </span>
                  )}
                </span>
                {task.kind === "yoga_live" && (
                  <Pill className="bg-coral-soft text-coral">Live 6pm</Pill>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
