import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/EditProfile/EditProfile";
import { useMe } from "../services/ProfileService";

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const meQuery = useMe();

  if (meQuery.isLoading || meQuery.isFetching) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800 }}>
          Carregando...
        </div>
      </div>
    );
  }

  if (meQuery.isError) {
    const status = meQuery.error?.status;
    if (status === 401 || status === 403) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

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
          <div style={{ marginBottom: 10 }}>
            {status === 429
              ? "Muitas requisições. Aguarde alguns segundos e tente novamente."
              : status === 0 || status === undefined
                ? "Não foi possível validar a sessão. Verifique se o backend está rodando e se VITE_API_URL está correto."
                : `Erro ao validar sessão (HTTP ${status})`}
          </div>

          <button
            type="button"
            onClick={() => void meQuery.refetch()}
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

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
