import { Fragment } from "react";
import {
  DAYS,
  DAY_SLOTS,
  type Day,
  LAB_LUNCH_INDEX,
  LAB_TIME_SLOTS,
  THEORY_LUNCH_INDEX,
  THEORY_TIME_SLOTS,
  constructSelectionKey,
  dayQualifySlot,
  parseSlotLabel,
} from "../lib/slotData";
import TimetableCell from "./TimetableCell";

interface TimetableGridProps {
  getCellData: (
    dayQualifiedKey: string,
  ) => { courseName: string; color: string; courseId: string } | null;
  visualizationMode: boolean;
  clashingSlots: Set<string>;
  // Clicking a booked cell opens that course in the edit panel. Only cells
  // with a booked course are interactive — empty cells stay read-only.
  onEditCourse?: (courseId: string) => void;
}

// The grid is a LIVE READ-ONLY PREVIEW of booked slots. Empty cells are never
// clickable. BOOKED cells (cellData with a courseId) are clickable — they open
// the course in the sidebar edit panel via onEditCourse. Slot selection for
// new courses still happens in CourseModal via the combination dropdown; the
// grid only renders the result and offers a quick edit shortcut on filled
// cells.

// The grid renders 13 slot columns. Theory has data in 10 of them, lab in 12.
// LUNCH is a single column (index 6) that spans both the theory and lab rows
// via rowSpan=2. Columns 5 and 12 carry lab-only data (theory renders an empty
// cell there). This column layout is derived from the shared slotData module
// so the rendered grid stays in sync with SlotSelector.
const TOTAL_COLUMNS = 13;
const LUNCH_COLUMN = 6;

interface ColumnMapping {
  theoryTime: string;
  labTime: string;
  theoryIndex: number | null;
  labIndex: number | null;
  isLunch: boolean;
}

// Build the 13-column mapping from the shared time-slot arrays.
// Theory data indices: columns 0-4 → theory[0-4], columns 7-11 → theory[5-9].
// Lab data indices: columns 0-5 → lab[0-5], columns 7-12 → lab[6-11].
// Column 6 is LUNCH for both rows.
function buildColumnMappings(): ColumnMapping[] {
  return Array.from({ length: TOTAL_COLUMNS }, (_, col) => {
    const isLunch = col === LUNCH_COLUMN;

    let theoryTime = "";
    let theoryIndex: number | null = null;
    if (isLunch) {
      theoryTime = THEORY_TIME_SLOTS[THEORY_LUNCH_INDEX];
    } else if (col < LUNCH_COLUMN) {
      theoryTime = THEORY_TIME_SLOTS[col] ?? "";
      if (col < THEORY_LUNCH_INDEX) theoryIndex = col;
    } else {
      const idx = col - 1;
      theoryTime = THEORY_TIME_SLOTS[idx] ?? "";
      if (idx < THEORY_TIME_SLOTS.length && idx !== THEORY_LUNCH_INDEX)
        theoryIndex = idx;
    }

    let labTime = "";
    let labIndex: number | null = null;
    if (isLunch) {
      labTime = LAB_TIME_SLOTS[LAB_LUNCH_INDEX];
    } else if (col < LUNCH_COLUMN) {
      labTime = LAB_TIME_SLOTS[col] ?? "";
      labIndex = col;
    } else {
      const idx = col - 1;
      labTime = LAB_TIME_SLOTS[idx] ?? "";
      labIndex = idx;
    }

    return { theoryTime, labTime, theoryIndex, labIndex, isLunch };
  });
}

const COLUMNS = buildColumnMappings();

export { constructSelectionKey };

export default function TimetableGrid({
  getCellData,
  visualizationMode,
  clashingSlots,
  onEditCourse,
}: TimetableGridProps) {
  return (
    <div
      data-ocid="timetable.section"
      className="w-full overflow-x-auto rounded-xl border border-border/40 bg-card shadow-elevated"
    >
      <div id="timetable-grid" className="min-w-[1200px] p-3 md:p-5">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {/* Theory Hours header — gilt gold hairline, the almanac spine */}
            <tr>
              <th
                className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm"
                aria-label="Row label column"
              />
              <th
                colSpan={TOTAL_COLUMNS}
                className="border-b border-accent/40 bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10 px-4 pb-2 text-left"
              >
                <span className="font-display text-sm font-medium tracking-wide text-accent-foreground/90">
                  Theory Hours
                </span>
              </th>
            </tr>
            <tr className="bg-muted/30">
              <th className="sticky left-0 z-10 border-b border-border/40 bg-muted/30 p-2.5" />
              {COLUMNS.map((col, idx) => (
                <th
                  key={`theory-${col.theoryTime}-${idx}`}
                  className={`border-b border-border/40 px-2 py-2 text-center font-body text-[11px] font-medium tracking-tight text-muted-foreground ${
                    col.isLunch ? "bg-accent/15" : ""
                  }`}
                >
                  {col.theoryTime}
                </th>
              ))}
            </tr>
            {/* Lab Hours header — quieter emerald hairline */}
            <tr className="bg-muted/20">
              <th
                className="sticky left-0 z-10 border-b border-border/40 bg-muted/20 p-2.5"
                aria-label="Row label column"
              />
              {COLUMNS.map((col, idx) => (
                <th
                  key={`lab-${col.labTime}-${idx}`}
                  className={`border-b border-border/40 px-2 py-2 text-center font-body text-[11px] font-medium tracking-tight text-muted-foreground/80 ${
                    col.isLunch ? "bg-accent/15" : ""
                  }`}
                >
                  {col.labTime}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Day Rows */}
            {DAYS.map((day: Day) => {
              const daySlots = DAY_SLOTS[day];
              return (
                <Fragment key={day}>
                  {/* Theory Row */}
                  <tr key={`${day}-theory`} className="bg-background/40">
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-10 border-b border-r border-border/40 bg-secondary/40 px-3 py-3 text-center align-middle"
                    >
                      <span className="font-display text-base font-medium tracking-wide text-foreground">
                        {day}
                      </span>
                    </th>
                    {COLUMNS.map((col, _idx) => {
                      if (col.isLunch) {
                        return (
                          <td
                            key={`${day}-lunch-${col.theoryTime}`}
                            rowSpan={2}
                            className="border-b border-r border-border/40 p-0 last:border-r-0"
                            data-base-slot="LUNCH"
                            data-day={day}
                          >
                            <TimetableCell
                              fullLabel="LUNCH"
                              baseSlot="LUNCH"
                              variantSlot={null}
                              selectionKey="LUNCH"
                              day={day}
                              isLunch
                              isLab={false}
                              cellData={null}
                              visualizationMode={visualizationMode}
                              hasClash={false}
                              onEditCourse={onEditCourse}
                            />
                          </td>
                        );
                      }

                      const theoryIdx = col.theoryIndex;
                      const fullLabel =
                        theoryIdx !== null ? daySlots.theory[theoryIdx] : "";
                      const { baseSlot, variantSlot } =
                        parseSlotLabel(fullLabel);
                      const selectionKey = constructSelectionKey(
                        baseSlot,
                        variantSlot,
                      );
                      // Day-qualified BASE key for this cell. course.selectedSlots
                      // stores day-qualified base keys (e.g. "TUE::A1",
                      // "TUE::TC1" — combination codes are plain base codes, so
                      // no variant segment), and clashingSlots stores day-qualified
                      // base keys too. The variant co-occupies the same cell/time
                      // as its base, so the base key alone matches both the
                      // booked-slot lookup and the clash membership check.
                      const dayQualifiedKey = dayQualifySlot(
                        baseSlot,
                        day,
                        null,
                      );
                      const cellData = getCellData(dayQualifiedKey);
                      const hasClash = baseSlot
                        ? clashingSlots.has(dayQualifiedKey)
                        : false;

                      return (
                        <td
                          key={`${day}-theory-${col.theoryTime}`}
                          className="border-b border-r border-border/40 p-0 last:border-r-0"
                          data-base-slot={baseSlot || undefined}
                          data-variant-slot={variantSlot || undefined}
                          data-day={day}
                        >
                          <TimetableCell
                            fullLabel={fullLabel}
                            baseSlot={baseSlot}
                            variantSlot={variantSlot}
                            selectionKey={selectionKey}
                            day={day}
                            isLunch={false}
                            isLab={false}
                            cellData={cellData}
                            visualizationMode={visualizationMode}
                            hasClash={hasClash}
                            onEditCourse={onEditCourse}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Lab Row - aligned exactly with theory columns */}
                  <tr key={`${day}-lab`} className="bg-background/20">
                    {COLUMNS.map((col, _idx) => {
                      // LUNCH column is spanned from the theory row — skip it here.
                      if (col.isLunch) return null;

                      const labIdx = col.labIndex;
                      const fullLabel =
                        labIdx !== null ? daySlots.lab[labIdx] : "";
                      const { baseSlot, variantSlot } =
                        parseSlotLabel(fullLabel);
                      const selectionKey = constructSelectionKey(
                        baseSlot,
                        variantSlot,
                      );
                      // Day-qualified BASE key for this cell. course.selectedSlots
                      // stores day-qualified base keys (e.g. "TUE::L2"), and
                      // clashingSlots stores day-qualified base keys too. Lab
                      // cells carry plain base codes with no variant, so the
                      // day-qualified base key matches exactly.
                      const dayQualifiedKey = dayQualifySlot(
                        baseSlot,
                        day,
                        null,
                      );
                      const cellData = getCellData(dayQualifiedKey);
                      const hasClash = baseSlot
                        ? clashingSlots.has(dayQualifiedKey)
                        : false;

                      return (
                        <td
                          key={`${day}-lab-${col.labTime}`}
                          className="border-b border-r border-border/40 p-0 last:border-r-0"
                          data-base-slot={baseSlot || undefined}
                          data-variant-slot={variantSlot || undefined}
                          data-day={day}
                        >
                          <TimetableCell
                            fullLabel={fullLabel}
                            baseSlot={baseSlot}
                            variantSlot={variantSlot}
                            selectionKey={selectionKey}
                            day={day}
                            isLunch={false}
                            isLab
                            cellData={cellData}
                            visualizationMode={visualizationMode}
                            hasClash={hasClash}
                            onEditCourse={onEditCourse}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
