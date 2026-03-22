import type { RegisterType } from "../types/RegisterType";

export async function createUser(data: RegisterType) {
  const response = await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Erro ao cadastrar usuário");
  }

  return result;
}

export async function registerWithGoogle(credential: string) {
  const response = await fetch("http://localhost:3000/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Erro ao cadastrar com Google");
  }

  return result as { accessToken: string; refreshToken: string; isNewUser?: boolean };
}
