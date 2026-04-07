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

export type UpdateMeInput = {
  username?: string;
  seniorityId?: SeniorityId | Seniority;
  userPhoto?: string | null;
};

type UpdateMeDTO = {
  username?: string;
  seniorityId?: SeniorityId | Seniority;
  userPhoto?: string | null;
};

async function updateMeRequest(input: UpdateMeInput): Promise<MeResponse> {
  const body: UpdateMeDTO = {
    ...(input.username !== undefined ? { username: input.username.trim() } : {}),
    ...(input.seniorityId !== undefined ? { seniorityId: input.seniorityId } : {}),
    ...(input.userPhoto !== undefined ? { userPhoto: input.userPhoto } : {}),
  };

  return request<MeResponse, UpdateMeDTO>({
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

type UpdatePasswordDTO = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

async function updatePasswordRequest(input: UpdatePasswordInput): Promise<unknown> {
  const body: UpdatePasswordDTO = {
    currentPassword: input.currentPassword,
    password: input.password,
    confirmPassword: input.confirmPassword,
  };

  return request<unknown, UpdatePasswordDTO>({
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
