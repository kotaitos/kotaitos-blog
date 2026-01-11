import type { GitHubEvent, GitHubProfileData, GitHubRepo } from "./types";

export function formatGitHubEventType(
  type: string,
  payload: GitHubEvent["payload"],
) {
  switch (type) {
    case "PushEvent":
      return "PUSH";
    case "PullRequestEvent":
      return payload.action === "closed"
        ? "PR MERGED"
        : `PR ${payload.action?.toUpperCase()}`;
    case "CreateEvent":
      return "CREATE";
    case "IssuesEvent":
      return `ISSUE ${payload.action?.toUpperCase()}`;
    case "WatchEvent":
      return "STAR";
    case "ForkEvent":
      return "FORK";
    case "ReleaseEvent":
      return "RELEASE";
    default:
      return type.replace("Event", "").toUpperCase();
  }
}

export function getGitHubEventDetails(event: GitHubEvent) {
  switch (event.type) {
    case "PushEvent":
      return (
        event.payload.commits?.[0]?.message ||
        event.payload.ref?.replace("refs/heads/", "") ||
        ""
      );
    case "PullRequestEvent":
      return event.payload.pull_request?.title || "";
    case "IssuesEvent":
      return event.payload.issue?.title || "";
    case "ReleaseEvent":
      return event.payload.release?.tag_name || "";
    default:
      return "";
  }
}

export async function getGitHubActivity(page = 1): Promise<GitHubEvent[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/kotaitos/events?per_page=30&page=${page}`,
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "kotaitos-blog-v1",
        },
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return [];
  }
}

export async function getGitHubProfile(
  username: string,
): Promise<GitHubProfileData | null> {
  try {
    const [userRes, reposRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "kotaitos-blog-v1" },
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
        {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "kotaitos-blog-v1" },
        },
      ),
      fetch(`https://api.github.com/search/commits?q=author:${username}`, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "kotaitos-blog-v1",
          Accept: "application/vnd.github.cloak-preview",
        },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) return null;

    const user = await userRes.json();
    const repos: GitHubRepo[] = await reposRes.json();
    const commitsData = commitsRes.ok
      ? await commitsRes.json()
      : { total_count: 0 };

    // Stats
    const totalStars = repos.reduce(
      (acc, repo) => acc + repo.stargazers_count,
      0,
    );

    // Language Stats
    const langCounts: Record<string, number> = {};
    let totalLangRepos = 0;
    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        totalLangRepos++;
      }
    }

    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        percentage: (count / totalLangRepos) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);

    return {
      stats: {
        repos: user.public_repos,
        followers: user.followers,
        stars: totalStars,
        commits: commitsData.total_count,
      },
      languages,
    };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}
