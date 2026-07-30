// Single source of truth for primary-metric thresholds — diabetes program.
// These mirror the 'diabetes' row in the program_config table.
// The DB trigger reads from program_config at insert time; TypeScript code imports here.
// To change thresholds: update program_config AND these constants together.

export const THRESHOLDS = {
  URGENT_LOW:    70,   // ≤ → urgent escalation (spec §2)
  URGENT_HIGH:   250,  // ≥ → urgent escalation
  ROUTINE_HIGH:  180,  // ≥ → routine flag for daily doctor review
  DIAL_ELEVATED: 130,  // ≥ → amber zone on the glucose horizon dial
} as const;
