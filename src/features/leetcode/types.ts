export type LeetCodeSubmission = {
  timestamp: string;
  title: string;
  titleSlug: string;
  statusDisplay: string;
  lang: string;
};

export type LeetCodeBadge = {
  name: string;
};

export type LeetCodeProfileData = {
  stats: {
    easy: number;
    medium: number;
    hard: number;
    all: number;
    ranking: number;
    reputation: number;
    points: number;
  };
  badges: LeetCodeBadge[];
};
