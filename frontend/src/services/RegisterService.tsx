import type { RegisterType } from "../types/RegisterType";
import { env } from "../config/Env";
import { useMutation } from "@tanstack/react-query";
import { AppError } from "../utils/AppError";

export type CreateUserResponse = {
  id: string;
  email: string | null;
  username: string;
  userPhoto: string | null;
  seniorityId: RegisterType["seniorityId"];
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

async function createUserRequest(data: RegisterType): Promise<CreateUserResponse> {
  return request<CreateUserResponse>({
    path: "/users",
    method: "POST",
    body: {
      email: data.email.trim(),
      username: data.username.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      seniorityId: data.seniorityId,
    },
  });
}

export function useCreateUser() {
  return useMutation<CreateUserResponse, AppError, RegisterType>({
    mutationFn: createUserRequest,
  });
}

export function getGithubAuthUrl() {
  const baseUrl = resolveApiBaseUrl();
  if (baseUrl.endsWith("/api")) return `${baseUrl}/auth/github`;
  return `${env.apiURL}/auth/github`;
}

export function getGoogleAuthUrl() {
  const baseUrl = resolveApiBaseUrl();
  if (baseUrl.endsWith("/api")) return `${baseUrl}/auth/google`;
  return `${env.apiURL}/auth/google`;
}
