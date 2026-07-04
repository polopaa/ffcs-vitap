import { Button } from "@/components/ui/button";
import type { CoursesData } from "@/types/timetable";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { detectClashes, getClashSummary } from "../lib/clashDetection";
import CourseModal from "./CourseModal";
import CourseSidebar from "./CourseSidebar";
import Footer from "./Footer";
import Header from "./Header";
import TimetableGrid from "./TimetableGrid";

export interface Course {
  id: string;
  name: string;
  color: string;
  selectedSlots: string[];
  // `credit` is the chosen credit value: 0 for lab courses, 1-4 for theory.
  // `combination` is the raw combination string (e.g. "A1+TA1+TAA1" for theory,
  // "L1+L2" for lab) that produced selectedSlots. Both are required —
  // CourseModal always sets them when creating or editing a course. Kept in
  // sync with the Course interface in App.tsx.
  credit: number;
  combination: string;
}

export default function TimetableApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const analytics = useAnalytics();

  const [courses, setCourses] = useState<CoursesData>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState(true);
  const [selectedTable, setSelectedTable] = useState("default");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Memoize the clash result so its identity (and the clashingSlots Set
  // identity) only changes when the inputs actually change. Without this,
  // detectClashes returns a fresh object + fresh Set every render, which —
  // when listed as a useEffect dependency — fired the analytics effect every
  // render, invalidating the adminAnalytics query, re-rendering, and looping
  // forever (Minified React error #185).
  //
  // detectClashes parses the day directly from each day-qualified booked-slot
  // key in course.selectedSlots (e.g. "TUE::A1"), so it no longer takes an
  // external slotDayMapping parameter — the same-day guard is authoritative.
  const clashResult = useMemo(() => detectClashes(courses), [courses]);
  const clashSummary = useMemo(
    () => getClashSummary(clashResult.clashes),
    [clashResult],
  );

  // Track analytics ONLY when the clash state actually changes. Depend on
  // PRIMITIVE values (hasClashes boolean, clashes.length number) — never on
  // the clashingSlots Set, whose identity would change every render even when
  // the clash set is semantically identical.
  const hasClashes = clashResult.hasClashes;
  const clashCount = clashResult.clashes.length;
  // Snapshot the affected slots as a stable primitive array. The clashingSlots
  // Set identity changes every render, so we depend on this derived array
  // (which only gets a new reference when the underlying clashes change) plus
  // the primitive flags — never on the Set itself.
  const affectedSlots = useMemo(
    () => Array.from(clashResult.clashingSlots),
    [clashResult],
  );
  useEffect(() => {
    if (hasClashes) {
      analytics.trackClashDetected(clashCount, affectedSlots);
    }
  }, [hasClashes, clashCount, affectedSlots, analytics.trackClashDetected]);

  useEffect(() => {
    if (location.pathname === "/admin-insights") {
      navigate({ to: "/admin-insights", search: location.search as any });
    } else if (location.pathname === "/creator") {
      navigate({ to: "/creator" });
    }
  }, [location.pathname, location.search, navigate]);

  const handleAddCourse = () => {
    setSelectedCourseId(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (course: Course) => {
    setCourses((prev) => ({
      ...prev,
      [course.id]: course,
    }));

    if (!selectedCourseId) {
      analytics.trackCourseCreated(Object.keys(courses).length + 1);
    }

    analytics.trackSlotSelected(course.selectedSlots.length);
    setIsModalOpen(false);
    setSelectedCourseId(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => {
      const updated = { ...prev };
      delete updated[courseId];
      return updated;
    });

    analytics.trackCourseRemoved(Object.keys(courses).length - 1);
  };

  const handleResetTimetable = () => {
    setCourses({});
    analytics.trackReset();
  };

  // Resolve a cell's day-qualified base key to the booked course, if any.
  //
  // TimetableGrid builds a day-qualified BASE key for each cell via
  // dayQualifySlot(baseSlot, day, null) — e.g. "TUE::A1" or "TUE::TC1" — and
  // passes it here. course.selectedSlots stores day-qualified base keys of the
  // same shape (combination codes are plain base codes, so qualifyCombinationSlots
  // produces "DAY::base" with no variant segment). A direct membership check
  // therefore fills the cell for both theory and lab rows. The variant co-
  // occupies the same cell/time as its base, so the base key alone is
  // sufficient — a composite grid cell like "TC1/G1" matches a course whose
  // combination includes "TC1" via the "TUE::TC1" key.
  const getCellData = (dayQualifiedKey: string) => {
    if (!dayQualifiedKey || dayQualifiedKey === "LUNCH") return null;
    for (const course of Object.values(courses)) {
      if (course.selectedSlots.includes(dayQualifiedKey)) {
        return {
          courseName: course.name,
          color: course.color,
          courseId: course.id,
        };
      }
    }
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onReset={handleResetTimetable}
        onToggleVisualization={() => setVisualizationMode(!visualizationMode)}
        visualizationMode={visualizationMode}
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
        clashWarning={clashSummary}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Grid-dominant main area — grid takes the majority of the viewport */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
              Weekly Schedule
            </h2>
            <p className="mt-1 font-body text-xs tracking-wide text-muted-foreground">
              Tuesday through Saturday · Theory &amp; Lab rows
            </p>
          </div>
          <Button
            data-ocid="timetable.add_course_button"
            onClick={handleAddCourse}
            className="gap-2 bg-primary font-medium text-primary-foreground shadow-soft transition-smooth hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        <TimetableGrid
          getCellData={getCellData}
          visualizationMode={visualizationMode}
          clashingSlots={clashResult.clashingSlots}
          onEditCourse={handleEditCourse}
        />
      </main>

      <Footer />

      <CourseSidebar
        courses={courses}
        onEditCourse={handleEditCourse}
        onRemoveCourse={handleDeleteCourse}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourseId(null);
        }}
        onSave={handleSaveCourse}
        existingCourse={
          selectedCourseId ? courses[selectedCourseId] : undefined
        }
        existingCourses={Object.values(courses)}
      />
    </div>
  );
}
