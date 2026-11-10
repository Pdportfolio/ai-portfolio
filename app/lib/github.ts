import "server-only";

import { unstable_cache } from "next/cache";
import { person, projects as manualProjects } from "./content";

const GITHUB_REVALIDATE_SECONDS = 3600;
const GITHUB_FETCH_OPTIONS = { next: { revalidate: GITHUB_REVALIDATE_SECONDS } } as const;
const PINNED_LIMIT = 6;
const RECENT_LIMIT = 6;

export type PortfolioProject = {
  title: string;
  body: string;
  github: string;
  demo: string | null;
  language: string | null;
  pushedAt: string | null;
  source: "github" | "manual";
};

export type GithubActivity = {
  name: string;
  description: string;
  url: string;
  pushedAt: string;
};

const GITHUB_LOGIN = githubLoginFromUrl(person.github);

const PINNED_QUERY = `
  query PinnedRepositories($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            pushedAt
            primaryLanguage { name }
          }
        }
      }
    }
  }
`;

type GraphQLPinnedNode = {
  name?: string;
  description?: string | null;
  url?: string;
  homepageUrl?: string | null;
  pushedAt?: string | null;
  primaryLanguage?: { name?: string | null } | null;
};

type GraphQLPinnedResponse = {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: Array<GraphQLPinnedNode | null> | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

type RestRepo = {
  name?: string;
  description?: string | null;
  html_url?: string;
  homepage?: string | null;
  language?: string | null;
  fork?: boolean;
  archived?: boolean;
  pushed_at?: string | null;
};

function githubLoginFromUrl(url: string) {
  try {
    const { pathname } = new URL(url);
    const login = pathname.split("/").filter(Boolean)[0];
    if (login) return login;
  } catch {
    // Fall through to the hardcoded public username.
  }
  return "prakharpd";
}

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub is not configured.");
  }
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "ai-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function normalizeRepoUrl(url: string) {
  return url.replace(/\/+$/, "").toLowerCase();
}

function asProject(input: {
  name: string;
  description?: string | null;
  url: string;
  homepageUrl?: string | null;
  language?: string | null;
  pushedAt?: string | null;
  source: "github" | "manual";
}): PortfolioProject {
  const description = input.description?.trim() ?? "";
  const homepage = input.homepageUrl?.trim() || null;
  return {
    title: input.name,
    body: description,
    github: input.url,
    demo: description ? homepage : null,
    language: input.language?.trim() || null,
    pushedAt: input.pushedAt ?? null,
    source: input.source,
  };
}

function manualFallback(): PortfolioProject[] {
  return manualProjects.map((project) =>
    asProject({
      name: project.title,
      description: project.body,
      url: project.github,
      homepageUrl: project.demo,
      language: null,
      pushedAt: null,
      source: "manual",
    }),
  );
}

function mergeManualExtras(live: PortfolioProject[]): PortfolioProject[] {
  const manuals = manualFallback();
  const manualByUrl = new Map(manuals.map((project) => [normalizeRepoUrl(project.github), project]));
  const seen = new Set<string>();
  const merged = live.map((project) => {
    const key = normalizeRepoUrl(project.github);
    seen.add(key);
    const manual = manualByUrl.get(key);
    if (!manual?.body) return project;
    return { ...project, body: manual.body };
  });
  const extras = manuals.filter((project) => !seen.has(normalizeRepoUrl(project.github)));
  return extras.length ? [...merged, ...extras] : merged;
}

async function githubJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...githubHeaders(),
      ...(init?.headers ?? {}),
    },
    ...GITHUB_FETCH_OPTIONS,
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}).`);
  }

  return (await response.json()) as T;
}

async function fetchPinnedProjects(): Promise<PortfolioProject[]> {
  const payload = await githubJson<GraphQLPinnedResponse>("https://api.github.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PINNED_QUERY,
      variables: { login: GITHUB_LOGIN },
    }),
  });

  if (payload.errors?.length) {
    throw new Error("GitHub pinned query failed.");
  }

  const nodes = payload.data?.user?.pinnedItems?.nodes ?? [];
  return nodes.flatMap((node) => {
    if (!node?.name || !node.url) return [];
    return [
      asProject({
        name: node.name,
        description: node.description,
        url: node.url,
        homepageUrl: node.homepageUrl,
        language: node.primaryLanguage?.name,
        pushedAt: node.pushedAt,
        source: "github",
      }),
    ];
  });
}

function fromRestRepo(repo: RestRepo): PortfolioProject | null {
  if (!repo.name || !repo.html_url || repo.fork || repo.archived) return null;
  return asProject({
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    homepageUrl: repo.homepage,
    language: repo.language,
    pushedAt: repo.pushed_at,
    source: "github",
  });
}

async function fetchRecentPublicRepos(limit: number): Promise<PortfolioProject[]> {
  const repos = await githubJson<RestRepo[]>(
    `https://api.github.com/users/${encodeURIComponent(GITHUB_LOGIN)}/repos?type=owner&sort=pushed&direction=desc&per_page=30`,
  );

  return repos.map(fromRestRepo).filter((repo): repo is PortfolioProject => repo !== null).slice(0, limit);
}

async function loadProjects(): Promise<PortfolioProject[]> {
  try {
    const pinned = await fetchPinnedProjects();
    const live = pinned.length ? pinned : await fetchRecentPublicRepos(PINNED_LIMIT);
    if (!live.length) return manualFallback();
    const merged = mergeManualExtras(live);
    console.info(
      `GitHub projects loaded: ${merged.filter((project) => project.source === "github").length} live, ${merged.filter((project) => project.source === "manual").length} manual.`,
    );
    return merged;
  } catch (error) {
    console.error("GitHub projects unavailable, using manual fallback.", error);
    return manualFallback();
  }
}

async function loadRecentActivity(): Promise<GithubActivity[]> {
  try {
    const repos = await fetchRecentPublicRepos(RECENT_LIMIT);
    return repos
      .filter((repo) => repo.pushedAt)
      .map((repo) => ({
        name: repo.title,
        description: repo.body,
        url: repo.github,
        pushedAt: repo.pushedAt as string,
      }));
  } catch (error) {
    console.error("GitHub activity unavailable.", error);
    return [];
  }
}

export const getProjects = unstable_cache(loadProjects, ["github-projects-v3"], {
  revalidate: GITHUB_REVALIDATE_SECONDS,
  tags: ["github-projects"],
});

export const getRecentActivity = unstable_cache(loadRecentActivity, ["github-activity"], {
  revalidate: GITHUB_REVALIDATE_SECONDS,
  tags: ["github-projects"],
});
