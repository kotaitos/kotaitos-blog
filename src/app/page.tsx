import { RecentActivity } from "@/features/activity/RecentActivity";
import { GitHubProfile } from "@/features/github/GitHubProfile";
import { LeetCodeProfile } from "@/features/leetcode/LeetCodeProfile";
import { NeofetchProfile } from "@/features/profile/NeofetchProfile";
import { ZennArticles } from "@/features/zenn/ZennArticles";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-3">
          <NeofetchProfile />
          <div className="space-y-10">
            <GitHubProfile />
            <LeetCodeProfile />
            <ZennArticles />
          </div>
        </div>
        <div className="lg:col-span-2">
          <RecentActivity page={page} />
        </div>
      </div>
    </div>
  );
}
