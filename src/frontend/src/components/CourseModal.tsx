import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type CandidateClash,
  checkCandidateClash,
} from "../lib/clashDetection";
import {
  CREDIT_VALUES,
  type SlotCombination,
  getCombination,
  getCombinationsByCredit,
  getLabCombinations,
  isLabCombination,
} from "../lib/slotCombinations";
import type { Course } from "./TimetableApp";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  existingCourse?: Course;
  // All currently-saved courses — used to auto-assign the next unused palette
  // color when adding a new course. Optional for backwards compatibility.
  existingCourses?: Course[];
}

// Multi-color course palette — 10 distinct hues mapped to the --course-N CSS
// tokens. `swatchClass` is the solid-color chip utility (.course-swatch-N);
// `hex` mirrors the OKLCH value so the existing `${color}22` alpha trick in
// TimetableCell/Sidebar keeps working without inline oklch() usage. These
// replace the old monochrome swatch-1..5 + pattern system.
export interface PresetColor {
  index: number; // 1..10 — matches --course-N token
  name: string;
  swatchClass: string; // .course-swatch-N
  hex: string;
}

export const PRESET_COLORS: PresetColor[] = [
  { index: 1, name: "Blue", swatchClass: "course-swatch-1", hex: "#3b82f6" },
  { index: 2, name: "Teal", swatchClass: "course-swatch-2", hex: "#14b8a6" },
  { index: 3, name: "Green", swatchClass: "course-swatch-3", hex: "#22c55e" },
  { index: 4, name: "Lime", swatchClass: "course-swatch-4", hex: "#84cc16" },
  { index: 5, name: "Amber", swatchClass: "course-swatch-5", hex: "#f59e0b" },
  { index: 6, name: "Orange", swatchClass: "course-swatch-6", hex: "#f97316" },
  { index: 7, name: "Red", swatchClass: "course-swatch-7", hex: "#ef4444" },
  { index: 8, name: "Rose", swatchClass: "course-swatch-8", hex: "#f43f5e" },
  { index: 9, name: "Violet", swatchClass: "course-swatch-9", hex: "#8b5cf6" },
  {
    index: 10,
    name: "Indigo",
    swatchClass: "course-swatch-10",
    hex: "#6366f1",
  },
];

type CourseType = "Theory" | "Lab";

// Pick the next palette color for a new course. Prefers the first palette
// entry whose hex is not yet used by an existing course; falls back to a
// round-robin pick by count when all colors are in use.
function pickAutoColor(existingCourses: Course[] = []): PresetColor {
  const usedHexes = new Set(
    existingCourses.map((course) => course.color).filter(Boolean),
  );
  const unused = PRESET_COLORS.find((swatch) => !usedHexes.has(swatch.hex));
  if (unused) return unused;
  return PRESET_COLORS[existingCourses.length % PRESET_COLORS.length];
}

export default function CourseModal({
  isOpen,
  onClose,
  onSave,
  existingCourse,
  existingCourses,
}: CourseModalProps) {
  const [courseName, setCourseName] = useState("");
  const [selectedColor, setSelectedColor] = useState<PresetColor>(
    PRESET_COLORS[0],
  );
  const [courseType, setCourseType] = useState<CourseType>("Theory");
  const [credit, setCredit] = useState<number>(4);
  const [combination, setCombination] = useState<string>("");
  // Inline messaging — replaces browser alert() dialogs.
  const [slotWarning, setSlotWarning] = useState<string | null>(null);
  // Validation surface — shown when Save is attempted without a combination.
  const [showCombinationError, setShowCombinationError] = useState(false);

  // Combinations available for the currently selected credit value (theory).
  const theoryCombinations = useMemo<SlotCombination[]>(
    () => getCombinationsByCredit(credit),
    [credit],
  );

  // Lab pair combinations — L1+L2 ... L99+L100. Memoized once; the list is
  // static and large (50 entries) so we avoid recomputing on every render.
  const labCombinations = useMemo<SlotCombination[]>(
    () => getLabCombinations(),
    [],
  );

  // The dropdown list depends on the course type: theory combos for Theory,
  // lab pairs for Lab.
  const availableCombinations = useMemo<SlotCombination[]>(
    () => (courseType === "Lab" ? labCombinations : theoryCombinations),
    [courseType, labCombinations, theoryCombinations],
  );

  // Resolve the currently selected combination object (if any). getCombination
  // searches both theory and lab pools, so it resolves either type.
  const selectedCombination = useMemo<SlotCombination | undefined>(
    () => (combination ? getCombination(combination) : undefined),
    [combination],
  );

  // The slots this course will occupy — derived directly from the combination.
  const selectedSlots = useMemo<string[]>(
    () => selectedCombination?.slots ?? [],
    [selectedCombination],
  );

  // Authoritative pre-save clash check. Runs the SAME same-day + same-time
  // overlap logic as detectClashes (theory↔theory, theory↔lab, and lab↔lab)
  // against every other existing course, excluding the course being edited
  // so re-picking a combination never self-clashes. The candidate slots and
  // existing courses' selectedSlots are DAY-QUALIFIED keys, so the day is
  // parsed authoritatively from each key — no external day mapping needed.
  // Re-runs whenever the selected combination, the existing courses, or the
  // edited course identity changes.
  const blockingClash = useMemo<CandidateClash | null>(
    () =>
      selectedSlots.length > 0
        ? checkCandidateClash(
            selectedSlots,
            existingCourses ?? [],
            existingCourse?.id,
          )
        : null,
    [selectedSlots, existingCourses, existingCourse],
  );

  const hasBlockingClash = blockingClash !== null;
  const blockingClashDetails = useMemo(() => {
    if (!blockingClash) return [] as string[];
    return [
      `“${blockingClash.existingCourseName}” on ${blockingClash.day} (${blockingClash.existingSlot})`,
    ];
  }, [blockingClash]);

  // Pre-compute the set of combinations that would produce a hard clash, so
  // the dropdown can disable them at the source. We check each available
  // combination's day-qualified slots against the existing courses (excluding
  // the course being edited). This is O(combos × courses × slots) but runs
  // only when the available list or existing courses change — not per render.
  const blockedCombinations = useMemo<Set<string>>(() => {
    const blocked = new Set<string>();
    for (const combo of availableCombinations) {
      const clash = checkCandidateClash(
        combo.slots,
        existingCourses ?? [],
        existingCourse?.id,
      );
      if (clash) blocked.add(combo.combination);
    }
    return blocked;
  }, [availableCombinations, existingCourses, existingCourse]);

  // Hydrate form state when the modal opens for add or edit.
  useEffect(() => {
    if (existingCourse) {
      setCourseName(existingCourse.name);
      const matched =
        PRESET_COLORS.find((swatch) => swatch.hex === existingCourse.color) ??
        PRESET_COLORS[0];
      setSelectedColor(matched);
      // Detect type from the stored combination: lab combos start with "L".
      const isLab = isLabCombination(existingCourse.combination);
      setCourseType(isLab ? "Lab" : "Theory");
      setCredit(isLab ? 0 : existingCourse.credit);
      setCombination(existingCourse.combination);
    } else {
      setCourseName("");
      setSelectedColor(pickAutoColor(existingCourses));
      setCourseType("Theory");
      setCredit(4);
      setCombination("");
    }
    setSlotWarning(null);
    setShowCombinationError(false);
    // existingCourses is intentionally a dependency — a freshly-added course
    // changes the auto-color pick for the next add.
  }, [existingCourse, existingCourses]);

  // Switching course type resets the combination — a theory combo is not valid
  // in the lab dropdown and vice versa. Credit is reset to its type default.
  const handleTypeChange = (next: CourseType) => {
    if (next === courseType) return;
    setCourseType(next);
    setCombination("");
    setSlotWarning(null);
    setShowCombinationError(false);
    if (next === "Lab") {
      // Labs are not credit-based; sentinel 0.
      setCredit(0);
    } else {
      // Restore a sensible theory default if the previous credit was the lab
      // sentinel; otherwise keep the existing theory credit.
      setCredit((prev) => (prev === 0 ? 4 : prev));
    }
  };

  // When the credit value changes, reset the selected combination — the old
  // combination belongs to a different credit tier and is no longer valid.
  const handleCreditChange = (value: string) => {
    const nextCredit = Number(value);
    setCredit(nextCredit);
    setCombination("");
    setSlotWarning(null);
    setShowCombinationError(false);
  };

  // Selecting a combination just stores the value — the authoritative clash
  // check now runs reactively via the `blockingClash` useMemo above, so it
  // re-evaluates whenever the combination, existing courses, or day mapping
  // change. The old per-slot getCellData advisory scan is replaced by the
  // same-day + same-time overlap logic that detectClashes uses post-save.
  const handleCombinationChange = (value: string) => {
    setCombination(value);
    setShowCombinationError(false);
  };

  const handleSave = () => {
    // Save requires a combination for both Theory and Lab. Credit always has a
    // value (theory: 1-4, lab: 0 sentinel), so the only hard requirement is a
    // combination selection.
    if (!combination) {
      setShowCombinationError(true);
      return;
    }

    const course: Course = {
      id: existingCourse?.id || `course_${Date.now()}`,
      name: courseName.trim() || "Untitled Course",
      color: selectedColor.hex,
      selectedSlots,
      credit: courseType === "Lab" ? 0 : credit,
      combination,
    };

    onSave(course);
  };

  // Save requires a combination AND no hard clash. Credit always has a value
  // (theory: 1-4, lab: 0 sentinel), so the only hard requirements are a
  // combination selection and a clash-free candidate.
  const canSave = combination.length > 0 && !hasBlockingClash;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md border-l border-border/60 bg-card shadow-elevated"
        data-ocid="course.panel"
      >
        <SheetHeader className="border-b border-border/60 bg-subtle px-6 py-5">
          <SheetTitle
            className="font-display text-2xl tracking-tight text-foreground"
            data-ocid="course.title"
          >
            {existingCourse ? "Edit Course" : "Add Course"}
          </SheetTitle>
          <SheetDescription className="tracking-wide text-muted-foreground">
            {existingCourse
              ? "Adjust the details and re-pick a combination. The timetable updates on save."
              : "Pick a color, choose a type, then select a slot combination."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Course name — optional */}
            <div className="space-y-2">
              <Label
                htmlFor="courseName"
                className="text-sm font-semibold tracking-wide text-foreground"
              >
                Course Name{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="courseName"
                data-ocid="course.name_input"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Data Structures"
                className="rounded-md border-border/50 bg-background transition-smooth focus:ring-ring"
              />
            </div>

            {/* Course type — Theory / Lab segmented toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold tracking-wide text-foreground">
                Course Type
              </Label>
              <div
                role="radiogroup"
                aria-label="Course type"
                className="grid grid-cols-2 gap-1 rounded-md border border-border/50 bg-muted/40 p-1"
                data-ocid="course.type_picker"
              >
                {(["Theory", "Lab"] as const).map((type) => {
                  const isActive = courseType === type;
                  return (
                    <label
                      key={type}
                      className={`cursor-pointer rounded-[calc(var(--radius)-4px)] px-3 py-2 text-center text-sm font-medium tracking-wide transition-smooth ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-muted-foreground hover:text-foreground hover:bg-card"
                      }`}
                    >
                      <input
                        type="radio"
                        name="courseType"
                        value={type}
                        checked={isActive}
                        onChange={() => handleTypeChange(type)}
                        className="sr-only"
                        data-ocid={`course.type_toggle.${type.toLowerCase()}`}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                {courseType === "Theory"
                  ? "Credit-based — pick a credit value, then a slot combination."
                  : "Lab pair — pick a consecutive lab slot pair (L1+L2, L3+L4, …)."}
              </p>
            </div>

            {/* Color palette — 10 distinct hues */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold tracking-wide text-foreground">
                Course Color
              </Label>
              <div
                className="flex flex-wrap gap-3"
                data-ocid="course.color_picker"
              >
                {PRESET_COLORS.map((swatch) => {
                  const isActive = selectedColor.hex === swatch.hex;
                  return (
                    <button
                      type="button"
                      key={swatch.hex}
                      data-ocid={`course.color_swatch.${swatch.name.toLowerCase()}`}
                      onClick={() => setSelectedColor(swatch)}
                      className={`group relative h-10 w-10 overflow-hidden rounded-lg border-2 transition-smooth hover:scale-110 ${swatch.swatchClass} ${
                        isActive
                          ? "border-foreground ring-2 ring-ring/40 scale-110"
                          : "border-border/50 hover:border-foreground/40"
                      }`}
                      aria-label={`Select ${swatch.name}`}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-background/90" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Distinct hues keep courses distinguishable at a glance.
              </p>
            </div>

            {/* Credit selector — only shown for Theory. Labs are not credit-based. */}
            {courseType === "Theory" && (
              <div className="space-y-2">
                <Label
                  htmlFor="creditSelect"
                  className="text-sm font-semibold tracking-wide text-foreground"
                >
                  Credit Value
                </Label>
                <Select
                  value={String(credit)}
                  onValueChange={handleCreditChange}
                >
                  <SelectTrigger
                    id="creditSelect"
                    data-ocid="course.credit_select"
                    className="h-11 w-full rounded-md border-border/50 bg-background transition-smooth focus:ring-ring"
                  >
                    <SelectValue placeholder="Select credit" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-md border-border/60 bg-popover shadow-elevated"
                    data-ocid="course.credit_dropdown"
                  >
                    {CREDIT_VALUES.map((value) => (
                      <SelectItem
                        key={value}
                        value={String(value)}
                        data-ocid={`course.credit_option.${value}`}
                      >
                        {value} credit{value !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Determines which slot combinations are available.
                </p>
              </div>
            )}

            {/* Combination dropdown — theory combos (by credit) or lab pairs. */}
            <div className="space-y-2">
              <Label
                htmlFor="combinationSelect"
                className="text-sm font-semibold tracking-wide text-foreground"
              >
                {courseType === "Lab" ? "Lab Pair" : "Slot Combination"}
              </Label>
              <Select
                value={combination}
                onValueChange={handleCombinationChange}
              >
                <SelectTrigger
                  id="combinationSelect"
                  data-ocid="course.combination_select"
                  aria-invalid={showCombinationError}
                  className={`h-11 w-full rounded-md border-border/50 bg-background transition-smooth focus:ring-ring ${
                    showCombinationError
                      ? "border-clash-border ring-2 ring-clash-border/40"
                      : ""
                  }`}
                >
                  <SelectValue
                    placeholder={`${availableCombinations.length} ${
                      courseType === "Lab" ? "lab pairs" : "combinations"
                    } available`}
                  />
                </SelectTrigger>
                <SelectContent
                  className="max-h-80 rounded-md border-border/60 bg-popover shadow-elevated"
                  data-ocid="course.combination_dropdown"
                >
                  {availableCombinations.map((combo) => {
                    const isBlocked = blockedCombinations.has(
                      combo.combination,
                    );
                    return (
                      <SelectItem
                        key={combo.combination}
                        value={combo.combination}
                        disabled={isBlocked}
                        data-ocid={`course.combination_option.${combo.combination.replace(/[^a-z0-9]+/gi, "_")}`}
                        className={
                          isBlocked
                            ? "opacity-50 data-[disabled]:opacity-50"
                            : undefined
                        }
                      >
                        <span className="font-mono tracking-tight">
                          {combo.combination}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {combo.slots.length} slot
                          {combo.slots.length !== 1 ? "s" : ""}
                          {isBlocked ? " · clash" : ""}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Inline validation — Save attempted without a combination */}
              {showCombinationError && (
                <output
                  className="clash-surface flex items-start gap-2 px-3 py-2.5 text-xs"
                  data-ocid="course.combination_error"
                  aria-live="polite"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clash-fg" />
                  <span className="tracking-wide text-clash-fg">
                    {courseType === "Lab"
                      ? "Select a lab pair before saving."
                      : "Select a slot combination before saving."}
                  </span>
                </output>
              )}

              {/* Hard clash — blocks Save. Names the clashing course + slot. */}
              {hasBlockingClash && combination && (
                <output
                  className="clash-surface flex items-start gap-2 px-3 py-2.5 text-xs"
                  data-ocid="course.blocking_clash_warning"
                  aria-live="assertive"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clash-fg" />
                  <span className="tracking-wide text-clash-fg">
                    This combination clashes with{" "}
                    {blockingClashDetails.join(", ")}. Edit that course to free
                    the slot, or pick another combination.
                  </span>
                </output>
              )}

              {/* Soft advisory — shown when there is no hard clash but a
                  non-blocking slot warning was set (kept for backwards
                  compatibility with any future advisory path). */}
              {slotWarning && !hasBlockingClash && (
                <output
                  className="clash-surface flex items-start gap-2 px-3 py-2.5 text-xs"
                  data-ocid="course.slot_warning"
                  aria-live="polite"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clash-fg" />
                  <span className="tracking-wide text-clash-fg">
                    {slotWarning}
                  </span>
                </output>
              )}

              {/* Resolved slots preview — read-only summary of the selection */}
              {selectedCombination && (
                <div
                  className="rounded-md border border-border/40 bg-muted/30 px-3 py-2.5"
                  data-ocid="course.combination_preview"
                >
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resolved Slots
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSlots.map((slot, idx) => (
                      <span
                        key={slot}
                        data-ocid={`course.resolved_slot.${idx + 1}`}
                        className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[11px] tracking-tight text-foreground"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                {courseType === "Lab"
                  ? "Pick a consecutive lab pair — both lab slots fill the lab rows."
                  : "Selecting a combination fills the timetable automatically — no manual cell clicking."}
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border/60 bg-muted/30 px-6 py-4">
          {/* Inline save guidance — replaces the disabled-without-explanation pattern */}
          {!canSave && (
            <p
              className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground"
              data-ocid="course.save_guidance"
            >
              <Info className="h-3.5 w-3.5" />
              {courseType === "Lab"
                ? "Pick a lab pair to enable saving."
                : "Pick a combination to enable saving."}
            </p>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="course.cancel_button"
            className="rounded-md border-border/50 transition-smooth"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            data-ocid="course.save_button"
            className="rounded-md bg-primary font-semibold tracking-wide text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            {existingCourse ? "Update Course" : "Save Course"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
