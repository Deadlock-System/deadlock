import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/shared/Header";
import { PostCard } from "../../components/shared/PostCard";
import { Sidebar } from "../../components/shared/Sidebar";
import { useMe } from "../../services/ProfileService";
import { useDeletePost, usePosts } from "../../services/CreatePostService";
import { SENIORITY_LABELS } from "../../types/RegisterType";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { resolveAvatarSrc, useAvatarsData } from "../../utils/avatar";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const postsQuery = usePosts();
  const deletePostMutation = useDeletePost();
  const avatarsData = useAvatarsData();
  const [tagSearch, setTagSearch] = useState("");

  const photoSrc = useMemo(() => {
    const storedPhotoUrl = meQuery.data?.userPhoto;
    return resolveAvatarSrc({
      avatars: avatarsData.avatars,
      avatarsById: avatarsData.avatarsById,
      storedPhotoUrl,
    });
  }, [avatarsData.avatars, avatarsData.avatarsById, meQuery.data?.userPhoto]);

  if (meQuery.isLoading) {
    return (
      <div className="profileState">
        <div className="profileStateText">Carregando...</div>
      </div>
    );
  }

  if (meQuery.isError) {
    return (
      <div className="profileState">
        <div className="profileStateText">
          {getErrorMessage(meQuery.error, "Erro ao carregar perfil")}
        </div>
      </div>
    );
  }

  const me = meQuery.data;
  if (!me) return null;

  const posts = postsQuery.data ?? [];
  const normalizedSearch = tagSearch.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => {
    if (post.isOwner !== true) return false;
    if (post.content === "[[DELETED]]") return false;
    if (!normalizedSearch) return true;
    return (post.languages ?? []).some((lang) => lang.toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar showProfileShortcut={false} />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
            <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={photoSrc}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border border-zinc-200"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="text-main-color text-3xl font-semibold break-words">
                      &lt;{me.username} /&gt;
                    </div>
                    <div className="text-main-color">
                      Senioridade: {SENIORITY_LABELS[me.seniorityId]}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="h-10 px-5 rounded-full border border-main-color text-main-color font-semibold hover:bg-zinc-200 transition-colors w-max"
                >
                  Editar Perfil
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-main-color font-semibold tracking-wide">
                POSTAGENS REALIZADAS
              </div>
              <input
                type="text"
                placeholder="PESQUISAR"
                className="w-full sm:w-72 h-10 px-4 rounded-full border border-gray-400 bg-white text-sm text-zinc-600 placeholder:uppercase focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>

            {postsQuery.isLoading ? (
              <div className="text-gray-500 flex items-center justify-center min-h-[40vh] text-lg">
                Carregando postagens...
              </div>
            ) : postsQuery.isError ? (
              <div className="text-gray-500 flex items-center justify-center min-h-[40vh] text-lg">
                {getErrorMessage(postsQuery.error, "Erro ao carregar postagens")}
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="text-gray-500 flex items-center justify-center min-h-[40vh] text-lg">
                Nenhuma postagem para exibir ainda.
              </div>
            ) : (
              <div className="space-y-8">
                {visiblePosts.map((post) => {
                  const storedPhotoUrl = post.anonymous
                    ? null
                    : (post.user?.user_photo ?? me.userPhoto);
                  const postAvatarSrc = resolveAvatarSrc({
                    avatars: avatarsData.avatars,
                    avatarsById: avatarsData.avatarsById,
                    storedPhotoUrl,
                  });

                  return (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      username={post.anonymous ? "anonimo" : post.user?.user_name ?? me.username}
                      title={post.title}
                      content={post.content}
                      avatarSrc={postAvatarSrc}
                      languages={post.languages ?? []}
                      showMenu
                      navigateState={{ from: "profile" }}
                      onDelete={() => {
                        const confirmed = window.confirm("Deseja apagar este post?");
                        if (!confirmed) return;
                        void deletePostMutation
                          .mutateAsync({ postId: post.id })
                          .then(() => queryClient.invalidateQueries({ queryKey: ["posts"] }));
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
