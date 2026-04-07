import { useMutation, useQuery } from "@tanstack/react-query";
import { env } from "../config/Env";
import { AppError } from "../utils/AppError";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function resolveApiBaseUrl() {
  try {
    const api = new URL(env.apiURL);
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      api.hostname === "localhost" &&
      api.port === "3000"
    ) {
      return `${window.location.origin}/api`;
    }
  } catch {
    return env.apiURL;
  }
  return env.apiURL;
}

function getErrorCode(payload: unknown, status: number) {
  const code =
    typeof payload === "object" && payload !== null && "code" in payload
      ? (payload as { code?: unknown }).code
      : null;
  return typeof code === "string" ? code : `HTTP_${status}`;
}

async function request<TResponse, TBody = undefined>(params: {
  path: string;
  method?: HttpMethod;
  body?: TBody;
}): Promise<TResponse> {
  const baseUrl = resolveApiBaseUrl();
  const method = params.method ?? (params.body === undefined ? "GET" : "POST");
  const hasBody = params.body !== undefined && method !== "GET";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${params.path}`, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(params.body) : undefined,
      credentials: "include",
    });
  } catch (error: unknown) {
    throw new AppError({
      code: "NETWORK_ERROR",
      status: 0,
      details: { message: error instanceof Error ? error.message : String(error) },
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError({
      code: getErrorCode(payload, response.status),
      status: response.status,
      details: payload,
    });
  }

  return payload as TResponse;
}

export type CreatePostInput = {
  title: string;
  content: string;
  anonymous: boolean;
  languages: string[];
};

type CreatePostDTO = CreatePostInput;

export type PostResponse = {
  id: string;
  title: string;
  content: string;
  anonymous: boolean;
  isOwner: boolean;
  user?: { id: string; user_name: string; user_photo: string | null; seniority_id: string };
  languages: string[];
  createdAt: string;
  updatedAt?: string;
  views?: number;
};

type ApiLanguage = string | { id: string; slug: string; name: string };

type ApiPostResponse = Omit<PostResponse, "languages" | "createdAt" | "updatedAt"> & {
  languages: ApiLanguage[];
  createdAt: string | Date;
  updatedAt?: string | Date;
};

function normalizeLanguage(value: ApiLanguage): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && typeof value.name === "string") return value.name;
  if (typeof value === "object" && value !== null && typeof value.slug === "string") return value.slug;
  return null;
}

function normalizePost(raw: ApiPostResponse): PostResponse {
  const languages = Array.isArray(raw.languages)
    ? raw.languages.map(normalizeLanguage).filter((v): v is string => Boolean(v))
    : [];

  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    anonymous: raw.anonymous,
    isOwner: raw.isOwner,
    user: raw.user,
    languages,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : raw.createdAt.toISOString(),
    updatedAt:
      raw.updatedAt === undefined
        ? undefined
        : typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : raw.updatedAt.toISOString(),
    views: raw.views,
  };
}

async function createPostRequest(input: CreatePostInput): Promise<PostResponse> {
  const body: CreatePostDTO = {
    title: input.title.trim(),
    content: input.content,
    anonymous: input.anonymous,
    languages: input.languages,
  };

  const created = await request<ApiPostResponse, CreatePostDTO>({
    path: "/posts",
    method: "POST",
    body,
  });
  return normalizePost(created);
}

export function useCreatePost() {
  return useMutation<PostResponse, AppError, CreatePostInput>({
    mutationFn: createPostRequest,
  });
}

async function listPostsRequest(): Promise<PostResponse[]> {
  const payload = await request<unknown>({ path: "/posts", method: "GET" });
  const list =
    Array.isArray(payload)
      ? payload
      : typeof payload === "object" && payload !== null && "data" in payload
        ? (payload as { data?: unknown }).data
        : typeof payload === "object" && payload !== null && "posts" in payload
          ? (payload as { posts?: unknown }).posts
          : null;

  if (!Array.isArray(list)) return [];
  return (list as ApiPostResponse[]).map(normalizePost);
}

export function usePosts() {
  return useQuery<PostResponse[], AppError>({
    queryKey: ["posts"],
    queryFn: listPostsRequest,
    staleTime: 10_000,
    gcTime: 10 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

async function deletePostRequest(postId: string) {
  return request<unknown, { title: string; content: string }>({
    path: `/posts/${postId}`,
    method: "PATCH",
    body: {
      title: "Post apagado",
      content: "[[DELETED]]",
    },
  });
}

export function useDeletePost() {
  return useMutation<unknown, AppError, { postId: string }>({
    mutationFn: ({ postId }) => deletePostRequest(postId),
  });
}
