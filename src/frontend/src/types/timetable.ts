/**
 * Shared timetable type definitions.
 *
 * Extracted from `App.tsx` so that `App.tsx` (router) and `TimetableApp.tsx`
 * (index route component) no longer need to import types from each other,
 * which previously created a circular import:
 *
 *   App.tsx  -> TimetableApp (default export)
 *   TimetableApp -> App.tsx  (Course / CoursesData type import)
 *
 * Both files now import these types from this shared module instead.
 *
 * `TimetableApp.tsx` also re-exports a `Course` interface with the same shape
 * (kept for backwards compatibility with `CourseModal.tsx`, which imports
 * `Course` from `./TimetableApp`). The two definitions are kept in sync.
 */

export interface Course {
  id: string;
  name: string;
  color: string;
  selectedSlots: string[]; // Selection keys (e.g., "A1", "A2::SB1", "C1", "L1", "L2")
  credit: number; // 0 for lab courses | 1 | 2 | 3 | 4 for theory — credit value of the chosen combination
  combination: string; // Raw combination string (e.g. "A1+TA1+TAA1" for theory, "L1+L2" for lab)
}

export interface CoursesData {
  [courseId: string]: Course;
}
