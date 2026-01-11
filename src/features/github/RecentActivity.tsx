import { LeetCode } from "leetcode-query";
import Link from "next/link";

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload: {
    action?: string;
    commits?: Array<{
      message: string;
    }>;
    issue?: {
      title: string;
    };
    pull_request?: {
      title: string;
    };
    ref?: string;
    release?: {
      tag_name: string;
    };
  };
};

type LeetCodeSubmission = {
  timestamp: string;
  title: string;
  titleSlug: string;
  statusDisplay: string;
  lang: string;
};

type UnifiedActivity = {
  id: string;
  source: "GITHUB" | "LEETCODE";
  timestamp: Date;
  type: string;
  title: string;
  detail?: string;
  link: string;
  status?: string;
};

const MAX_PAGES = 5;

async function getGitHubActivity(page = 1): Promise<GitHubEvent[]> {
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

async function getLeetCodeActivity(): Promise<LeetCodeSubmission[]> {
  try {
    const leetcode = new LeetCode();
    const submissions = await leetcode.recent_submissions("noai-kotaitos");
    return (submissions || []) as unknown as LeetCodeSubmission[];
  } catch (error) {
    console.error("Error fetching LeetCode activity:", error);
    return [];
  }
}

function formatGitHubEventType(type: string, payload: GitHubEvent["payload"]) {
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

function getGitHubEventDetails(event: GitHubEvent) {
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

export async function RecentActivity({ page = 1 }: { page?: number }) {
  const currentPage = Math.max(1, Math.min(page, MAX_PAGES));

  const [githubEvents, leetcodeEvents] = await Promise.all([
    getGitHubActivity(currentPage),
    currentPage === 1 ? getLeetCodeActivity() : Promise.resolve([]),
  ]);

  const unifiedEvents: UnifiedActivity[] = [
    ...githubEvents.map((e) => ({
      id: e.id,
      source: "GITHUB" as const,
      timestamp: new Date(e.created_at),
      type: formatGitHubEventType(e.type, e.payload),
      title: e.repo.name.split("/")[1] || e.repo.name,
      detail: getGitHubEventDetails(e),
      link: `https://github.com/${e.repo.name}`,
    })),
    ...leetcodeEvents.map((e, i) => ({
      id: `lc-${e.timestamp}-${i}`,
      source: "LEETCODE" as const,
      timestamp: new Date(Number(e.timestamp) * 1000),
      type: "SOLVED",
      title: e.title,
      detail: e.lang,
      status: e.statusDisplay,
      link: `https://leetcode.com/problems/${e.titleSlug}/`,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (unifiedEvents.length === 0) {
    return (
      <div className="w-full mt-6 font-mono">
        <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
          &gt; Activity.Recent --limit=30
        </h2>
        <div className="border-l border-border/50 pl-3 ml-1 text-muted-foreground/50 text-[10.5px]">
          No logs found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 font-mono">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
        &gt; Activity.Recent --limit=30
      </h2>
      <div className="space-y-0.5 border-l border-border/50 pl-3 ml-1">
        {unifiedEvents.map((event) => (
          <div
            key={event.id}
            className="text-[10.5px] leading-tight flex items-baseline gap-2 group"
          >
            <span className="text-muted-foreground shrink-0 tabular-nums opacity-50 w-24">
              [
              {event.timestamp.toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              ]
            </span>
            <span
              className={`font-bold shrink-0 w-16 text-[9px] opacity-40 ${event.source === "LEETCODE" ? "text-yellow-500" : "text-primary"}`}
            >
              {event.source === "LEETCODE" ? "LeetCode" : "GitHub"}
            </span>
            <span
              className={`font-bold shrink-0 w-[65px] ${event.source === "LEETCODE" ? "text-yellow-500/70" : "text-primary/70"}`}
            >
              {event.type}
            </span>
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <Link
                href={event.link}
                target="_blank"
                className="font-bold hover:text-primary transition-colors shrink-0 truncate max-w-[240px]"
              >
                {event.title}
              </Link>
              <span className="text-muted-foreground truncate opacity-40 group-hover:opacity-100 transition-opacity">
                {event.detail && `- ${event.detail}`}
                {event.status &&
                  event.status !== "Accepted" &&
                  ` (${event.status})`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground/60 select-none">
        {currentPage > 1 ? (
          <Link
            href={`/?page=${currentPage - 1}`}
            className="hover:text-primary"
          >
            [&lt;PREV]
          </Link>
        ) : (
          <span className="opacity-20 cursor-not-allowed">[&lt;PREV]</span>
        )}
        <span className="opacity-40 font-normal">
          {currentPage}/{MAX_PAGES}
        </span>
        {currentPage < MAX_PAGES ? (
          <Link
            href={`/?page=${currentPage + 1}`}
            className="hover:text-primary"
          >
            [NEXT&gt;]
          </Link>
        ) : (
          <span className="opacity-20 cursor-not-allowed">[NEXT&gt;]</span>
        )}
      </div>
    </div>
  );
}
