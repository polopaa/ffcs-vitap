import { Layout } from "@/components/Layout";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import TimetableApp from "./components/TimetableApp";
import AdminDashboard from "./pages/AdminDashboard";
import MeetTheCreator from "./pages/MeetTheCreator";

// Root route component — renders the reusable Layout shell wrapping the
// router Outlet so every child route (index, /admin-insights, /creator)
// inherits AnalyticsProvider, ThemeProvider, and Toaster uniformly.
function RootComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Index route — the timetable builder is the home page, rendered inside the
// Layout's Outlet instead of being hardcoded as the root body.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TimetableApp,
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
const routeTree = rootRoute.addChildren([indexRoute, adminRoute, creatorRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
