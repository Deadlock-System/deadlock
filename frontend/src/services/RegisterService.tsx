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

function getErrorCode(payload: any, status: number) {
  return typeof payload?.code === "string" ? payload.code : `HTTP_${status}`;
}

async function request<T>(params: {
  path: string;
  method?: HttpMethod;
  body?: Record<string, unknown>;
}): Promise<T> {
  const method = params.method ?? (params.body === undefined ? "GET" : "POST");
  const hasBody = params.body !== undefined && method !== "GET";

  const response = await fetch(`${env.apiURL}${params.path}`, {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(params.body) : undefined,
    credentials: "include",
  });

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
  return `${env.apiURL}/auth/github`;
}

export function getGoogleAuthUrl() {
  return `${env.apiURL}/auth/google`;
}
