import { getLeetCodeProfile } from "./api";

export async function LeetCodeProfile() {
  const profile = await getLeetCodeProfile("noai-kotaitos");

  if (!profile) return null;

  return (
    <div className="font-mono mt-6">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
        &gt; LeetCode.Profile.Fetch --user=noai-kotaitos
      </h2>

      {/* Stats Grid */}
      <div className="border-l border-border/50 pl-3 ml-1 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4 text-[10.5px] text-muted-foreground/60">
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">EASY:</span>
            <span>{profile.stats.easy}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">MEDIUM:</span>
            <span>{profile.stats.medium}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">HARD:</span>
            <span>{profile.stats.hard}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">TOTAL:</span>
            <span>{profile.stats.all}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">RANK:</span>
            <span>{profile.stats.ranking.toLocaleString()}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">POINTS:</span>
            <span>{profile.stats.points}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold text-primary/80">REPUTE:</span>
            <span>{profile.stats.reputation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
