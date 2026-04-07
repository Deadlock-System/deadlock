import { Bookmark, LogOut, Plus, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../services/ProfileService';
import { useLogout } from '../../services/LoginService';
import { resolveAvatarSrc, useAvatarsData } from '../../utils/avatar';
import { notifyLoginRequired } from '../../utils/ErrorMessage';

export function Sidebar({
  showProfileShortcut = true,
  bottomMode,
}: {
  showProfileShortcut?: boolean;
  bottomMode?: 'profileMenu' | 'logout' | 'none';
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const logoutMutation = useLogout();
  const avatarsData = useAvatarsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const resolvedBottomMode = bottomMode ?? (showProfileShortcut ? 'profileMenu' : 'none');

  const avatarSrc = useMemo(() => {
    const storedPhotoUrl = meQuery.data?.userPhoto ?? null;
    return resolveAvatarSrc({
      avatars: avatarsData.avatars,
      avatarsById: avatarsData.avatarsById,
      storedPhotoUrl,
    });
  }, [avatarsData.avatars, avatarsData.avatarsById, meQuery.data?.userPhoto]);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
    } finally {
      queryClient.removeQueries({ queryKey: ['me'] });
      setMenuOpen(false);
      navigate('/', { replace: true });
    }
  }

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-20 h-full w-20 flex-col items-center z-20 border-r border-r-gray-200 bg-default-color">
        <div className="mt-32 space-y-10">
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-zinc-200 transition-colors"
            aria-label="Itens salvos"
          >
            <Bookmark size={30} strokeWidth={2} className="text-zinc-600" />
          </button>
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-zinc-200 transition-colors"
            onClick={() => {
              if (meQuery.isSuccess) {
                navigate('/post/create');
                return;
              }
              notifyLoginRequired({ message: 'Para criar uma postagem, faça login.', from: '/post/create' });
            }}
            aria-label="Criar postagem"
          >
            <Plus size={30} strokeWidth={2} className="text-zinc-600" />
          </button>
        </div>

        {resolvedBottomMode === 'profileMenu' ? (
          <div ref={menuRef} className="absolute bottom-28 flex flex-col items-center gap-4">
            <div className="w-full border-t-2 border-zinc-600" />
            <div className="relative">
              <button
                type="button"
                className="w-13 h-13 rounded-full bg-zinc-800 overflow-hidden hover:ring-2 hover:ring-zinc-400 transition-all"
                onClick={() => {
                  if (meQuery.isSuccess) {
                    setMenuOpen((prev) => !prev);
                    return;
                  }
                  notifyLoginRequired({ message: 'Para acessar o perfil, faça login.', from: '/profile' });
                }}
                aria-label="Perfil"
                aria-expanded={menuOpen}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-zinc-600 to-zinc-900" />
                )}
              </button>

              {meQuery.isSuccess && menuOpen ? (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-100 transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    style={{ color: '#111827', fontSize: 14, fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      <span>Perfil</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-100 transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void handleLogout()}
                    style={{ color: '#dc2626', fontSize: 14, fontWeight: 700 }}
                  >
                    <span className="flex items-center gap-2">
                      <LogOut size={16} />
                      <span>Sair</span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : resolvedBottomMode === 'logout' ? (
          <div className="absolute bottom-28 flex flex-col items-center gap-4">
            <div className="w-full border-t-2 border-zinc-600" />
            <button
              type="button"
              className="px-2 py-1 flex flex-col items-center justify-center gap-1 text-red-600 hover:text-red-700 transition-colors"
              onClick={() => void handleLogout()}
              aria-label="Sair"
              disabled={logoutMutation.isPending}
            >
              <LogOut size={22} />
              <span className="text-[11px] font-semibold">Sair</span>
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
