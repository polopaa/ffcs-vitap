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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CoursesData } from "@/types/timetable";
import { Edit2, Trash2 } from "lucide-react";

interface CourseSidebarProps {
  courses: CoursesData;
  onEditCourse: (courseId: string) => void;
  onRemoveCourse: (courseId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CourseSidebar({
  courses,
  onEditCourse,
  onRemoveCourse,
  isOpen,
  onToggle,
}: CourseSidebarProps) {
  const courseList = Object.values(courses);

  return (
    <>
      {/* Sidebar — right rail. Toggle lives in the header (single entry point). */}
      <aside
        data-ocid="sidebar.panel"
        className={`fixed right-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 border-l border-border/40 bg-card shadow-elevated transition-transform md:w-80 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border/40 bg-muted/30 px-4 py-4">
            <h3 className="font-display text-lg font-medium tracking-tight">
              Courses
            </h3>
            <p className="mt-1 font-body text-xs tracking-wide text-muted-foreground">
              {courseList.length} course{courseList.length !== 1 ? "s" : ""} on
              the week
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2.5 p-4">
              {courseList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/40 bg-muted/20 p-5 text-center">
                  <p className="font-body text-sm text-muted-foreground">
                    No courses yet. Press{" "}
                    <span className="font-medium text-foreground">
                      Add Course
                    </span>{" "}
                    to begin.
                  </p>
                </div>
              ) : (
                courseList.map((course, idx) => (
                  <div
                    key={course.id}
                    data-ocid={`sidebar.item.${idx + 1}`}
                    className="group rounded-lg border border-border/40 bg-background/50 p-3 transition-smooth hover:border-accent/40 hover:shadow-soft"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 h-4 w-4 shrink-0 rounded shadow-xs ring-1 ring-foreground/10"
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-display text-sm font-medium tracking-tight">
                          {course.name}
                        </h4>
                        <p className="mt-1 font-body text-xs text-muted-foreground">
                          {course.selectedSlots.length} slot
                          {course.selectedSlots.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <Button
                          data-ocid={`sidebar.edit_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditCourse(course.id)}
                          aria-label={`Edit ${course.name}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`sidebar.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Delete ${course.name}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-border/50 bg-popover shadow-elevated">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display tracking-tight">
                                Remove course
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove “{course.name}” from the almanac? This
                                clears it from every assigned time slot.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                data-ocid="sidebar.cancel_button"
                                className="border-border/40"
                              >
                                Keep
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid="sidebar.confirm_button"
                                onClick={() => onRemoveCourse(course.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-background/70 backdrop-blur-sm md:hidden cursor-default"
          onClick={onToggle}
          aria-label="Close courses panel"
        />
      )}
    </>
  );
}
