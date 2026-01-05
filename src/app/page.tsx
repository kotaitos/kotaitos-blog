import { RecentActivity } from "@/features/github/RecentActivity";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <RecentActivity page={page} />
    </div>
  );
}
