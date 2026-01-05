async function getGitHubStats() {
  try {
    const [userRes, reposRes, commitsRes] = await Promise.all([
      fetch("https://api.github.com/users/kotaitos", {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "kotaitos-blog-v1" },
      }),
      fetch("https://api.github.com/users/kotaitos/repos?per_page=100", {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "kotaitos-blog-v1" },
      }),
      fetch("https://api.github.com/search/commits?q=author:kotaitos", {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "kotaitos-blog-v1",
          Accept: "application/vnd.github.cloak-preview",
        },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) return null;

    const user = await userRes.json();
    const repos = await reposRes.json();
    const commitsData = commitsRes.ok
      ? await commitsRes.json()
      : { total_count: 0 };

    const totalStars = repos.reduce(
      (acc: number, repo: { stargazers_count: number }) =>
        acc + repo.stargazers_count,
      0,
    );

    return {
      repos: user.public_repos,
      followers: user.followers,
      stars: totalStars,
      commits: commitsData.total_count,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}

export async function GitHubStats() {
  const stats = await getGitHubStats();

  if (!stats) return null;

  return (
    <div className="mb-6 font-mono text-[10.5px] text-muted-foreground/60">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
        &gt; GitHub.Stats.Fetch --scope=public
      </h2>
      <div className="flex gap-4 border-b border-border/30 pb-2 mb-2 w-fit">
        <span className="flex gap-1.5">
          <span className="font-bold text-primary/80">REPOS:</span>
          <span>{stats.repos}</span>
        </span>
        <span className="flex gap-1.5">
          <span className="font-bold text-primary/80">STARS:</span>
          <span>{stats.stars}</span>
        </span>
        <span className="flex gap-1.5">
          <span className="font-bold text-primary/80">COMMITS:</span>
          <span>{stats.commits}</span>
        </span>
        <span className="flex gap-1.5">
          <span className="font-bold text-primary/80">FOLLOWERS:</span>
          <span>{stats.followers}</span>
        </span>
      </div>
    </div>
  );
}
