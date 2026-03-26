export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro"): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === "string" ? message : String(message);
  }
  return fallback;
}