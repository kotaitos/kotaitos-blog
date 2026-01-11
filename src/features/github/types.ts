export type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
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
    ref?: string;
    release?: {
      tag_name: string;
    };
  };
};

export type GitHubRepo = {
  language: string | null;
  stargazers_count: number;
  updated_at: string;
};

export type GitHubProfileData = {
  stats: {
    repos: number;
    followers: number;
    stars: number;
    commits: number;
  };
  languages: Array<{
    name: string;
    percentage: number;
  }>;
};
