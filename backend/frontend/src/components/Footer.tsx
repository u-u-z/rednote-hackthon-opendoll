export function Footer({ maxWidth = "max-w-7xl" }: { maxWidth?: string }) {
  return (
    <footer className="border-t border-border py-6 mt-auto">
      <div
        className={`${maxWidth} mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground`}
      >
        <span>
          开源人形 &mdash;{" "}
          <a
            href="https://kigland.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            Kigland
          </a>
        </span>
        <div className="flex items-center gap-3 text-xs">
          <a
            href="/skill.md"
            className="hover:text-primary transition-colors"
          >
            Skill
          </a>
          <a
            href="/skill.json"
            className="hover:text-primary transition-colors"
          >
            API
          </a>
          <span>Hackathon Demo</span>
        </div>
      </div>
    </footer>
  );
}
