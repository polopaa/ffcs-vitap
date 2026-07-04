import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimetableSlot {
    id: string;
    day: bigint;
    timePeriod: bigint;
}
export type Time = bigint;
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface AnalyticsEvent {
    courseCount: bigint;
    duration: bigint;
    clashCount: bigint;
    slotCount: bigint;
    daySpecific: boolean;
    timestamp: Time;
    sessionId: string;
    affectedSlots: Array<string>;
    eventType: AnalyticsEventType;
}
export interface AdminAnalyticsResponse {
    averageSlotsPerSession: bigint;
    recentActivity: Array<AnalyticsEvent>;
    dayAwareClashFrequency: Array<[string, bigint]>;
    dailyUsage: Array<[string, bigint]>;
    slotPopularity: Array<[string, bigint]>;
    totalSessions: bigint;
    totalCourses: bigint;
    uniqueUsers: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface UserProfile {
    name: string;
}
export enum AnalyticsEventType {
    clashDetected = "clashDetected",
    sessionStart = "sessionStart",
    courseRemoved = "courseRemoved",
    courseCreated = "courseCreated",
    slotSelected = "slotSelected",
    reset = "reset"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTimetableSlot(slot: TimetableSlot): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAdminAnalytics(adminKey: string): Promise<AdminAnalyticsResponse>;
    getAllTimetableSlots(): Promise<Array<TimetableSlot>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDayLabel(day: bigint): Promise<string | null>;
    getTimePeriodLabel(timePeriod: bigint): Promise<string | null>;
    getTimetableSlot(slotId: string): Promise<TimetableSlot | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    trackEvent(event: AnalyticsEvent): Promise<void>;
}
