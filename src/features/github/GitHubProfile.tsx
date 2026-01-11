import { getGitHubProfile } from "./api";

function ProgressBar({ percentage }: { percentage: number }) {
  const width = 20;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  return (
    <span className="text-muted-foreground/20 text-[10px] tabular-nums">
      [
      <span className="text-primary/60">
        {Array(filled).fill("#").join("")}
      </span>
      {Array(empty).fill("-").join("")}]
    </span>
  );
}

export async function GitHubProfile() {
  const profile = await getGitHubProfile("kotaitos");

  if (!profile) return null;

  return (
    <div className="font-mono mt-6">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
        &gt; GitHub.Profile.Fetch --user=kotaitos
      </h2>

      <div className="border-l border-border/50 pl-3 ml-1 space-y-4">
        {/* General Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-4 text-[10.5px] text-muted-foreground/60">
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">REPOS:</span>
            <span>{profile.stats.repos}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">STARS:</span>
            <span>{profile.stats.stars}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">COMMITS:</span>
            <span>{profile.stats.commits}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">FOLLOWERS:</span>
            <span>{profile.stats.followers}</span>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="space-y-1">
          {profile.languages.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center gap-3 text-[10.5px]"
            >
              <span className="w-24 font-bold truncate shrink-0 text-primary/80 uppercase">
                {lang.name}
              </span>
              <ProgressBar percentage={lang.percentage} />
              <span className="text-muted-foreground/60 tabular-nums min-w-[40px] opacity-80">
                {lang.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
