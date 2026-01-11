import Link from "next/link";

type ZennArticle = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
};

async function getFeed(username: string): Promise<ZennArticle[]> {
  try {
    const res = await fetch(`https://zenn.dev/${username}/feed`, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "kotaitos-blog-v1",
      },
    });
    if (!res.ok) return [];
    const text = await res.text();

    // Simple regex parsing
    const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];

    return items.map((item) => {
      // Extract CDATA if present, otherwise normal text
      const titleMatch = item.match(
        /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/,
      );
      const title = titleMatch?.[1] || "No title";

      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

      return { title, link, pubDate, source: username };
    });
  } catch (e) {
    console.error(`Error fetching Zenn feed for ${username}:`, e);
    return [];
  }
}

async function getZennArticles() {
  const [feed1, feed2] = await Promise.all([
    getFeed("kotaitos"),
    getFeed("bp_kota"),
  ]);

  const allArticles = [...feed1, ...feed2].sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  return allArticles.slice(0, 8); // Top 8 articles
}

export async function ZennArticles() {
  const articles = await getZennArticles();

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="w-full font-mono mt-6">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40">
        &gt; Activity.Writing
      </h2>
      <div className="space-y-1 border-l border-border/50 pl-3 ml-1">
        {articles.map((article) => (
          <div
            key={article.link}
            className="flex items-baseline gap-3 text-[11px] group"
          >
            <span className="text-muted-foreground shrink-0 tabular-nums opacity-60 w-24">
              [
              {new Date(article.pubDate).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
              ]
            </span>
            <span className="text-primary/60 font-bold shrink-0 w-12 uppercase text-[9px] truncate">
              {article.source}
            </span>
            <Link
              href={article.link}
              target="_blank"
              className="font-bold hover:text-primary transition-colors truncate flex-1"
            >
              {article.title}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-6 ml-4 text-[10px] text-muted-foreground/40">
        <p>Fetched from zenn.dev</p>
      </div>
    </div>
  );
}
