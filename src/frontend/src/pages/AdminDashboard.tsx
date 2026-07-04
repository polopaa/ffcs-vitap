import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Clock,
  Grid3x3,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetAverageSlotsPerSession,
  useGetClashFrequency,
  useGetDailyUsage,
  useGetRecentActivity,
  useGetSlotPopularity,
  useGetTotalCourses,
  useGetTotalSessions,
} from "../hooks/useQueries";
import AccessDenied from "./AccessDenied";

const TOOLTIP_STYLE = {
  backgroundColor: "oklch(var(--popover))",
  border: "1px solid oklch(var(--border))",
  borderRadius: "0.75rem",
  color: "oklch(var(--popover-foreground))",
  fontSize: "0.8125rem",
  boxShadow: "0 8px 24px -8px oklch(0 0 0 / 0.18)",
} as const;

const AXIS_PROPS = {
  tick: { fill: "oklch(var(--muted-foreground))", fontSize: 12 },
  axisLine: { stroke: "oklch(var(--border))" },
  tickLine: { stroke: "oklch(var(--border))" },
} as const;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isValidated, setIsValidated] = useState(false);
  const SECRET_KEY = "admin123";

  const { data: totalSessions, isLoading: loadingSessions } =
    useGetTotalSessions();
  const { data: totalCourses, isLoading: loadingCourses } =
    useGetTotalCourses();
  const { data: avgSlots, isLoading: loadingAvgSlots } =
    useGetAverageSlotsPerSession();
  const { data: slotPopularity, isLoading: loadingSlotPop } =
    useGetSlotPopularity();
  const { data: dailyUsage, isLoading: loadingDailyUsage } = useGetDailyUsage();
  const { data: recentActivity, isLoading: loadingActivity } =
    useGetRecentActivity(20);
  const { data: clashFrequency, isLoading: loadingClashFreq } =
    useGetClashFrequency();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    setIsValidated(key === SECRET_KEY);
  }, []);

  useEffect(() => {
    if (isValidated) {
      document.title = "Admin Insights - Timetable Analytics";
    }
    return () => {
      document.title = "Interactive Timetable";
    };
  }, [isValidated]);

  if (!isValidated) {
    return <AccessDenied />;
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventType = (eventType: unknown): string => {
    if (typeof eventType === "object" && eventType !== null) {
      const keys = Object.keys(eventType as Record<string, unknown>);
      if (keys.length > 0) {
        return keys[0].replace(/([A-Z])/g, " $1").trim();
      }
    }
    return String(eventType)
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  const slotPopularityData =
    slotPopularity
      ?.map(([slot, count]) => ({ slot, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) || [];

  const dailyUsageData =
    dailyUsage
      ?.map(([date, count]) => ({
        date: new Date(Number(date) / 1000000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: Number(count),
      }))
      .slice(-7) || [];

  const clashFrequencyData =
    clashFrequency
      ?.map(([slot, count]) => ({ slot, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) || [];

  const uniqueUsers = totalSessions ? Number(totalSessions) : 0;
  const totalClashes =
    clashFrequency?.reduce((sum, [, count]) => sum + Number(count), 0) || 0;

  const summaryCards = [
    {
      label: "Total Sessions",
      value: Number(totalSessions || 0),
      hint: "Unique user sessions",
      icon: Activity,
      loading: loadingSessions,
      dataOcid: "admin.summary.sessions",
    },
    {
      label: "Unique Users",
      value: uniqueUsers,
      hint: "By session ID",
      icon: Users,
      loading: loadingSessions,
      dataOcid: "admin.summary.users",
    },
    {
      label: "Total Courses",
      value: Number(totalCourses || 0),
      hint: "Courses created site-wide",
      icon: BookOpen,
      loading: loadingCourses,
      dataOcid: "admin.summary.courses",
    },
    {
      label: "Avg Slots/Session",
      value: Number(avgSlots || 0),
      hint: "Average per session",
      icon: TrendingUp,
      loading: loadingAvgSlots,
      dataOcid: "admin.summary.avg_slots",
    },
    {
      label: "Same-Day Clashes",
      value: totalClashes,
      hint: "Day-specific conflicts",
      icon: AlertTriangle,
      loading: loadingClashFreq,
      dataOcid: "admin.summary.clashes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-subtle">
              <Grid3x3 className="h-3.5 w-3.5" />
              Admin
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Admin Insights
            </h1>
            <p className="text-muted-foreground tracking-wide max-w-xl">
              Site-wide analytics dashboard for the timetable application.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="gap-2 transition-smooth"
            data-ocid="admin.back_button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timetable
          </Button>
        </div>

        {/* Summary Cards */}
        <div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-5 mb-10"
          data-ocid="admin.summary.section"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                data-ocid={card.dataOcid}
                className="group border-border bg-card shadow-subtle transition-luxe hover:shadow-soft hover:-translate-y-0.5"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground transition-smooth group-hover:bg-foreground group-hover:text-background">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {card.loading ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <div className="font-display text-3xl font-semibold tracking-tight tabular-nums">
                      {card.value}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 tracking-wide">
                    {card.hint}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div
          className="grid gap-5 md:grid-cols-2 mb-6"
          data-ocid="admin.charts.section"
        >
          {/* Slot Popularity Chart */}
          <Card
            className="border-border bg-card shadow-subtle"
            data-ocid="admin.slot_popularity.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                <BarChart3 className="h-5 w-5" />
                Slot Popularity
              </CardTitle>
              <CardDescription className="tracking-wide">
                Top 10 most selected time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSlotPop ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : slotPopularityData.length === 0 ? (
                <div
                  className="h-[300px] flex items-center justify-center text-sm text-muted-foreground"
                  data-ocid="admin.slot_popularity.empty_state"
                >
                  No slot data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={slotPopularityData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="oklch(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis dataKey="slot" {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ fill: "oklch(var(--muted) / 0.5)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="oklch(var(--foreground))"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Daily Usage Chart */}
          <Card
            className="border-border bg-card shadow-subtle"
            data-ocid="admin.daily_usage.card"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                <Clock className="h-5 w-5" />
                Daily Usage
              </CardTitle>
              <CardDescription className="tracking-wide">
                Course creation activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDailyUsage ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : dailyUsageData.length === 0 ? (
                <div
                  className="h-[300px] flex items-center justify-center text-sm text-muted-foreground"
                  data-ocid="admin.daily_usage.empty_state"
                >
                  No daily usage data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dailyUsageData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="oklch(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis dataKey="date" {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ stroke: "oklch(var(--border))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="oklch(var(--foreground))"
                      strokeWidth={2.5}
                      dot={{
                        fill: "oklch(var(--background))",
                        stroke: "oklch(var(--foreground))",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        fill: "oklch(var(--foreground))",
                        stroke: "oklch(var(--background))",
                        strokeWidth: 2,
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clash Frequency Chart */}
        <Card
          className="border-border bg-card shadow-subtle mb-6"
          data-ocid="admin.clash_frequency.card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
              <AlertTriangle className="h-5 w-5" />
              Same-Day Clash Frequency
            </CardTitle>
            <CardDescription className="tracking-wide">
              Most common day-specific time conflicts by slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClashFreq ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : clashFrequencyData.length === 0 ? (
              <div
                className="h-[300px] flex items-center justify-center text-sm text-muted-foreground"
                data-ocid="admin.clash_frequency.empty_state"
              >
                No clash data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={clashFrequencyData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="oklch(var(--border))"
                    opacity={0.6}
                  />
                  <XAxis dataKey="slot" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "oklch(var(--muted) / 0.5)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(var(--foreground))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card
          className="border-border bg-card shadow-subtle"
          data-ocid="admin.recent_activity.card"
        >
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold tracking-tight">
              Recent Activity
            </CardTitle>
            <CardDescription className="tracking-wide">
              Last 20 user interactions across all sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={`activity-skeleton-row-${i + 1}`}
                    className="h-14 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <div
                className="text-center py-10 text-sm text-muted-foreground"
                data-ocid="admin.recent_activity.empty_state"
              >
                No interactions recorded yet
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((event, index) => (
                  <div
                    key={`${event.sessionId}-${index}`}
                    data-ocid={`admin.recent_activity.item.${index + 1}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-smooth hover:bg-muted/40 hover:border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                      <div className="min-w-0">
                        <span className="font-medium capitalize tracking-tight">
                          {formatEventType(event.eventType)}
                        </span>
                        {event.slotCount > 0 && (
                          <span className="text-sm text-muted-foreground ml-2 tabular-nums">
                            ({Number(event.slotCount)} slots)
                          </span>
                        )}
                        {event.courseCount > 0 && (
                          <span className="text-sm text-muted-foreground ml-2 tabular-nums">
                            ({Number(event.courseCount)} courses)
                          </span>
                        )}
                        {event.clashCount > 0 && (
                          <span className="text-sm text-foreground ml-2 font-semibold tabular-nums">
                            ({Number(event.clashCount)} same-day clashes)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tracking-tight whitespace-nowrap font-mono">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
            <strong className="font-semibold text-foreground">Note:</strong>{" "}
            Analytics data is aggregated from all users across the site and
            stored on the Internet Computer blockchain. This dashboard provides
            read-only access to site-wide usage insights including day-specific
            clash detection patterns (theory-lab conflicts only detected when on
            the same day).
          </p>
        </div>
      </div>
    </div>
  );
}
