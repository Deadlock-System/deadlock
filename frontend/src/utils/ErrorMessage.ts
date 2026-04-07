export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro"): string {
  try {
    if (typeof error === "string") {
      const s = error.trim();
      if (s.length === 0) return fallback;
      if (/^HTTP_/i.test(s) || /^HTTP\s*\d+/i.test(s)) return fallback;
      return s;
    }

    if (typeof error === "object" && error !== null) {
      const anyErr = error as { message?: unknown; code?: unknown; status?: unknown; details?: unknown };
      if (typeof anyErr.code === "string") return fallback;
      if (typeof anyErr.status === "number") return fallback;
      if (typeof anyErr.message === "string") {
        const s = anyErr.message.trim();
        if (/^HTTP_/i.test(s) || /^HTTP\s*\d+/i.test(s)) return fallback;
        return s.length > 0 ? s : fallback;
      }
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function notifyLoginRequired(params: {
  message?: string;
  actionTo?: string;
  from?: string;
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("deadlock:toast", {
      detail: {
        title: "Você não está logado",
        message: params.message ?? "Para continuar, faça login.",
        actionLabel: "Fazer login",
        actionTo: params.actionTo ?? "/login",
        actionState: { from: params.from ?? window.location.pathname + window.location.search },
      },
    })
  );
}
