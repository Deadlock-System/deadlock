import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../../services/ProfileService";

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800 }}>Carregando...</div>
    </div>
  );
}

function ErrorScreen({
  status,
  onRetry,
}: {
  status: number | undefined;
  onRetry: () => void;
}) {
  const message =
    status === 429
      ? "Muitas requisições. Aguarde alguns segundos e tente novamente."
      : status === 0 || status === undefined
        ? "Não foi possível validar a sessão. Verifique se o backend está rodando e se VITE_API_URL está correto."
        : `Erro ao validar sessão (HTTP ${status})`;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          textAlign: "center",
          padding: 16,
        }}
      >
        <div style={{ marginBottom: 10 }}>{message}</div>

        <button
          type="button"
          onClick={onRetry}
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(38,63,76,0.35)",
            background: "#fbfbfc",
            color: "#263f4c",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const meQuery = useMe();

  const isLoading = meQuery.isLoading || meQuery.isFetching;
  if (isLoading) return <LoadingScreen />;

  if (meQuery.isError) {
    const status = meQuery.error?.status;
    if (status === 401 || status === 403) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <ErrorScreen status={status} onRetry={() => void meQuery.refetch()} />;
  }

  return children;
}