import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Pencil } from "lucide-react";

interface TimetableCellProps {
  fullLabel: string;
  baseSlot: string;
  variantSlot: string | null;
  selectionKey: string;
  day: string;
  isLunch?: boolean;
  isLab: boolean;
  cellData: { courseName: string; color: string; courseId: string } | null;
  visualizationMode: boolean;
  hasClash?: boolean;
  // Open the edit sheet for the booked course. Only booked cells are
  // interactive — empty cells remain non-interactive preview surfaces.
  onEditCourse?: (courseId: string) => void;
}

// Preview cell. Empty cells are non-interactive; booked cells render as a
// semantic <button> so keyboard and screen-reader users can open the edit
// sheet. Slot selection itself happens in CourseModal via the combination
// dropdown — the grid only renders the result and offers an edit affordance.
export default function TimetableCell({
  fullLabel,
  baseSlot,
  variantSlot: _variantSlot,
  selectionKey,
  day: _day,
  isLunch,
  isLab,
  cellData,
  visualizationMode,
  hasClash = false,
  onEditCourse,
}: TimetableCellProps) {
  if (isLunch) {
    return (
      <div className="flex min-h-[56px] items-center justify-center bg-accent/15 p-2 text-center">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
          Lunch
        </span>
      </div>
    );
  }

  if (!baseSlot) {
    return (
      <div
        className={`flex min-h-[56px] items-center justify-center p-2.5 ${
          isLab ? "bg-secondary/10" : "bg-background/30"
        }`}
      />
    );
  }

  // Visualization tint: course color fill + solid left edge when enabled.
  // Uses the course's hex color at ~20% alpha — visible in both light and dark
  // mode (the 13% alpha used previously was too faint against dark surfaces).
  // The full course color drives the 3px left border for instant identification.
  const cellStyle = cellData
    ? {
        backgroundColor: visualizationMode ? `${cellData.color}33` : undefined,
        borderLeft: visualizationMode
          ? `3px solid ${cellData.color}`
          : undefined,
      }
    : {};

  const cellInfo = cellData ? `${selectionKey}: ${cellData.courseName}` : "";

  // Clash treatment: inverted high-contrast surface (black ground / white ink
  // in light mode, inverted in dark) with a high-contrast ring + warning icon.
  // No burgundy/gold — pure monochrome. The ring makes clashes visible even
  // when scanning the grid at a glance.
  const clashClasses = hasClash
    ? "clash-surface ring-2 ring-clash-border/80 ring-offset-1 ring-offset-background"
    : "";

  // Booked cells are interactive — they open the edit sheet. Empty cells stay
  // non-interactive (no button, no cursor-pointer). The hover/focus ring + Edit
  // icon appear only on booked cells so users know filled cells are clickable.
  const isEditable = Boolean(cellData && onEditCourse);
  const editLabel = cellData ? `Edit ${cellData.courseName}` : "Edit course";

  const sharedClasses = `relative flex min-h-[56px] items-center justify-center p-2.5 text-center transition-smooth ${
    isLab ? "bg-secondary/15" : "bg-background/40"
  } ${clashClasses}`;
  const interactiveClasses = isEditable
    ? "cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background hover:ring-2 hover:ring-ring/40"
    : "cursor-default";

  const innerContent = (
    <>
      {hasClash && (
        <div className="absolute right-1.5 top-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-clash-fg" />
        </div>
      )}
      {/* Edit affordance — appears on hover/focus for booked cells only. */}
      {isEditable && (
        <div
          className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-sm bg-foreground/10 text-foreground opacity-0 transition-smooth group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          <Pencil className="h-2.5 w-2.5" />
        </div>
      )}
      {cellData ? (
        <span
          className={`line-clamp-2 font-body text-[11px] font-semibold leading-tight tracking-tight ${
            hasClash
              ? "text-clash-fg"
              : isLab
                ? "text-secondary-foreground"
                : "text-foreground"
          }`}
        >
          {cellData.courseName}
        </span>
      ) : (
        <span
          className={`font-body text-[11px] font-medium tracking-tight ${
            isLab ? "text-muted-foreground/70" : "text-muted-foreground"
          }`}
        >
          {fullLabel}
        </span>
      )}
    </>
  );

  // Booked cell → semantic <button> (keyboard + screen-reader accessible).
  // Empty cell → non-interactive <div> (no toggle, no cursor-pointer).
  const cellContent = isEditable ? (
    <button
      type="button"
      onClick={() => cellData && onEditCourse?.(cellData.courseId)}
      aria-label={editLabel}
      data-ocid={`cell.edit_button.${selectionKey.replace(/[^a-z0-9]+/gi, "_")}`}
      className={`${sharedClasses} ${interactiveClasses}`}
      style={cellStyle}
      data-cell-info={cellInfo}
    >
      {innerContent}
    </button>
  ) : (
    <div
      className={`${sharedClasses} ${interactiveClasses}`}
      style={cellStyle}
      data-cell-info={cellInfo}
    >
      {innerContent}
    </div>
  );

  // Tooltip only on booked cells — empty cells have nothing to explain.
  return (
    <>
      {cellData ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
            <TooltipContent className="border-border/50 bg-popover shadow-elevated">
              <p className="font-display text-sm font-medium tracking-tight">
                {cellData.courseName}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {fullLabel} {isLab ? "(Lab)" : "(Theory)"}
              </p>
              {isEditable && (
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Click to edit
                </p>
              )}
              {hasClash && (
                <p className="mt-1 flex items-center gap-1 font-body text-xs font-medium text-clash-fg">
                  <AlertTriangle className="h-3 w-3" />
                  Time clash detected (same day &amp; time)
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        cellContent
      )}
    </>
  );
}
