// Shared slot layout source of truth.
//
// This module is the SINGLE source of truth for the weekly timetable grid
// layout. Both `TimetableGrid` (display) and `SlotSelector` (selection) MUST
// import from here so the two views never drift out of sync.
//
// Layout model:
//   - DAYS: 5 days (TUE..SAT) — Monday is intentionally excluded
//   - THEORY_TIME_SLOTS: 10 columns — all data cells, no LUNCH column
//   - LAB_TIME_SLOTS: 12 columns — all data cells, no LUNCH column
//   - DAY_SLOTS: per-day { theory: string[10], lab: string[12] }
//
// LUNCH is positioned via THEORY_LUNCH_INDEX / LAB_LUNCH_INDEX so it separates
// morning and afternoon in each row type. The DAY_SLOTS arrays hold ONLY data
// cells — LUNCH is rendered from the time-slot arrays, not from DAY_SLOTS.
//
// Slot identity is GLOBAL: a slot code (e.g. "A1", "L42") means the same
// thing on every day. The day only determines where the cell is rendered.

export const DAYS = ["TUE", "WED", "THU", "FRI", "SAT"] as const;
export type Day = (typeof DAYS)[number];

// Theory column headers. 10 entries — all data cells, no LUNCH column.
// LUNCH is positioned via THEORY_LUNCH_INDEX (between morning and afternoon).
export const THEORY_TIME_SLOTS = [
  "8:00 - 8:50",
  "9:00 - 9:50",
  "10:00 - 10:50",
  "11:00 - 11:50",
  "12:00 - 12:50",
  "2:00 - 2:50",
  "3:00 - 3:50",
  "4:00 - 4:50",
  "5:00 - 5:50",
  "6:00 - 6:50",
] as const;

// Lab column headers. 12 entries — all data cells, no LUNCH column.
// LUNCH is positioned via LAB_LUNCH_INDEX (between morning and afternoon).
export const LAB_TIME_SLOTS = [
  "8:00 - 8:50",
  "8:50 - 9:40",
  "9:50 - 10:40",
  "10:40 - 11:30",
  "11:40 - 12:30",
  "12:30 - 1:10",
  "2:00 - 2:50",
  "2:50 - 3:40",
  "3:50 - 4:40",
  "4:40 - 5:30",
  "5:40 - 6:30",
  "6:30 - 7:10",
] as const;

// Index where the LUNCH break is rendered in each row type. Used by renderers
// to insert the LUNCH placeholder between morning and afternoon data cells.
// For theory, LUNCH sits between index 4 (12:00-12:50) and index 5 (2:00-2:50).
// For lab, LUNCH sits between index 5 (12:30-1:10) and index 6 (2:00-2:50).
export const THEORY_LUNCH_INDEX = 5;
export const LAB_LUNCH_INDEX = 6;

export interface DaySlots {
  theory: string[];
  lab: string[];
}

// Per-day slot codes. theory arrays have 10 entries, lab arrays have 12.
// Empty strings mark empty cells. LUNCH is NOT included here — it is a
// positioned break, not a data cell.
export const DAY_SLOTS: Record<Day, DaySlots> = {
  TUE: {
    theory: [
      "TFF1",
      "A1",
      "B1",
      "TC1/G1",
      "D1",
      "F2",
      "A2",
      "B2",
      "TC2/G2",
      "TDD2",
    ],
    lab: [
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "L31",
      "L32",
      "L33",
      "L34",
      "L35",
      "L36",
    ],
  },
  WED: {
    theory: [
      "TGG1",
      "D1",
      "F1",
      "E1/SC2",
      "B1",
      "D2",
      "TF2/G2",
      "E2/SC1",
      "B2",
      "TCC2",
    ],
    lab: [
      "L7",
      "L8",
      "L9",
      "L10",
      "L11",
      "L12",
      "L37",
      "L38",
      "L39",
      "L40",
      "L41",
      "L42",
    ],
  },
  THU: {
    theory: [
      "TEE1",
      "C1",
      "TD1/TG1",
      "TAA1/ECS",
      "TBB1/CLUB",
      "TE2/SE1",
      "C2",
      "TD2/TG2",
      "A2",
      "TFF2",
    ],
    lab: [
      "L13",
      "L14",
      "L15",
      "L16",
      "L17",
      "L18",
      "L43",
      "L44",
      "L45",
      "L46",
      "L47",
      "L48",
    ],
  },
  FRI: {
    theory: [
      "TCC1",
      "TB1",
      "TA1",
      "F1",
      "TE1/SD2",
      "C2",
      "TB2",
      "TA2",
      "F2",
      "TEE2",
    ],
    lab: [
      "L19",
      "L20",
      "L21",
      "L22",
      "L23",
      "L24",
      "L49",
      "L50",
      "L51",
      "L52",
      "L53",
      "L54",
    ],
  },
  SAT: {
    theory: [
      "TDD1",
      "E1/SE2",
      "C1",
      "TF1/G1",
      "A1",
      "D2",
      "E2/SD1",
      "TAA2/ECS",
      "TBB2/CLUB",
      "TGG2",
    ],
    lab: [
      "L25",
      "L26",
      "L27",
      "L28",
      "L29",
      "L30",
      "L55",
      "L56",
      "L57",
      "L58",
      "L59",
      "L60",
    ],
  },
};

// Parse a composite slot label into its base + variant parts.
//   - Composite labels like "TC1/G1" split on '/' into baseSlot="TC1" and
//     variantSlot="G1".
//   - Plain slots (e.g. "A1", "L31") return variantSlot=null.
//   - Empty strings and "LUNCH" return baseSlot=label, variantSlot=null.
export function parseSlotLabel(label: string): {
  baseSlot: string;
  variantSlot: string | null;
} {
  if (!label || label === "LUNCH") {
    return { baseSlot: label, variantSlot: null };
  }

  const parts = label.split("/").map((part) => part.trim());
  return {
    baseSlot: parts[0],
    variantSlot: parts.length > 1 ? parts[1] : null,
  };
}

// Build the global selection key for a slot.
//   - Plain slots (incl. lab codes L1..L60): selectionKey = baseSlot
//   - Composite slots: selectionKey = `${baseSlot}::${variantSlot}`
// Slot identity is GLOBAL — the day is never part of the key.
export function constructSelectionKey(
  baseSlot: string,
  variantSlot: string | null,
): string {
  if (variantSlot) {
    return `${baseSlot}::${variantSlot}`;
  }
  return baseSlot;
}

// Build a DAY-QUALIFIED booked-slot key. This is the format stored in
// `course.selectedSlots` so each booked slot unambiguously identifies the day
// it was booked on. Base slot codes (A1, B1, L2, ...) repeat across days in
// DAY_SLOTS, so the plain base code alone is ambiguous — the day-qualified key
// makes same-day + same-time clash detection authoritative.
//
// Format:
//   - Plain slot:        `${DAY}::${baseSlot}`            e.g. "TUE::A1"
//   - Composite slot:    `${DAY}::${baseSlot}::${variant}` e.g. "TUE::TC1::G1"
//
// The day-qualified key uses "::" as the separator, matching the existing
// composite selectionKey convention so `parseBookedSlotKey` can split it
// uniformly.
export function dayQualifySlot(
  baseSlot: string,
  day: string,
  variantSlot: string | null,
): string {
  if (variantSlot) {
    return `${day}::${baseSlot}::${variantSlot}`;
  }
  return `${day}::${baseSlot}`;
}

// Parse a day-qualified booked-slot key back into its parts.
//   - "TUE::A1"      → { day: "TUE", baseSlot: "A1",  variantSlot: null }
//   - "TUE::TC1::G1" → { day: "TUE", baseSlot: "TC1", variantSlot: "G1" }
//
// The first segment is always the day. The second is always the base slot. A
// third segment (if present) is the composite variant. Keys without "::" (e.g.
// legacy plain base codes, or "LUNCH") return day="" so callers can detect and
// skip them — they cannot be authoritatively day-resolved.
export function parseBookedSlotKey(key: string): {
  day: string;
  baseSlot: string;
  variantSlot: string | null;
} {
  if (!key || !key.includes("::")) {
    return { day: "", baseSlot: key, variantSlot: null };
  }
  const parts = key.split("::");
  const day = parts[0];
  const baseSlot = parts[1] ?? "";
  const variantSlot = parts.length > 2 ? parts[2] : null;
  return { day, baseSlot, variantSlot };
}

// Deterministic slot-code → day mapping.
//
// DAY_SLOTS is the SINGLE source of truth for which base slot codes appear on
// which day. This helper builds a plain `Record<baseSlot, Day>` by iterating
// every day's theory + lab arrays and keying each entry by its BASE slot code
// (the part before '/' in composite labels like "TC1/G1"). The variant co-
// occupies the same cell/time as its base, so the base code alone is sufficient
// for day/time lookup — and `course.selectedSlots` stores plain base codes, so
// the lookup shape matches exactly.
//
// This mapping is SYNCHRONOUS and always available — it never depends on render
// timing or the courses state. It replaces the previous DOM-scan approach in
// TimetableApp.tsx, which scanned `[data-base-slot][data-day]` cells in a
// useEffect keyed on [courses]; that effect could run before the grid rendered
// (initial mount with courses={}), leaving the mapping empty and silently
// skipping the same-day guard in detectClashes / checkCandidateClash.
//
// Empty-string cells (gaps in DAY_SLOTS) are skipped. LUNCH is never present in
// DAY_SLOTS, so it is naturally absent from the mapping.
export function buildSlotDayMapping(): Record<string, Day> {
  const mapping: Record<string, Day> = {};
  for (const day of DAYS) {
    const { theory, lab } = DAY_SLOTS[day];
    for (const label of theory) {
      if (!label) continue;
      const { baseSlot } = parseSlotLabel(label);
      if (baseSlot) mapping[baseSlot] = day;
    }
    for (const label of lab) {
      if (!label) continue;
      const { baseSlot } = parseSlotLabel(label);
      if (baseSlot) mapping[baseSlot] = day;
    }
  }
  return mapping;
}

// Precomputed slot-code → day map. Built once at module load from DAY_SLOTS so
// every consumer (TimetableApp, detectClashes, checkCandidateClash) shares the
// same deterministic mapping without any render-timing dependency.
//
// NOTE: This map is LOSSY — base slot codes repeat across days in DAY_SLOTS
// (e.g. "A1" appears on both TUE and SAT), so the mapping is last-write-wins.
// It is retained for backwards compatibility but the clash-detection logic no
// longer depends on it. New clash logic uses day-qualified booked-slot keys
// (see dayQualifySlot / parseBookedSlotKey) and SLOT_TO_DAYS for combination
// day assignment.
export const SLOT_DAY_MAP: Record<string, Day> = buildSlotDayMapping();

// Multi-valued slot-code → days map. For each base slot code, returns the ARRAY
// of days it appears on in DAY_SLOTS. Used by slotCombinations.ts to assign
// each slot in a combination to a distinct day (a course meets once per day, so
// no two slots in the same combination share a day).
//
// Example: SLOT_TO_DAYS["A1"] = ["TUE", "SAT"], SLOT_TO_DAYS["L2"] = ["TUE"].
export function buildSlotToDaysMap(): Record<string, Day[]> {
  const mapping: Record<string, Day[]> = {};
  for (const day of DAYS) {
    const { theory, lab } = DAY_SLOTS[day];
    for (const label of theory) {
      if (!label) continue;
      const { baseSlot } = parseSlotLabel(label);
      if (!baseSlot) continue;
      if (!mapping[baseSlot]) mapping[baseSlot] = [];
      mapping[baseSlot].push(day);
    }
    for (const label of lab) {
      if (!label) continue;
      const { baseSlot } = parseSlotLabel(label);
      if (!baseSlot) continue;
      if (!mapping[baseSlot]) mapping[baseSlot] = [];
      mapping[baseSlot].push(day);
    }
  }
  return mapping;
}

// Precomputed multi-valued slot-code → days map. Built once at module load.
export const SLOT_TO_DAYS: Record<string, Day[]> = buildSlotToDaysMap();
