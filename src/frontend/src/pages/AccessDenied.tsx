import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card
        className="max-w-md w-full border-border bg-card shadow-soft"
        data-ocid="access_denied.card"
      >
        <CardHeader className="text-center space-y-5 pt-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/40 text-foreground">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-display text-2xl font-semibold tracking-tight">
              Access Denied
            </CardTitle>
            <CardDescription className="tracking-wide leading-relaxed">
              You don't have permission to access this page. A valid
              authentication key is required.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-10">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
              This is a protected admin route. If you believe you should have
              access, please contact the administrator.
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="w-full gap-2 transition-smooth"
            data-ocid="access_denied.return_button"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Timetable
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
