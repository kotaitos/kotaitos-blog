export type UnifiedActivity = {
  id: string;
  source: "GITHUB" | "LEETCODE";
  timestamp: Date;
  type: string;
  title: string;
  detail?: string;
  link: string;
  status?: string;
};
