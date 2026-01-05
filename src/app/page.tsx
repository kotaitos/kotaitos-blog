import { LanguageStats } from "@/features/github/LanguageStats";
import { RecentActivity } from "@/features/github/RecentActivity";
import { NeofetchProfile } from "@/features/profile/NeofetchProfile";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <div className="space-y-12">
          <NeofetchProfile />
          <LanguageStats />
        </div>
        <RecentActivity page={page} />
      </div>
    </div>
  );
}
