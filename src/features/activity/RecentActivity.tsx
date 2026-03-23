import Link from "next/link";
import {
  formatGitHubEventType,
  getGitHubEventDetails,
} from "@/features/github/api";
import type { GitHubEvent } from "@/features/github/types";
import { getLeetCodeActivity } from "@/features/leetcode/api";
import type { UnifiedActivity } from "./types";

const ITEMS_PER_PAGE = 30;

export async function RecentActivity({ page = 1 }: { page?: number }) {
  const [githubEvents, leetcodeEvents] = await Promise.all([
    fetch("https://api.github.com/users/kotaitos/events?per_page=100&page=1", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "kotaitos-blog-v1" },
    }).then((res) => (res.ok ? res.json() : [])),
    getLeetCodeActivity(),
  ]);

  const unifiedEvents: UnifiedActivity[] = [
    ...(githubEvents as GitHubEvent[]).map((e) => ({
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

  const aggregateActivities = (
    events: UnifiedActivity[],
  ): UnifiedActivity[] => {
    if (events.length === 0) return [];

    const firstEvent = events[0] as UnifiedActivity;
    const aggregated: UnifiedActivity[] = [];
    let currentGroup: UnifiedActivity = { ...firstEvent, count: 1 };

    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      if (!event) continue;

      if (
        event.source === currentGroup.source &&
        event.title === currentGroup.title &&
        event.type === currentGroup.type &&
        event.detail === currentGroup.detail
      ) {
        currentGroup.count = (currentGroup.count || 1) + 1;
      } else {
        aggregated.push(currentGroup);
        currentGroup = { ...event, count: 1 };
      }
    }
    aggregated.push(currentGroup);

    return aggregated;
  };

  const allAggregatedEvents = aggregateActivities(unifiedEvents);
  const maxPages = Math.max(
    1,
    Math.ceil(allAggregatedEvents.length / ITEMS_PER_PAGE),
  );
  const currentPage = Math.max(1, Math.min(page, maxPages));

  const pagedEvents = allAggregatedEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (pagedEvents.length === 0) {
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
        {pagedEvents.map((event) => (
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
              className={`font-bold shrink-0 w-16 opacity-40 ${event.source === "LEETCODE" ? "text-yellow-500" : "text-primary"}`}
            >
              {event.source === "LEETCODE" ? "LeetCode" : "GitHub"}
            </span>
            <span
              className={`font-bold shrink-0 w-[85px] hidden md:block ${event.source === "LEETCODE" ? "text-yellow-500/70" : "text-primary/70"}`}
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
                {event.count &&
                  event.count > 1 &&
                  (event.source === "LEETCODE"
                    ? ` (${event.count} attempts)`
                    : ` (${event.count} events)`)}
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
            scroll={false}
          >
            [&lt;PREV]
          </Link>
        ) : (
          <span className="opacity-20 cursor-not-allowed">[&lt;PREV]</span>
        )}
        <span className="opacity-40 font-normal">
          {currentPage}/{maxPages}
        </span>
        {currentPage < maxPages ? (
          <Link
            href={`/?page=${currentPage + 1}`}
            className="hover:text-primary"
            scroll={false}
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
