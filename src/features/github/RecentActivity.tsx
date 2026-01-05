import Link from "next/link";

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
    url: string;
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

const MAX_PAGES = 5;

async function getGitHubActivity(page = 1): Promise<GitHubEvent[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/kotaitos/events?per_page=30&page=${page}`,
      {
        next: { revalidate: 3600 }, // Update every hour
        headers: {
          "User-Agent": "kotaitos-blog-v1", // GitHub API requires a User-Agent
        },
      },
    );

    if (!res.ok) {
      console.error(`GitHub API responded with status: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return [];
  }
}

function formatEventType(type: string, payload: GitHubEvent["payload"]) {
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

function getEventDetails(event: GitHubEvent) {
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

import { GitHubStats } from "./GitHubStats";

// ... (existing imports and types)

// ... (existing functions)

export async function RecentActivity({ page = 1 }: { page?: number }) {
  const currentPage = Math.max(1, Math.min(page, MAX_PAGES));
  const events = await getGitHubActivity(currentPage);

  if (events.length === 0) {
    return (
      <div className="w-full mt-6 font-mono">
        <GitHubStats />
        <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
          &gt; GitHub.Activity.Recent --limit=30
        </h2>
        <div className="border-l border-border/50 pl-3 ml-1 text-muted-foreground/50 text-[10.5px]">
          No logs found.
        </div>
        <div className="mt-4 flex gap-4 text-xs ml-4">
          {currentPage > 1 && (
            <Link
              href={`/?page=${currentPage - 1}`}
              className="hover:text-primary"
            >
              &lt; PREV
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 font-mono">
      <GitHubStats />
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40 text-foreground">
        &gt; GitHub.Activity.Recent --limit=30
      </h2>
      <div className="space-y-0.5 border-l border-border/50 pl-3 ml-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="text-[10.5px] leading-tight flex items-baseline gap-2 group"
          >
            <span className="text-muted-foreground shrink-0 tabular-nums opacity-50 w-24">
              [
              {new Date(event.created_at).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              ]
            </span>
            <span className="font-bold shrink-0 text-primary/70 w-[75px]">
              {formatEventType(event.type, event.payload)}
            </span>
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <Link
                href={`https://github.com/${event.repo.name}`}
                target="_blank"
                className="font-bold hover:text-primary transition-colors shrink-0 truncate max-w-[240px]"
              >
                {event.repo.name.split("/")[1] || event.repo.name}
              </Link>
              <span className="text-muted-foreground truncate opacity-40 group-hover:opacity-100 transition-opacity">
                {getEventDetails(event) && `- ${getEventDetails(event)}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground/60 select-none">
        {currentPage > 1 ? (
          <Link
            href={`/?page=${currentPage - 1}`}
            className="hover:text-primary transition-colors"
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
            className="hover:text-primary transition-colors"
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
