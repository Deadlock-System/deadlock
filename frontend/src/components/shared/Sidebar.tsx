import { Bookmark, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../services/ProfileService';
import { resolveAvatarSrc, useAvatarsData } from '../../utils/avatar';

export function Sidebar({ showProfileShortcut = true }: { showProfileShortcut?: boolean }) {
  const navigate = useNavigate();
  const meQuery = useMe();
  const avatarsData = useAvatarsData();

  const avatarSrc = useMemo(() => {
    const storedPhotoUrl = meQuery.data?.userPhoto ?? null;
    return resolveAvatarSrc({
      avatars: avatarsData.avatars,
      avatarsById: avatarsData.avatarsById,
      storedPhotoUrl,
    });
  }, [avatarsData.avatars, avatarsData.avatarsById, meQuery.data?.userPhoto]);

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
            onClick={() => navigate('/post/create')}
            aria-label="Criar postagem"
          >
            <Plus size={30} strokeWidth={2} className="text-zinc-600" />
          </button>
        </div>

        {showProfileShortcut ? (
          <div className="absolute bottom-28 flex flex-col items-center gap-4">
            <div className="w-full border-t-2 border-zinc-600" />
            <button
              type="button"
              className="w-13 h-13 rounded-full bg-zinc-800 overflow-hidden hover:ring-2 hover:ring-zinc-400 transition-all"
              onClick={() => navigate('/profile')}
              aria-label="Perfil"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-zinc-600 to-zinc-900" />
              )}
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
