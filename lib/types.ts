// Domain types mirroring the SPEC §1 enums and the tables the app reads.

export type GlucoseContext =
  | "fasting"
  | "pre_meal"
  | "post_meal"
  | "bedtime"
  | "random";
export type GlucoseFlag = "none" | "routine" | "urgent";
export type TaskKind = "glucose" | "meal" | "walk" | "yoga_live" | "custom";

export type GlucoseReading = {
  id: string;
  value_mgdl: number;
  context: GlucoseContext;
  taken_at: string;
  flag: GlucoseFlag;
};

export type PhotoMode = "off" | "optional" | "required";

export type Task = {
  id: string;
  for_date: string;
  cohort_day: number;
  title: string;
  subtitle: string | null;
  kind: TaskKind;
  done_at: string | null;
  photo_mode: PhotoMode;
  photo_prompt: string | null;
  photo_points_bonus: number;
  evidence_url: string | null;
  evidence_at: string | null;
};
