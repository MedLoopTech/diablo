/** Types and constants safe to import from client components. */

export type LabFlag = "low" | "normal" | "high";

export type LabResult = {
  id: string;
  document_id: string | null;
  analyte: string;
  label: string;
  value: number;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
  flag: LabFlag;
  taken_on: string;
};

export type LabPreset = {
  analyte: string;
  label: string;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
};

/**
 * Ten common panels for a diabetes-remission program — the doctor picks one
 * rather than typing analyte/unit/reference range by hand each time. "Other"
 * covers anything not on the list.
 */
export const LAB_PRESETS: LabPreset[] = [
  { analyte: "hba1c",        label: "HbA1c",              unit: "%",      ref_low: null, ref_high: 5.7 },
  { analyte: "fasting_glucose", label: "Fasting glucose",  unit: "mg/dL",  ref_low: 70,   ref_high: 99 },
  { analyte: "creatinine",   label: "Creatinine",          unit: "mg/dL",  ref_low: 0.6,  ref_high: 1.3 },
  { analyte: "egfr",         label: "eGFR",                unit: "mL/min/1.73m²", ref_low: 90, ref_high: null },
  { analyte: "ldl",          label: "LDL cholesterol",     unit: "mg/dL",  ref_low: null, ref_high: 100 },
  { analyte: "hdl",          label: "HDL cholesterol",     unit: "mg/dL",  ref_low: 40,   ref_high: null },
  { analyte: "triglycerides", label: "Triglycerides",      unit: "mg/dL",  ref_low: null, ref_high: 150 },
  { analyte: "tsh",          label: "TSH",                 unit: "mIU/L",  ref_low: 0.4,  ref_high: 4.0 },
  { analyte: "alt",          label: "ALT",                 unit: "U/L",    ref_low: 7,    ref_high: 56 },
  { analyte: "potassium",    label: "Potassium",           unit: "mmol/L", ref_low: 3.5,  ref_high: 5.1 },
];

export function presetFor(analyte: string): LabPreset | null {
  return LAB_PRESETS.find((p) => p.analyte === analyte) ?? null;
}
