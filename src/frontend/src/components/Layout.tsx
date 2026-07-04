import { Toaster } from "@/components/ui/sonner";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react"

/**
 * Reusable application shell.
 *
 * Wraps every routed page in the global provider stack that previously lived
 * in `App.tsx`'s `RootComponent`:
 *
 *   <AnalyticsProvider>
 *     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *       {children}
 *       <Toaster />
 *     </ThemeProvider>
 *   </AnalyticsProvider>
 *
 * The Layout is intentionally free of page-specific UI (no Header / Footer —
 * those belong to individual pages such as `TimetableApp`). Its only job is
 * the global provider shell, so any route rendered into the router's
 * `<Outlet />` inherits analytics, theme, and toasts uniformly.
 *
 * `App.tsx`'s `RootComponent` renders `<Layout><Outlet /></Layout>`, making
 * the root route the layout and every child route (index, `/admin-insights`,
 * `/creator`) render inside it.
 */

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <AnalyticsProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
      <Analytics/>
    </AnalyticsProvider>
  );
}

export default Layout;
