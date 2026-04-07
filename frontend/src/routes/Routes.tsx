import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/EditProfile/EditProfile";
import CreatePost from "../pages/CreatePost/CreatePost";
import RequireAuth from "../components/RequireAuth/RequireAuth";
import { FeedPage } from '../pages/FeedPage';
import { PostView } from '../pages/PostView';

type ToastEventDetail = {
  title?: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
  actionState?: unknown;
  durationMs?: number;
};

function ToastHost({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState<ToastEventDetail | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    function clearCloseTimer() {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    }

    function show(next: ToastEventDetail) {
      clearCloseTimer();
      setToast(next);
      setOpen(true);
      const duration = typeof next.durationMs === "number" ? next.durationMs : 6000;
      closeTimer.current = window.setTimeout(() => setOpen(false), duration);
    }

    function onToastEvent(event: Event) {
      const custom = event as CustomEvent<ToastEventDetail>;
      if (!custom.detail || typeof custom.detail.message !== "string") return;
      show(custom.detail);
    }

    window.addEventListener("deadlock:toast", onToastEvent);
    return () => {
      clearCloseTimer();
      window.removeEventListener("deadlock:toast", onToastEvent);
    };
  }, []);

  return (
    <>
      {children}
      <div
        className={[
          "fixed right-6 top-24 z-50 w-[min(420px,calc(100%-3rem))] transition-all duration-200",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        {toast ? (
          <div className="rounded-2xl border border-zinc-200 bg-default-color shadow-lg overflow-hidden">
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-main-color font-semibold truncate">
                  {toast.title ?? "Ação restrita"}
                </div>
                <div className="text-sm text-zinc-600 mt-1 break-words">
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center shrink-0"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true" className="text-xl leading-none text-main-color">
                  ×
                </span>
              </button>
            </div>
            {toast.actionTo ? (
              <div className="px-4 pb-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="h-9 px-4 rounded-full border border-main-color text-main-color font-semibold hover:bg-zinc-200 transition-colors"
                  onClick={() => {
                    setOpen(false);
                    const actionState =
                      toast.actionState ?? { from: location.pathname + location.search };
                    navigate(toast.actionTo!, { state: actionState });
                  }}
                >
                  {toast.actionLabel ?? "Fazer login"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ToastHost>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/feed" element={<Navigate to="/" replace />} />
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
          <Route
            path="/post/create"
            element={
              <RequireAuth>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/postview/:id" element={<PostView />} />
        </Routes>
      </ToastHost>
    </BrowserRouter>
  );
}