import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";

import TimetableApp from "./components/TimetableApp";
import { AnalyticsProvider } from "./hooks/useAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import MeetTheCreator from "./pages/MeetTheCreator";

export interface Course {
  id: string;
  name: string;
  color: string;
  selectedSlots: string[];
  credit: number;
  combination: string;
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

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Admin route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-insights",
  component: AdminDashboard,
});

// Creator route
const creatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/creator",
  component: MeetTheCreator,
});

// Router
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