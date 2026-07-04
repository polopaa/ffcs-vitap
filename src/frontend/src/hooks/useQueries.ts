import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AdminAnalyticsResponse, AnalyticsEvent } from "../backend";

// Get full admin analytics data
function useGetAdminAnalytics() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<AdminAnalyticsResponse>({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdminAnalytics("admin123");
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Individual analytics queries derived from admin analytics
export function useGetTotalSessions() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.totalSessions,
    isLoading,
    error,
  };
}

export function useGetTotalCourses() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.totalCourses,
    isLoading,
    error,
  };
}

export function useGetAverageSlotsPerSession() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.averageSlotsPerSession,
    isLoading,
    error,
  };
}

export function useGetSlotPopularity() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.slotPopularity,
    isLoading,
    error,
  };
}

export function useGetDailyUsage() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.dailyUsage,
    isLoading,
    error,
  };
}

export function useGetRecentActivity(limit = 20) {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.recentActivity.slice(0, limit),
    isLoading,
    error,
  };
}

export function useGetClashFrequency() {
  const { data, isLoading, error } = useGetAdminAnalytics();

  return {
    data: data?.dayAwareClashFrequency,
    isLoading,
    error,
  };
}

// Analytics Mutations
export function useTrackEvent() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: AnalyticsEvent) => {
      if (!actor) throw new Error("Actor not available");
      return actor.trackEvent(event);
    },
    onSuccess: () => {
      // Invalidate admin analytics query to refresh all data
      queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
    },
  });
}
