type Repository = {
  language: string | null;
  updated_at: string;
};

async function getLanguageStats() {
  try {
    // Fetch recently updated repositories
    const res = await fetch(
      "https://api.github.com/users/kotaitos/repos?sort=updated&per_page=100",
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "kotaitos-blog-v1",
        },
      },
    );

    if (!res.ok) {
      return [];
    }

    const repos: Repository[] = await res.json();

    // Count languages
    const stats: Record<string, number> = {};
    let total = 0;

    for (const repo of repos) {
      if (repo.language) {
        stats[repo.language] = (stats[repo.language] || 0) + 1;
        total++;
      }
    }

    // Convert to array and sort
    return Object.entries(stats)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 languages
  } catch (error) {
    console.error("Error fetching language stats:", error);
    return [];
  }
}

function ProgressBar({ percentage }: { percentage: number }) {
  const width = 20; // Number of characters
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  return (
    <span className="text-muted-foreground/40">
      [<span className="text-primary">{Array(filled).fill("#").join("")}</span>
      {Array(empty).fill("-").join("")}]
    </span>
  );
}

export async function LanguageStats() {
  const languages = await getLanguageStats();

  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="w-full font-mono mt-6">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40">
        &gt; GitHub.Stats.Languages
      </h2>
      <div className="space-y-1 border-l border-border/50 pl-3 ml-1">
        {languages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-3 text-[11px]">
            <span className="w-24 font-bold truncate shrink-0 text-primary/80">
              {lang.name}
            </span>
            <ProgressBar percentage={lang.percentage} />
            <span className="text-muted-foreground tabular-nums opacity-60">
              {lang.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 ml-4 text-[10px] text-muted-foreground/40">
        <p>Based on recently updated repositories</p>
      </div>
    </div>
  );
}
