import { useQuery } from "@tanstack/react-query";
import { env } from "../config/Env";
import { AppError } from "../utils/AppError";
import type { Seniority } from "../types/RegisterType";

export type SeniorityId = Seniority | "NOT_SELECTED";

export type MeResponse = {
  id: string;
  email: string | null;
  username: string;
  userPhoto: string | null;
  seniorityId: SeniorityId;
  createdAt: string;
};

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

async function request<T>(params: {
  path: string;
  method?: HttpMethod;
  body?: Record<string, unknown>;
}): Promise<T> {
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

  return payload as T;
}

async function meRequest(): Promise<MeResponse> {
  return request<MeResponse>({ path: "/users/me", method: "GET" });
}

export function useMe() {
  return useQuery<MeResponse, AppError>({
    queryKey: ["me"],
    queryFn: meRequest,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
