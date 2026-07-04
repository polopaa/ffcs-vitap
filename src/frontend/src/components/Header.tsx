import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  onReset: () => void;
  onToggleVisualization: () => void;
  visualizationMode: boolean;
  selectedTable: string;
  onTableChange: (value: string) => void;
  clashWarning?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  onReset,
  onToggleVisualization,
  visualizationMode,
  selectedTable,
  onTableChange,
  clashWarning,
  isSidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header
      data-ocid="header.section"
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/75"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Brand — clean monochrome tile + courses toggle */}
          <div className="flex items-center gap-3">
            <Button
              data-ocid="header.toggle_sidebar"
              variant={isSidebarOpen ? "default" : "outline"}
              size="sm"
              onClick={onToggleSidebar}
              aria-pressed={isSidebarOpen}
              className={`h-10 gap-2 rounded-lg font-medium transition-smooth ${
                isSidebarOpen
                  ? "bg-primary text-primary-foreground shadow-soft ring-1 ring-border/40 hover:bg-primary/90"
                  : "border-border/50 bg-background/60 text-foreground hover:border-border hover:bg-muted"
              }`}
            >
              <ListChecks className="h-4 w-4" />
              <span className="text-sm">Courses</span>
            </Button>
            <div className="hidden h-8 w-px bg-border/50 sm:block" />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-soft ring-1 ring-border/40 transition-smooth">
              <span className="font-display text-lg font-semibold tracking-tight text-primary-foreground">
                FF
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                FFCS Timetable Builder
              </h1>
              <p className="font-body text-[11px] tracking-wide text-muted-foreground">
                Interactive Timetable
              </p>
            </div>
          </div>

          {/* Controls — subordinate, compact */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedTable} onValueChange={onTableChange}>
              <SelectTrigger
                data-ocid="header.select"
                className="h-8 w-[130px] rounded-md border-border/50 bg-background/60 text-xs shadow-xs transition-smooth hover:border-border"
              >
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border/50 bg-popover shadow-soft">
                <SelectItem value="default">Default Table</SelectItem>
                <SelectItem value="alternate">Alternate Table</SelectItem>
              </SelectContent>
            </Select>

            <Button
              data-ocid="header.toggle_visualization"
              variant="ghost"
              size="sm"
              onClick={onToggleVisualization}
              className="h-8 gap-1.5 rounded-md text-xs text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
            >
              {visualizationMode ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hide Tints</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Show Tints</span>
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid="header.reset_button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md text-xs text-destructive transition-smooth hover:bg-destructive/10 hover:text-destructive"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-lg border-border/60 bg-popover shadow-elevated">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display tracking-tight">
                    Reset the timetable
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove every course and clear all assigned time
                    slots. The timetable returns to a blank week.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid="header.cancel_button"
                    className="rounded-md border-border/50 transition-smooth"
                  >
                    Keep schedule
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="header.confirm_button"
                    onClick={() => {
                      onReset();
                      toast.success("Timetable reset");
                    }}
                    className="rounded-md bg-destructive text-destructive-foreground transition-smooth hover:bg-destructive/90"
                  >
                    Reset all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Inline clash notice — inverted high-contrast surface, never a browser alert */}
        {clashWarning && (
          <output
            data-ocid="header.clash_warning"
            className="clash-surface mt-3 flex items-center gap-2 px-3 py-2 text-xs font-medium"
            aria-live="polite"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-clash-fg" />
            <span>{clashWarning}</span>
          </output>
        )}
      </div>
    </header>
  );
}
