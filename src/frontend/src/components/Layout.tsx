import { Toaster } from "@/components/ui/sonner";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <AnalyticsProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </AnalyticsProvider>

      <Analytics />
    </>
  );
}

export default Layout;