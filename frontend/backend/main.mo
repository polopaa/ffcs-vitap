import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";

actor {
  public type AnalyticsEvent = {
    sessionId : Text;
    timestamp : Time.Time;
    eventType : AnalyticsEventType;
    slotCount : Nat;
    courseCount : Nat;
    duration : Nat;
    clashCount : Nat;
    affectedSlots : [Text];
    daySpecific : Bool;
  };

  public type AnalyticsEventType = {
    #sessionStart;
    #courseCreated;
    #slotSelected;
    #courseRemoved;
    #reset;
    #clashDetected;
  };

  public type AdminAnalyticsResponse = {
    totalSessions : Nat;
    uniqueUsers : Nat;
    totalCourses : Nat;
    averageSlotsPerSession : Nat;
    slotPopularity : [(Text, Nat)];
    dailyUsage : [(Text, Nat)];
    recentActivity : [AnalyticsEvent];
    dayAwareClashFrequency : [(Text, Nat)];
  };

  public type UserProfile = {
    name : Text;
  };

  public type TimetableSlot = {
    id : Text;
    timePeriod : Nat;
    day : Nat;
  };

  var analyticsEvents = List.empty<AnalyticsEvent>();
  let sessionIds = Map.empty<Text, ()>();
  let slotPopularity = Map.empty<Text, Nat>();
  let dailyUsage = Map.empty<Text, Nat>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let clashFrequency = Map.empty<Text, Nat>();
  let timetableSlots = Map.empty<Text, TimetableSlot>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState, null);
  include MixinViews();

  // Public query functions for reference data - accessible to all users including guests
  public query ({ caller }) func getTimePeriodLabel(timePeriod : Nat) : async ?Text {
    switch (timePeriod) {
      case (1) { ?"8:00–8:50" };
      case (2) { ?"9:00–9:50" };
      case (3) { ?"10:00–10:50" };
      case (4) { ?"11:00–11:50" };
      case (5) { ?"12:00–12:50" };
      case (6) { ?"2:00–2:50" };
      case (7) { ?"3:00–3:50" };
      case (8) { ?"4:00–4:50" };
      case (_) { null };
    };
  };

  public query ({ caller }) func getDayLabel(day : Nat) : async ?Text {
    switch (day) {
      case (0) { ?"TUESDAY" };
      case (1) { ?"WEDNESDAY" };
      case (2) { ?"THURSDAY" };
      case (3) { ?"FRIDAY" };
      case (4) { ?"SATURDAY" };
      case (_) { null };
    };
  };

  // Admin-only function to manage timetable slot structure
  public shared ({ caller }) func addTimetableSlot(slot : TimetableSlot) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add timetable slots");
    };
    timetableSlots.add(slot.id, slot);
  };

  // Public query functions for timetable structure - accessible to all users including guests
  public query ({ caller }) func getTimetableSlot(slotId : Text) : async ?TimetableSlot {
    timetableSlots.get(slotId);
  };

  public query ({ caller }) func getAllTimetableSlots() : async [TimetableSlot] {
    timetableSlots.values().toArray();
  };

  // User Profile Management - requires user authentication
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Analytics Event Tracking - Open to all users including guests for site-wide analytics
  public shared ({ caller }) func trackEvent(event : AnalyticsEvent) : async () {
    analyticsEvents.add(event);

    switch (event.eventType) {
      case (#sessionStart) {
        sessionIds.add(event.sessionId, ());
      };
      case (#slotSelected) {
        let currentCount = switch (slotPopularity.get(event.sessionId)) {
          case (?count) { count };
          case (null) { 0 };
        };
        slotPopularity.add(event.sessionId, currentCount + 1);
      };
      case (#courseCreated or #courseRemoved) {
        let dateKey = extractDateKey(event.timestamp);
        let currentCount = switch (dailyUsage.get(dateKey)) {
          case (?count) { count };
          case (null) { 0 };
        };
        dailyUsage.add(dateKey, currentCount + 1);
      };
      case (#clashDetected) {
        event.affectedSlots.forEach(
          func(slot) {
            let currentCount = switch (clashFrequency.get(slot)) {
              case (?count) { count };
              case (null) { 0 };
            };
            clashFrequency.add(slot, currentCount + 1);
          }
        );
      };
      case (_) {};
    };
  };

  // Admin-only analytics access
  public query ({ caller }) func getAdminAnalytics(adminKey : Text) : async AdminAnalyticsResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics data");
    };

    let totalSessions = sessionIds.size();

    let totalCourses = analyticsEvents.values().filter(
      func(e : AnalyticsEvent) : Bool {
        switch (e.eventType) {
          case (#courseCreated) { true };
          case (_) { false };
        };
      },
    ).size();

    let slotSelectedEvents = analyticsEvents.values().filter(
      func(e : AnalyticsEvent) : Bool {
        switch (e.eventType) {
          case (#slotSelected) { true };
          case (_) { false };
        };
      },
    );

    let totalSlots = slotSelectedEvents.foldLeft(
      0,
      func(acc : Nat, evt : AnalyticsEvent) : Nat {
        acc + evt.slotCount;
      },
    );
    let count = slotSelectedEvents.size();
    let averageSlotsPerSession = if (count == 0) { 0 } else { totalSlots / count };

    let reversed = analyticsEvents.reverse();
    let eventsArray = reversed.toArray();
    let recentActivityLength = Nat.min(eventsArray.size(), 20);
    let recentActivity = if (recentActivityLength == 0) {
      [];
    } else {
      Array.tabulate(
        recentActivityLength,
        func(i : Nat) : AnalyticsEvent {
          eventsArray[i];
        },
      );
    };

    {
      totalSessions;
      uniqueUsers = 0;
      totalCourses;
      averageSlotsPerSession;
      slotPopularity = slotPopularity.entries().toArray();
      dailyUsage = dailyUsage.entries().toArray();
      recentActivity;
      dayAwareClashFrequency = clashFrequency.entries().toArray();
    };
  };

  func extractDateKey(timestamp : Time.Time) : Text {
    timestamp.toText();
  };
};
