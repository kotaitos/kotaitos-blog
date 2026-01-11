import { LeetCode } from "leetcode-query";

interface Badge {
  name: string;
}

async function getLeetCodeProfile(username: string) {
  try {
    const leetcode = new LeetCode();
    const user = await leetcode.user(username);

    if (!user || !user.matchedUser) {
      return null;
    }

    const { matchedUser } = user;
    const submitStats = matchedUser.submitStats.acSubmissionNum;
    const easy = submitStats.find((s) => s.difficulty === "Easy")?.count || 0;
    const medium =
      submitStats.find((s) => s.difficulty === "Medium")?.count || 0;
    const hard = submitStats.find((s) => s.difficulty === "Hard")?.count || 0;
    const all = submitStats.find((s) => s.difficulty === "All")?.count || 0;

    return {
      stats: {
        easy,
        medium,
        hard,
        all,
        ranking: matchedUser.profile.ranking,
        reputation: matchedUser.profile.reputation,
        points: matchedUser.contributions.points,
      },
      badges: [
        ...(matchedUser.badges as unknown as Badge[]),
        ...(matchedUser.upcomingBadges as unknown as Badge[]),
      ],
    };
  } catch (error) {
    console.error("Error fetching LeetCode profile:", error);
    return null;
  }
}

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

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="border-l border-border/50 pl-3 ml-1">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground/40 uppercase">
            <span className="font-bold text-primary/40 mr-1">BADGES:</span>
            {profile.badges.map((badge, index) => (
              <span
                key={`${badge.name}-${index}`}
                className="flex items-center gap-1"
              >
                <span>{badge.name}</span>
                {index < profile.badges.length - 1 && (
                  <span className="opacity-30">/</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
