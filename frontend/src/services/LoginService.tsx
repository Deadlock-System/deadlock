import { env } from "../config/Env";
import { useMutation } from "@tanstack/react-query";
import { AppError } from "../utils/AppError";

export type SignInInput = { email: string; password: string };
export type SignInResponse = { accessToken: string; refreshToken: string };

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

async function signInRequest(data: SignInInput): Promise<SignInResponse> {
  return request<SignInResponse>({
    path: "/signIn",
    method: "POST",
    body: { email: data.email.trim(), password: data.password },
  });
}

export function useSignIn() {
  return useMutation<SignInResponse, AppError, SignInInput>({
    mutationFn: signInRequest,
  });
}

export function getGithubLoginUrl() {
  return `${env.apiURL}/auth/github`;
}

export function getGoogleLoginUrl() {
  return `${env.apiURL}/auth/google`;
}
