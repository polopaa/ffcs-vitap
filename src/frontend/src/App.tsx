import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import TimetableApp from "./components/TimetableApp";
import { AnalyticsProvider } from "./hooks/useAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import MeetTheCreator from "./pages/MeetTheCreator";

export interface Course {
  id: string;
  name: string;
  color: string;
  selectedSlots: string[]; // Selection keys (e.g., "A1", "A2::SB1", "C1", "L1", "L2")
  credit: number; // 0 for lab courses | 1 | 2 | 3 | 4 for theory — credit value of the chosen combination
  combination: string; // Raw combination string (e.g. "A1+TA1+TAA1" for theory, "L1+L2" for lab)
}

export interface CoursesData {
  [courseId: string]: Course;
}

// Root route component
function RootComponent() {
  return (
    <AnalyticsProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TimetableApp />
        <Toaster />
      </ThemeProvider>
    </AnalyticsProvider>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Admin route component
function AdminRouteComponent() {
  return <AdminDashboard />;
}

// Meet the Creator route component
function CreatorRouteComponent() {
  return <MeetTheCreator />;
}

// Admin route with key validation
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-insights",
  component: AdminRouteComponent,
});

// Meet the Creator route
const creatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/creator",
  component: CreatorRouteComponent,
});

// Create router
const routeTree = rootRoute.addChildren([adminRoute, creatorRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}

export default App;
