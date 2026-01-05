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
  };
};

async function getGitHubActivity(): Promise<GitHubEvent[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/kotaitos/events?per_page=10",
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

      return payload.action === "closed" ? "PR MERGED" : `PR ${payload.action?.toUpperCase()}`;

    case "CreateEvent":

      return "CREATE";

    case "IssuesEvent":

      return `ISSUE ${payload.action?.toUpperCase()}`;

    case "WatchEvent":

      return "STAR";

    case "ForkEvent":

      return "FORK";

    default:

      return type.replace("Event", "").toUpperCase();

  }

}



function getEventDetails(event: GitHubEvent) {

  switch (event.type) {

    case "PushEvent":

      return event.payload.commits?.[0]?.message || "No commit message";

    case "PullRequestEvent":

      return event.payload.pull_request?.title || "";

    case "IssuesEvent":

      return event.payload.issue?.title || "";

    default:

      return "";

  }

}



export async function RecentActivity() {

  const allEvents = await getGitHubActivity();

  const events = allEvents.slice(0, 15); // Display latest 15 items for a log feel



  if (events.length === 0) {

    return (

      <div className="w-full max-w-3xl mx-auto mt-8 font-mono">

        <h2 className="text-sm font-bold mb-2 uppercase tracking-tighter opacity-50">

          &gt; System.Activity.Recent

        </h2>

        <p className="text-xs text-muted-foreground">No logs found.</p>

      </div>

    );

  }



  return (

    <div className="w-full max-w-4xl mx-auto mt-8 font-mono">

      <h2 className="text-sm font-bold mb-4 uppercase tracking-tighter opacity-50">

        &gt; Recent GitHub Logs

      </h2>

      <div className="space-y-0.5 border-l border-border pl-4 ml-2">

        {events.map((event) => (

          <div

            key={event.id}

            className="text-[11px] leading-relaxed flex items-baseline gap-3 group"

          >

            <span className="text-muted-foreground shrink-0 tabular-nums opacity-60">

              [{new Date(event.created_at).toLocaleString("en-US", {

                month: "short",

                day: "2-digit",

                hour: "2-digit",

                minute: "2-digit",

                hour12: false,

              })}]

            </span>

            <span className="font-bold shrink-0 text-primary/80 min-w-[90px]">

              {formatEventType(event.type, event.payload)}

            </span>


            <div className="flex-1 truncate flex items-baseline gap-2">
              <Link
                href={`https://github.com/${event.repo.name}`}
                target="_blank"
                className="font-bold hover:text-primary transition-colors shrink-0"
              >
                {event.repo.name}
              </Link>
              <span className="text-muted-foreground truncate opacity-60 group-hover:opacity-100 transition-opacity">
                - {getEventDetails(event)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
