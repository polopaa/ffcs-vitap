// Predetermined slot combinations grouped by credit value.
//
// This module is a sibling data module to `slotData.ts`. It does NOT modify the
// grid layout — it only enumerates the predetermined combinations a course can
// be assigned to, parsed from the reference credit table.
//
// Each combination entry exposes:
//   - credit: 1 | 2 | 3 | 4 (0 sentinel for labs)
//   - combination: the raw combination string (e.g. "A1+TA1+TAA1")
//   - slots: the parsed list of DAY-QUALIFIED booked-slot keys
//     (e.g. ["TUE::A1", "WED::TA1", "THU::TAA1"])
//
// The `slots` array stores DAY-QUALIFIED keys because base slot codes (A1, B1,
// L2, ...) repeat across days in DAY_SLOTS — the plain base code alone is
// ambiguous about which day the slot was booked on. Day-qualification makes
// each booked slot unambiguous so detectClashes / checkCandidateClash can do
// authoritative same-day + same-time overlap detection.
//
// The `combination` string stays in the legacy plain-base-code form
// ("A1+TA1+TAA1") — it is the canonical combination identifier used by the
// dropdown and persisted on `course.combination`. Only the `slots` array is
// day-qualified.

import {
  DAYS,
  DAY_SLOTS,
  type Day,
  SLOT_TO_DAYS,
  dayQualifySlot,
  parseSlotLabel,
} from "./slotData";

export const CREDIT_VALUES = [1, 2, 3, 4] as const;

export interface SlotCombination {
  credit: number;
  combination: string;
  // Day-qualified booked-slot keys, e.g. ["TUE::A1", "WED::TA1", "THU::TAA1"].
  // Each entry unambiguously identifies the day the slot is booked on.
  slots: string[];
}

// Parse a raw combination string like "A1+TA1+TAA1" into ["A1","TA1","TAA1"].
// Trims whitespace and drops empty segments so malformed entries never produce
// phantom slot codes. Returns PLAIN base codes (no day qualification) — the
// day assignment happens in `qualifyCombinationSlots`.
function parseCombination(combination: string): string[] {
  return combination
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

// Assign each plain base slot in a combination to a DISTINCT day, returning the
// list of day-qualified booked-slot keys. A course meets once per day, so no
// two slots in the same combination share a day. The greedy assignment picks,
// for each slot, the first day from SLOT_TO_DAYS[slot] that is not already used
// by another slot in the same combination. This works because the real VIT-AP
// scheme guarantees each combination's slots fall on distinct days.
//
// Composite theory slots (e.g. "TC1/G1") are split into base + variant and
// qualified as `${DAY}::${baseSlot}::${variant}`. Plain slots (incl. lab codes)
// qualify as `${DAY}::${baseSlot}`.
//
// If a slot has no entry in SLOT_TO_DAYS (e.g. a code beyond the defined grid),
// it is skipped — it cannot be authoritatively day-resolved and would never fill
// a grid cell anyway.
function qualifyCombinationSlots(plainSlots: string[]): string[] {
  const usedDays = new Set<Day>();
  const qualified: string[] = [];

  for (const plainSlot of plainSlots) {
    const { baseSlot, variantSlot } = parseSlotLabel(plainSlot);
    if (!baseSlot) continue;

    const candidateDays = SLOT_TO_DAYS[baseSlot];
    if (!candidateDays || candidateDays.length === 0) continue;

    // Pick the first day for this slot that isn't already used by another slot
    // in the same combination. Each combination's slots are on distinct days in
    // the real scheme, so this always resolves.
    const day = candidateDays.find((d) => !usedDays.has(d));
    if (!day) continue;

    usedDays.add(day);
    qualified.push(dayQualifySlot(baseSlot, day, variantSlot));
  }

  return qualified;
}

// Build a SlotCombination from a raw combination string and credit value. The
// `slots` array is day-qualified via `qualifyCombinationSlots`.
function makeCombination(credit: number, combination: string): SlotCombination {
  return {
    credit,
    combination,
    slots: qualifyCombinationSlots(parseCombination(combination)),
  };
}

// 4-credit combinations.
const FOUR_CREDIT = [
  "A1+TA1+TAA1",
  "B1+TB1+TBB1",
  "C1+TC1+TCC1",
  "C1+SC1+TC1",
  "D1+TD1+TDD1",
  "D1+TD1+SD1",
  "A2+TA2+TAA2",
  "B2+TB2+TBB2",
  "C2+TC2+TCC2",
  "C2+SC2+TC2",
  "D2+TD2+TDD2",
  "D2+SD2+TD2",
  "E1+TE1+TEE1",
  "E1+SE1+TE1",
  "F1+TF1+TFF1",
  "F1+TF1+TBB2",
  "G1+TG1+TGG1",
  "E2+TE2+TEE2",
  "E2+SE2+TE2",
  "F2+TF2+TFF2",
  "F2+TF2+TBB1",
  "G2+TG2+TGG2",
];

// 3-credit combinations.
const THREE_CREDIT = [
  "A1+TA1",
  "B1+TB1",
  "C1+TC1",
  "C1+TCC1",
  "D1+TD1",
  "D1+TDD1",
  "A2+TA2",
  "B2+TB2",
  "C2+TC2",
  "C2+TCC2",
  "D2+TD2",
  "D2+TDD2",
  "E1+TE1",
  "E1+TEE1",
  "F1+TF1",
  "F1+TFF1",
  "G1+TG1",
  "G1+TGG1",
  "E2+TE2",
  "E2+TEE2",
  "F2+TF2",
  "F2+TFF2",
  "G2+TG2",
  "G2+TGG2",
];

// 2-credit combinations.
const TWO_CREDIT = [
  "A1",
  "B1",
  "C1",
  "D1",
  "E1",
  "F1",
  "A2",
  "B2",
  "C2",
  "D2",
  "E2",
  "F2",
  "G1",
  "G2",
];

// 1-credit combinations.
const ONE_CREDIT = [
  "TA1",
  "TB1",
  "TC1",
  "TD1",
  "TE1",
  "TF1",
  "TA2",
  "TB2",
  "TC2",
  "TD2",
  "TE2",
  "TF2",
  "TG1",
  "TEE1",
  "TCC1",
  "TDD1",
  "TAA1",
  "TBB1",
  "TG2",
  "TAA2",
  "TBB2",
  "TDD2",
  "TCC2",
  "TEE2",
];

// All predetermined theory combinations, flattened in credit-descending order
// so the most comprehensive options appear first when consumers iterate the
// array. Lab combinations are kept separate (see LAB_COMBINATIONS) because they
// are not credit-based and are presented in a different dropdown.
export const SLOT_COMBINATIONS: SlotCombination[] = [
  ...FOUR_CREDIT.map((c) => makeCombination(4, c)),
  ...THREE_CREDIT.map((c) => makeCombination(3, c)),
  ...TWO_CREDIT.map((c) => makeCombination(2, c)),
  ...ONE_CREDIT.map((c) => makeCombination(1, c)),
];

// Build a deterministic lab-number → day map from DAY_SLOTS. Each lab code
// (L1..L60) appears on exactly one day in DAY_SLOTS, so the mapping is
// unambiguous. Used to day-qualify lab pair combinations.
function buildLabDayMap(): Record<string, Day> {
  const mapping: Record<string, Day> = {};
  for (const day of DAYS) {
    for (const label of DAY_SLOTS[day].lab) {
      if (!label) continue;
      const { baseSlot } = parseSlotLabel(label);
      if (baseSlot) mapping[baseSlot] = day;
    }
  }
  return mapping;
}

const LAB_DAY_MAP: Record<string, Day> = buildLabDayMap();

// Consecutive lab pair combinations: L1+L2, L3+L4, L5+L6, ... up to L59+L60.
// 30 pairs total. Each pair uses two consecutive lab slot numbers.
//
// Labs are not credit-based, so `credit` is set to 0 as a sentinel. The grid in
// `slotData.ts` defines lab slots L1-L60, so the 30 pairs cover every lab slot
// exactly once. Pairs beyond L60 are intentionally excluded — they have no grid
// cell and no time mapping, so they could never be booked authoritatively.
//
// Each pair's `slots` array is day-qualified using LAB_DAY_MAP. Both labs in a
// pair share the same day (consecutive lab columns on the same day), so both
// keys carry the same day.
export const LAB_COMBINATIONS: SlotCombination[] = Array.from(
  { length: 30 },
  (_, index) => {
    const first = index * 2 + 1;
    const second = first + 1;
    const combination = `L${first}+L${second}`;
    const firstDay = LAB_DAY_MAP[`L${first}`];
    const secondDay = LAB_DAY_MAP[`L${second}`];
    // Both labs in a pair are on the same day in the real scheme. If either is
    // missing a day (defensive — should not happen for L1-L60), the slots array
    // is empty.
    const slots =
      firstDay && secondDay && firstDay === secondDay
        ? [
            dayQualifySlot(`L${first}`, firstDay, null),
            dayQualifySlot(`L${second}`, secondDay, null),
          ]
        : [];
    return { credit: 0, combination, slots };
  },
);

// Return all lab pair combinations (L1+L2 ... L59+L60).
export function getLabCombinations(): SlotCombination[] {
  return LAB_COMBINATIONS;
}

// Return true if a combination string refers to a lab pair (starts with "L"),
// e.g. "L1+L2", "L33+L34". Theory combinations never start with "L".
export function isLabCombination(combination: string): boolean {
  return combination.trim().startsWith("L");
}

// Return all theory combinations matching a credit value (1/2/3/4).
// Returns an empty array for unsupported credit values. Lab combinations are
// excluded — they are not credit-based.
export function getCombinationsByCredit(credit: number): SlotCombination[] {
  return SLOT_COMBINATIONS.filter(
    (combination) => combination.credit === credit,
  );
}

// Look up a single combination by its raw combination string (e.g. "A1+TA1" or
// "L1+L2"). Searches both theory and lab combination pools. Returns undefined
// when no combination matches.
export function getCombination(
  combination: string,
): SlotCombination | undefined {
  return (
    SLOT_COMBINATIONS.find((entry) => entry.combination === combination) ??
    LAB_COMBINATIONS.find((entry) => entry.combination === combination)
  );
}
