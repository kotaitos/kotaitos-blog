import { LeetCode } from "leetcode-query";
import type {
  LeetCodeBadge,
  LeetCodeProfileData,
  LeetCodeSubmission,
} from "./types";

export async function getLeetCodeActivity(): Promise<LeetCodeSubmission[]> {
  try {
    const leetcode = new LeetCode();
    const submissions = await leetcode.recent_submissions("noai-kotaitos");
    return (submissions || []) as unknown as LeetCodeSubmission[];
  } catch (error) {
    console.error("Error fetching LeetCode activity:", error);
    return [];
  }
}

export async function getLeetCodeProfile(
  username: string,
): Promise<LeetCodeProfileData | null> {
  try {
    const leetcode = new LeetCode();
    const user = await leetcode.user(username);

    if (!user || !user.matchedUser) {
      return null;
    }

    const { matchedUser } = user;
    const submitStats = matchedUser.submitStats.acSubmissionNum;
    const easy = submitStats.find((s) => s.difficulty === "Easy")?.count || 0;
    const medium =
      submitStats.find((s) => s.difficulty === "Medium")?.count || 0;
    const hard = submitStats.find((s) => s.difficulty === "Hard")?.count || 0;
    const all = submitStats.find((s) => s.difficulty === "All")?.count || 0;

    return {
      stats: {
        easy,
        medium,
        hard,
        all,
        ranking: matchedUser.profile.ranking,
        reputation: matchedUser.profile.reputation,
        points: matchedUser.contributions.points,
      },
      badges: [
        ...(matchedUser.badges as unknown as LeetCodeBadge[]),
        ...(matchedUser.upcomingBadges as unknown as LeetCodeBadge[]),
      ],
    };
  } catch (error) {
    console.error("Error fetching LeetCode profile:", error);
    return null;
  }
}
