import { env } from "../config/Env";

export async function signIn(data: { email: string; password: string }) {
  const response = await fetch(`${env.apiURL}/signIn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof (result as { message?: unknown }).message === "string"
        ? (result as { message: string }).message
        : "Erro ao fazer login";
    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("accessToken" in result) ||
    !("refreshToken" in result) ||
    typeof (result as { accessToken: unknown }).accessToken !== "string" ||
    typeof (result as { refreshToken: unknown }).refreshToken !== "string"
  ) {
    throw new Error("Resposta inválida do servidor");
  }

  return result as { accessToken: string; refreshToken: string };
}

export async function loginWithGoogle(credential: string) {
  const response = await fetch(`${env.apiURL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof (result as { message?: unknown }).message === "string"
        ? (result as { message: string }).message
        : "Erro ao entrar com Google";
    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("accessToken" in result) ||
    !("refreshToken" in result) ||
    typeof (result as { accessToken: unknown }).accessToken !== "string" ||
    typeof (result as { refreshToken: unknown }).refreshToken !== "string"
  ) {
    throw new Error("Resposta inválida do servidor");
  }

  return result as { accessToken: string; refreshToken: string; isNewUser?: boolean };
}
