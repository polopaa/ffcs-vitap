import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnalyticsEventType } from "../backend";
import { useTrackEvent } from "./useQueries";

interface AnalyticsContextType {
  sessionId: string;
  trackSessionStart: () => void;
  trackCourseCreated: (courseCount: number) => void;
  trackSlotSelected: (slotCount: number) => void;
  trackCourseRemoved: (courseCount: number) => void;
  trackReset: () => void;
  trackClashDetected: (clashCount: number, affectedSlots: string[]) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

const SESSION_ID_KEY = "timetable_session_id";
const SESSION_START_KEY = "timetable_session_start";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return sessionId;
}

function getSessionDuration(): number {
  const startTime = sessionStorage.getItem(SESSION_START_KEY);
  if (!startTime) return 0;
  return Date.now() - Number.parseInt(startTime, 10);
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const { mutate: trackEvent } = useTrackEvent();

  const trackSessionStart = useCallback(() => {
    trackEvent({
      sessionId,
      timestamp: BigInt(Date.now() * 1000000), // Convert to nanoseconds
      eventType: AnalyticsEventType.sessionStart,
      slotCount: BigInt(0),
      courseCount: BigInt(0),
      duration: BigInt(0),
      clashCount: BigInt(0),
      affectedSlots: [],
      daySpecific: true,
    });
  }, [sessionId, trackEvent]);

  const trackCourseCreated = useCallback(
    (courseCount: number) => {
      trackEvent({
        sessionId,
        timestamp: BigInt(Date.now() * 1000000),
        eventType: AnalyticsEventType.courseCreated,
        slotCount: BigInt(0),
        courseCount: BigInt(courseCount),
        duration: BigInt(getSessionDuration()),
        clashCount: BigInt(0),
        affectedSlots: [],
        daySpecific: true,
      });
    },
    [sessionId, trackEvent],
  );

  const trackSlotSelected = useCallback(
    (slotCount: number) => {
      trackEvent({
        sessionId,
        timestamp: BigInt(Date.now() * 1000000),
        eventType: AnalyticsEventType.slotSelected,
        slotCount: BigInt(slotCount),
        courseCount: BigInt(0),
        duration: BigInt(getSessionDuration()),
        clashCount: BigInt(0),
        affectedSlots: [],
        daySpecific: true,
      });
    },
    [sessionId, trackEvent],
  );

  const trackCourseRemoved = useCallback(
    (courseCount: number) => {
      trackEvent({
        sessionId,
        timestamp: BigInt(Date.now() * 1000000),
        eventType: AnalyticsEventType.courseRemoved,
        slotCount: BigInt(0),
        courseCount: BigInt(courseCount),
        duration: BigInt(getSessionDuration()),
        clashCount: BigInt(0),
        affectedSlots: [],
        daySpecific: true,
      });
    },
    [sessionId, trackEvent],
  );

  const trackReset = useCallback(() => {
    trackEvent({
      sessionId,
      timestamp: BigInt(Date.now() * 1000000),
      eventType: AnalyticsEventType.reset,
      slotCount: BigInt(0),
      courseCount: BigInt(0),
      duration: BigInt(getSessionDuration()),
      clashCount: BigInt(0),
      affectedSlots: [],
      daySpecific: true,
    });
  }, [sessionId, trackEvent]);

  const trackClashDetected = useCallback(
    (clashCount: number, affectedSlots: string[]) => {
      trackEvent({
        sessionId,
        timestamp: BigInt(Date.now() * 1000000),
        eventType: AnalyticsEventType.clashDetected,
        slotCount: BigInt(0),
        courseCount: BigInt(0),
        duration: BigInt(getSessionDuration()),
        clashCount: BigInt(clashCount),
        affectedSlots,
        daySpecific: true, // All clashes are now day-specific
      });
    },
    [sessionId, trackEvent],
  );

  // Track session start on mount
  useEffect(() => {
    trackSessionStart();
  }, [trackSessionStart]);

  return (
    <AnalyticsContext.Provider
      value={{
        sessionId,
        trackSessionStart,
        trackCourseCreated,
        trackSlotSelected,
        trackCourseRemoved,
        trackReset,
        trackClashDetected,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}
