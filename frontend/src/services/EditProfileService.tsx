import { useMutation } from "@tanstack/react-query";
import { env } from "../config/Env";
import { AppError } from "../utils/AppError";
import type { Seniority, SeniorityId } from "../types/RegisterType";
import type { MeResponse } from "./ProfileService";

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

export type UpdateMeInput = {
  username?: string;
  seniorityId?: SeniorityId | Seniority;
  userPhoto?: string | null;
};

async function updateMeRequest(data: UpdateMeInput): Promise<MeResponse> {
  const body: Record<string, unknown> = {};
  if (data.username !== undefined) body.username = data.username.trim();
  if (data.seniorityId !== undefined) body.seniorityId = data.seniorityId;
  if (data.userPhoto !== undefined) body.userPhoto = data.userPhoto;

  return request<MeResponse>({
    path: "/users/me",
    method: "PATCH",
    body,
  });
}

export function useUpdateMe() {
  return useMutation<MeResponse, AppError, UpdateMeInput>({
    mutationFn: updateMeRequest,
  });
}

export type UpdatePasswordInput = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

async function updatePasswordRequest(data: UpdatePasswordInput): Promise<unknown> {
  const body: Record<string, unknown> = {
    currentPassword: data.currentPassword,
    password: data.password,
    confirmPassword: data.confirmPassword,
  };

  return request<unknown>({
    path: "/users/me/password",
    method: "PATCH",
    body,
  });
}

export function useUpdatePassword() {
  return useMutation<unknown, AppError, UpdatePasswordInput>({
    mutationFn: updatePasswordRequest,
  });
}
