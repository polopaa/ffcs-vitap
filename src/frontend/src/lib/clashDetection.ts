// Time slot reference mapping - maps slot IDs to their actual time ranges.
// Format: [startHour, startMinute, endHour, endMinute]
type TimeRange = [number, number, number, number];

// Theory time columns (10 data cells; LUNCH is a separate column, not a cell):
//   col0=8:00-8:50, col1=9:00-9:50, col2=10:00-10:50, col3=11:00-11:50,
//   col4=12:00-12:50, col5=14:00-14:50, col6=15:00-15:50, col7=16:00-16:50,
//   col8=17:00-17:50, col9=18:00-18:50
// Lab time columns (12 data cells; LUNCH is a separate column, not a cell):
//   col0=8:00-8:50, col1=8:50-9:40, col2=9:50-10:40, col3=10:40-11:30,
//   col4=11:40-12:30, col5=12:30-13:10, col6=14:00-14:50, col7=14:50-15:40,
//   col8=15:50-16:40, col9=16:40-17:30, col10=17:40-18:30, col11=18:30-19:10
//
// The same base slot code (A1, B1, E1, ...) can appear on different days at
// different columns with different time ranges, so the mapping is DAY-QUALIFIED:
// keys are `${DAY}::${slotId}`. Composite variant slots (TC1/G1, E1/SC2, ...)
// share the SAME time range as their base slot on that day (they co-occur in
// the same cell), so each variant is mapped to the same range as its base.
//
// The week is 5 days: TUE, WED, THU, FRI, SAT. MON is intentionally absent.
const SLOT_TIME_MAPPING: Record<string, TimeRange> = {
  // ===== TUE =====
  // Theory: ['TFF1','A1','B1','TC1/G1','D1','F2','A2','B2','TC2/G2','TDD2']
  "TUE::TFF1": [8, 0, 8, 50],
  "TUE::A1": [9, 0, 9, 50],
  "TUE::B1": [10, 0, 10, 50],
  "TUE::TC1": [11, 0, 11, 50],
  "TUE::G1": [11, 0, 11, 50],
  "TUE::D1": [12, 0, 12, 50],
  "TUE::F2": [14, 0, 14, 50],
  "TUE::A2": [15, 0, 15, 50],
  "TUE::B2": [16, 0, 16, 50],
  "TUE::TC2": [17, 0, 17, 50],
  "TUE::G2": [17, 0, 17, 50],
  "TUE::TDD2": [18, 0, 18, 50],
  // Lab: L1-L6 → cols 0-5, L31-L36 → cols 6-11
  "TUE::L1": [8, 0, 8, 50],
  "TUE::L2": [8, 50, 9, 40],
  "TUE::L3": [9, 50, 10, 40],
  "TUE::L4": [10, 40, 11, 30],
  "TUE::L5": [11, 40, 12, 30],
  "TUE::L6": [12, 30, 13, 10],
  "TUE::L31": [14, 0, 14, 50],
  "TUE::L32": [14, 50, 15, 40],
  "TUE::L33": [15, 50, 16, 40],
  "TUE::L34": [16, 40, 17, 30],
  "TUE::L35": [17, 40, 18, 30],
  "TUE::L36": [18, 30, 19, 10],

  // ===== WED =====
  // Theory: ['TGG1','D1','F1','E1/SC2','B1','D2','TF2/G2','E2/SC1','B2','TCC2']
  "WED::TGG1": [8, 0, 8, 50],
  "WED::D1": [9, 0, 9, 50],
  "WED::F1": [10, 0, 10, 50],
  "WED::E1": [11, 0, 11, 50],
  "WED::SC2": [11, 0, 11, 50],
  "WED::B1": [12, 0, 12, 50],
  "WED::D2": [14, 0, 14, 50],
  "WED::TF2": [15, 0, 15, 50],
  "WED::G2": [15, 0, 15, 50],
  "WED::E2": [16, 0, 16, 50],
  "WED::SC1": [16, 0, 16, 50],
  "WED::B2": [17, 0, 17, 50],
  "WED::TCC2": [18, 0, 18, 50],
  // Lab: L7-L12 → cols 0-5, L37-L42 → cols 6-11
  "WED::L7": [8, 0, 8, 50],
  "WED::L8": [8, 50, 9, 40],
  "WED::L9": [9, 50, 10, 40],
  "WED::L10": [10, 40, 11, 30],
  "WED::L11": [11, 40, 12, 30],
  "WED::L12": [12, 30, 13, 10],
  "WED::L37": [14, 0, 14, 50],
  "WED::L38": [14, 50, 15, 40],
  "WED::L39": [15, 50, 16, 40],
  "WED::L40": [16, 40, 17, 30],
  "WED::L41": [17, 40, 18, 30],
  "WED::L42": [18, 30, 19, 10],

  // ===== THU =====
  // Theory: ['TEE1','C1','TD1/TG1','TAA1/ECS','TBB1/CLUB','TE2/SE1','C2','TD2/TG2','A2','TFF2']
  "THU::TEE1": [8, 0, 8, 50],
  "THU::C1": [9, 0, 9, 50],
  "THU::TD1": [10, 0, 10, 50],
  "THU::TG1": [10, 0, 10, 50],
  "THU::TAA1": [11, 0, 11, 50],
  "THU::ECS": [11, 0, 11, 50],
  "THU::TBB1": [12, 0, 12, 50],
  "THU::CLUB": [12, 0, 12, 50],
  "THU::TE2": [14, 0, 14, 50],
  "THU::SE1": [14, 0, 14, 50],
  "THU::C2": [15, 0, 15, 50],
  "THU::TD2": [16, 0, 16, 50],
  "THU::TG2": [16, 0, 16, 50],
  "THU::A2": [17, 0, 17, 50],
  "THU::TFF2": [18, 0, 18, 50],
  // Lab: L13-L18 → cols 0-5, L43-L48 → cols 6-11
  "THU::L13": [8, 0, 8, 50],
  "THU::L14": [8, 50, 9, 40],
  "THU::L15": [9, 50, 10, 40],
  "THU::L16": [10, 40, 11, 30],
  "THU::L17": [11, 40, 12, 30],
  "THU::L18": [12, 30, 13, 10],
  "THU::L43": [14, 0, 14, 50],
  "THU::L44": [14, 50, 15, 40],
  "THU::L45": [15, 50, 16, 40],
  "THU::L46": [16, 40, 17, 30],
  "THU::L47": [17, 40, 18, 30],
  "THU::L48": [18, 30, 19, 10],

  // ===== FRI =====
  // Theory: ['TCC1','TB1','TA1','F1','TE1/SD2','C2','TB2','TA2','F2','TEE2']
  "FRI::TCC1": [8, 0, 8, 50],
  "FRI::TB1": [9, 0, 9, 50],
  "FRI::TA1": [10, 0, 10, 50],
  "FRI::F1": [11, 0, 11, 50],
  "FRI::TE1": [12, 0, 12, 50],
  "FRI::SD2": [12, 0, 12, 50],
  "FRI::C2": [14, 0, 14, 50],
  "FRI::TB2": [15, 0, 15, 50],
  "FRI::TA2": [16, 0, 16, 50],
  "FRI::F2": [17, 0, 17, 50],
  "FRI::TEE2": [18, 0, 18, 50],
  // Lab: L19-L24 → cols 0-5, L49-L54 → cols 6-11
  "FRI::L19": [8, 0, 8, 50],
  "FRI::L20": [8, 50, 9, 40],
  "FRI::L21": [9, 50, 10, 40],
  "FRI::L22": [10, 40, 11, 30],
  "FRI::L23": [11, 40, 12, 30],
  "FRI::L24": [12, 30, 13, 10],
  "FRI::L49": [14, 0, 14, 50],
  "FRI::L50": [14, 50, 15, 40],
  "FRI::L51": [15, 50, 16, 40],
  "FRI::L52": [16, 40, 17, 30],
  "FRI::L53": [17, 40, 18, 30],
  "FRI::L54": [18, 30, 19, 10],

  // ===== SAT =====
  // Theory: ['TDD1','E1/SE2','C1','TF1/G1','A1','D2','E2/SD1','TAA2/ECS','TBB2/CLUB','TGG2']
  "SAT::TDD1": [8, 0, 8, 50],
  "SAT::E1": [9, 0, 9, 50],
  "SAT::SE2": [9, 0, 9, 50],
  "SAT::C1": [10, 0, 10, 50],
  "SAT::TF1": [11, 0, 11, 50],
  "SAT::G1": [11, 0, 11, 50],
  "SAT::A1": [12, 0, 12, 50],
  "SAT::D2": [14, 0, 14, 50],
  "SAT::E2": [15, 0, 15, 50],
  "SAT::SD1": [15, 0, 15, 50],
  "SAT::TAA2": [16, 0, 16, 50],
  "SAT::ECS": [16, 0, 16, 50],
  "SAT::TBB2": [17, 0, 17, 50],
  "SAT::CLUB": [17, 0, 17, 50],
  "SAT::TGG2": [18, 0, 18, 50],
  // Lab: L25-L30 → cols 0-5, L55-L60 → cols 6-11
  "SAT::L25": [8, 0, 8, 50],
  "SAT::L26": [8, 50, 9, 40],
  "SAT::L27": [9, 50, 10, 40],
  "SAT::L28": [10, 40, 11, 30],
  "SAT::L29": [11, 40, 12, 30],
  "SAT::L30": [12, 30, 13, 10],
  "SAT::L55": [14, 0, 14, 50],
  "SAT::L56": [14, 50, 15, 40],
  "SAT::L57": [15, 50, 16, 40],
  "SAT::L58": [16, 40, 17, 30],
  "SAT::L59": [17, 40, 18, 30],
  "SAT::L60": [18, 30, 19, 10],
};

// Helper function to check if two time ranges overlap
function timeRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  const [start1Hour, start1Min, end1Hour, end1Min] = range1;
  const [start2Hour, start2Min, end2Hour, end2Min] = range2;

  const start1 = start1Hour * 60 + start1Min;
  const end1 = end1Hour * 60 + end1Min;
  const start2 = start2Hour * 60 + start2Min;
  const end2 = end2Hour * 60 + end2Min;

  // Check if there's any overlap between the two time ranges
  return start1 < end2 && start2 < end1;
}

// Build the day-qualified lookup key for a slot on a given day.
function daySlotKey(day: string, slotId: string): string {
  return `${day}::${slotId}`;
}

// Check if a slot is a lab slot
function isLabSlot(slotId: string): boolean {
  return slotId.startsWith("L");
}

// Check if a slot is a theory slot
function isTheorySlot(slotId: string): boolean {
  return !isLabSlot(slotId) && slotId !== "LUNCH" && slotId !== "";
}

export interface SlotWithDay {
  selectionKey: string;
  day: string;
}

export interface ClashInfo {
  slotKey1: string;
  slotKey2: string;
  slot1: string;
  slot2: string;
  courseId1: string;
  courseId2: string;
  day: string;
}

export interface ClashDetectionResult {
  hasClashes: boolean;
  clashes: ClashInfo[];
  clashingSlots: Set<string>;
}

// Main precise same-day, same-time clash detection function.
//
// `courses` is a record of courses whose `selectedSlots` arrays contain
// DAY-QUALIFIED booked-slot keys (e.g. "TUE::A1" or "TUE::TC1::G1"). The day is
// parsed directly from each key — there is no external slotDayMapping
// dependency, so the same-day guard is authoritative even though base slot
// codes (A1, B1, L2, ...) repeat across days in DAY_SLOTS.
//
// Flags overlaps on the SAME day and SAME time window for:
//   - theory↔lab
//   - lab↔lab (two labs whose time ranges actually overlap)
//   - theory↔theory (two theory courses whose time ranges overlap)
// Adjacent-but-distinct slots (end1 === start2) do NOT overlap — the strict
// `start1 < end2 && start2 < end1` predicate in timeRangesOverlap guarantees
// that back-to-back lab columns on the same day are not treated as clashing.
//
// `clashingSlots` stores the DAY-QUALIFIED BASE key of each clashing slot
// (e.g. "TUE::A1", not "TUE::TC1::G1" — the variant co-occupies the base
// cell/time, so the base key is sufficient for the grid's membership check).
export function detectClashes(
  courses: Record<
    string,
    { id: string; name: string; selectedSlots: string[] }
  >,
): ClashDetectionResult {
  const clashes: ClashInfo[] = [];
  const clashingSlots = new Set<string>();

  // Get all courses as array
  const courseList = Object.values(courses);

  // Check each course against every other course
  for (let i = 0; i < courseList.length; i++) {
    const course1 = courseList[i];

    for (let j = i + 1; j < courseList.length; j++) {
      const course2 = courseList[j];

      // Check all slot combinations between the two courses
      for (const slotKey1 of course1.selectedSlots) {
        const [day1, slot1] = parseDayAndBase(slotKey1);
        if (!day1) continue;

        for (const slotKey2 of course2.selectedSlots) {
          const [day2, slot2] = parseDayAndBase(slotKey2);
          if (!day2) continue;

          // CRITICAL: Only check if both slots are on the same day. The day
          // comes from the day-qualified key, so this is authoritative even
          // though base slot codes repeat across days.
          if (day1 !== day2) continue;

          const isClashPair =
            // theory↔lab
            (isTheorySlot(slot1) && isLabSlot(slot2)) ||
            (isLabSlot(slot1) && isTheorySlot(slot2)) ||
            // lab↔lab — two labs whose time ranges actually overlap.
            // Adjacent lab columns (end1 === start2) do NOT overlap thanks
            // to the strict inequality in timeRangesOverlap, so two lab
            // courses on the same day are flagged ONLY when their time
            // windows truly intersect, not merely because they share a day.
            (isLabSlot(slot1) && isLabSlot(slot2)) ||
            // theory↔theory — two theory courses whose time ranges overlap.
            (isTheorySlot(slot1) && isTheorySlot(slot2));

          if (!isClashPair) continue;

          // Time mapping is day-qualified because the same base slot code
          // can occupy different columns (and thus different time ranges)
          // on different days.
          const time1 = SLOT_TIME_MAPPING[daySlotKey(day1, slot1)];
          const time2 = SLOT_TIME_MAPPING[daySlotKey(day1, slot2)];

          // CRITICAL: If both slots have time mappings AND they overlap at
          // the same time, flag a clash. Lab combinations referencing slots
          // beyond L60 (L61-L100) have no time mapping and are skipped.
          if (time1 && time2 && timeRangesOverlap(time1, time2)) {
            clashes.push({
              slotKey1,
              slotKey2,
              slot1,
              slot2,
              courseId1: course1.id,
              courseId2: course2.id,
              day: day1,
            });
            // Store the day-qualified BASE key so TimetableGrid can match
            // against the cell's day-qualified base key. The variant co-
            // occupies the same cell/time as the base, so the base key alone
            // is sufficient for the grid's membership check.
            clashingSlots.add(dayQualifyBase(day1, slotKey1));
            clashingSlots.add(dayQualifyBase(day2, slotKey2));
          }
        }
      }
    }
  }

  return {
    hasClashes: clashes.length > 0,
    clashes,
    clashingSlots,
  };
}

// Get clash summary for display over the 5-day week (TUE..SAT).
export function getClashSummary(clashes: ClashInfo[]): string {
  if (clashes.length === 0) return "";

  return `${clashes.length} time clash${clashes.length !== 1 ? "es" : ""} detected (same day & time)`;
}

// Pre-save clash check for a candidate combination.
//
// Runs the SAME authoritative same-day + same-time overlap logic as
// detectClashes (theory↔lab, lab↔lab, and theory↔theory), but only checks the
// candidate's slots against the slots of OTHER courses (a course never clashes
// with itself). `excludeCourseId` is the id of the course being edited — its
// own already-booked slots are ignored so re-picking a combination for an
// existing course does not self-clash.
//
// `candidateSlots` and each existing course's `selectedSlots` contain
// DAY-QUALIFIED booked-slot keys (e.g. "TUE::A1" or "TUE::TC1::G1"). The day is
// parsed directly from each key — no external slotDayMapping dependency.
//
// Returns the first clash found (with the existing course name + slot) so the
// modal can show a precise inline warning naming the clashing course and slot.
// Returns null when the candidate is clash-free.
export interface CandidateClash {
  // The existing course that the candidate clashes with.
  existingCourseId: string;
  existingCourseName: string;
  // The existing course's slot (base code) that overlaps.
  existingSlot: string;
  // The candidate's slot (base code) that overlaps.
  candidateSlot: string;
  // The day the overlap occurs on.
  day: string;
}

export function checkCandidateClash(
  candidateSlots: string[],
  existingCourses: { id: string; name: string; selectedSlots: string[] }[],
  excludeCourseId?: string,
): CandidateClash | null {
  for (const candidateSlotKey of candidateSlots) {
    const [candidateDay, candidateSlot] = parseDayAndBase(candidateSlotKey);
    // If the candidate slot has no day (e.g. a legacy plain base code or a
    // lab pair beyond L60 with no day mapping), we cannot authoritatively
    // check day+time — skip rather than false-positive.
    if (!candidateDay) continue;

    const candidateTime =
      SLOT_TIME_MAPPING[daySlotKey(candidateDay, candidateSlot)];
    if (!candidateTime) continue;

    for (const existing of existingCourses) {
      // A course never clashes with itself — skip the course being edited.
      if (excludeCourseId && existing.id === excludeCourseId) continue;

      for (const existingSlotKey of existing.selectedSlots) {
        const [existingDay, existingSlot] = parseDayAndBase(existingSlotKey);
        if (!existingDay || existingDay !== candidateDay) continue;

        // Same clash-pair predicate as detectClashes:
        // theory↔lab, lab↔lab, and theory↔theory. Adjacent lab columns
        // (end1 === start2) do NOT overlap thanks to the strict inequality in
        // timeRangesOverlap, so two lab courses on the same day are flagged
        // ONLY when their time windows truly intersect.
        const isClashPair =
          (isTheorySlot(candidateSlot) && isLabSlot(existingSlot)) ||
          (isLabSlot(candidateSlot) && isTheorySlot(existingSlot)) ||
          (isLabSlot(candidateSlot) && isLabSlot(existingSlot)) ||
          (isTheorySlot(candidateSlot) && isTheorySlot(existingSlot));
        if (!isClashPair) continue;

        const existingTime =
          SLOT_TIME_MAPPING[daySlotKey(existingDay, existingSlot)];
        if (!existingTime) continue;

        if (timeRangesOverlap(candidateTime, existingTime)) {
          return {
            existingCourseId: existing.id,
            existingCourseName: existing.name,
            existingSlot,
            candidateSlot,
            day: candidateDay,
          };
        }
      }
    }
  }

  return null;
}

// Parse a day-qualified booked-slot key into [day, baseSlot].
//
//   - "TUE::A1"      → ["TUE", "A1"]
//   - "TUE::TC1::G1" → ["TUE", "TC1"]   (variant dropped — base alone drives
//                                        time lookup and clash-pair predicates)
//   - "A1" (legacy)  → ["", "A1"]       (no day → caller skips authoritatively)
//
// The variant segment is intentionally dropped here because the variant co-
// occupies the same cell/time as its base, so the base code alone is sufficient
// for both the SLOT_TIME_MAPPING lookup and the isTheorySlot/isLabSlot
// predicates.
function parseDayAndBase(key: string): [string, string] {
  if (!key || !key.includes("::")) {
    return ["", key];
  }
  const parts = key.split("::");
  return [parts[0] ?? "", parts[1] ?? ""];
}

// Reduce a day-qualified booked-slot key to its day-qualified BASE key
// (drops the variant segment). Used to populate `clashingSlots` so the grid's
// membership check — which builds a day-qualified base key from the cell's
// day + baseSlot — matches cleanly.
//
//   - "TUE::A1"      → "TUE::A1"
//   - "TUE::TC1::G1" → "TUE::TC1"
function dayQualifyBase(day: string, key: string): string {
  const [, baseSlot] = parseDayAndBase(key);
  return `${day}::${baseSlot}`;
}
