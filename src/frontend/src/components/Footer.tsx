import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "ffcs-timetable",
  )}`;

  return (
    <footer
      data-ocid="footer.section"
      className="border-t border-border/60 bg-muted/40 py-5"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="font-body text-center text-xs text-muted-foreground md:text-left">
            © {year}. Built by a student for the students.
          </p>
          <nav className="flex items-center gap-4">
            <Link
              data-ocid="footer.creator_link"
              to="/creator"
              className="font-body text-xs font-medium text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline"
            >
              Meet the Creator
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
