import { RecentActivity } from "@/features/github/RecentActivity";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RecentActivity />
    </div>
  );
}
