import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";

export default function MeetTheCreator() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-subtle">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="gap-2 transition-smooth"
            data-ocid="creator.back_button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timetable
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-subtle mb-4">
              <Heart className="h-3.5 w-3.5" />
              About
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
              Meet the Creator
            </h1>
          </div>

          <Card
            className="border-border bg-card shadow-soft overflow-hidden"
            data-ocid="creator.card"
          >
            <CardHeader className="text-center pb-4 pt-10">
              <div className="flex justify-center mb-6">
                <Avatar
                  className="h-32 w-32 border-4 border-border shadow-soft transition-luxe hover:scale-105"
                  data-ocid="creator.avatar"
                >
                  <AvatarImage
                    src="/assets/generated/pom-pom-avatar-transparent.dim_200x200.png"
                    alt="Pom Pom avatar"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-foreground text-background font-display">
                    PP
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Pom Pom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <div className="text-center px-4">
                <p className="text-lg text-muted-foreground leading-relaxed tracking-wide">
                  hi I am pom pom. This website was built with relentless hard
                  work (≈ 4 prompts) and you're welcome
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 fill-foreground text-foreground" />
                  <span>and</span>
                  <a
                    href="https://caffeine.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 hover:underline transition-smooth"
                    data-ocid="creator.caffeine_link"
                  >
                    caffeine.ai
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-10 text-center">
            <Button
              onClick={() => navigate({ to: "/" })}
              size="lg"
              className="gap-2 transition-smooth"
              data-ocid="creator.start_button"
            >
              Start Building Your Timetable
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/40 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear}. Built with{" "}
            <Heart className="inline h-4 w-4 fill-foreground text-foreground" />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline transition-smooth"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
