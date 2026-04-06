import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../services/ProfileService";
import { usePosts } from "../../services/CreatePostService";
import { SENIORITY_LABELS } from "../../types/RegisterType";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { resolveAvatarSrc, useAvatarsData } from "../../utils/avatar";
import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Profile.css";

function formatRelativeTime(createdAtIso: string) {
  const createdAt = new Date(createdAtIso);
  const diffMs = Date.now() - createdAt.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return createdAt.toLocaleDateString();

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  return `há ${days} dias`;
}

export default function Profile() {
  const navigate = useNavigate();
  const meQuery = useMe();
  const postsQuery = usePosts();
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
    if (!normalizedSearch) return true;
    return (post.languages ?? []).some((lang) => lang.toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="profilePage">
      <aside className="profileSidebar">
        <img src={logo} alt="Deadlock" className="profileSidebarLogo" />
        <button
          type="button"
          className="profileSidebarAddPost"
          onClick={() => navigate("/post/create")}
          aria-label="Criar postagem"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M19 11H13V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z" />
          </svg>
        </button>
      </aside>

      <main className="profileMain">
        <header className="profileHeader">
          <input type="text" placeholder="PESQUISAR" className="profileSearch" />
        </header>

        <div className="profileContentWrap">
          <div className="profileContent">
            <div className="profileCard">
              <div className="profileUserRow">
                <div className="profileUserLeft">
                  <img src={photoSrc} alt="Foto de perfil" className="profileAvatar" />

                  <div className="profileUserText">
                    <div className="profileUsername">&lt;{me.username} /&gt;</div>
                    <div className="profileSeniority">
                      Senioridade: {SENIORITY_LABELS[me.seniorityId]}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="profileEditButton"
                >
                  <span aria-hidden="true" className="profileEditIcon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66Z" />
                    </svg>
                  </span>
                  Editar Perfil
                </button>
              </div>
            </div>

            <section className="profileSection">
              <div className="profileSectionHeader">
                <div className="profileSectionTitle">POSTAGENS REALIZADAS</div>
                <input
                  type="text"
                  placeholder="PESQUISAR"
                  className="profileSectionSearch"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
              </div>

              {postsQuery.isLoading ? (
                <div className="profileEmpty">Carregando postagens...</div>
              ) : postsQuery.isError ? (
                <div className="profileEmpty">
                  {getErrorMessage(postsQuery.error, "Erro ao carregar postagens")}
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="profileEmpty">Nenhuma postagem para exibir ainda.</div>
              ) : (
                <div className="profilePostsList">
                  {visiblePosts.map((post) => {
                    const storedPhotoUrl = post.anonymous ? null : (post.user?.user_photo ?? me.userPhoto);
                    const postAvatarSrc = resolveAvatarSrc({
                      avatars: avatarsData.avatars,
                      avatarsById: avatarsData.avatarsById,
                      storedPhotoUrl,
                    });

                    const handle = post.anonymous ? "@anonimo" : `@${post.user?.user_name ?? me.username}`;

                    return (
                      <article key={post.id} className="profilePostCard">
                      <div className="profilePostTop">
                        <div className="profilePostAuthor">
                          <img
                            src={postAvatarSrc}
                            alt="Autor"
                            className="profilePostAvatar"
                          />
                          <div className="profilePostAuthorText">
                            <div className="profilePostHandle">
                              {handle}
                            </div>
                          </div>
                        </div>
                        <button type="button" className="profilePostMenu" aria-label="Opções">
                          <span aria-hidden="true">⋮</span>
                        </button>
                      </div>

                      <div className="profilePostBody">
                        <div className="profilePostTitle">&lt; {post.title} /&gt;</div>
                        <div className="profilePostContent">{post.content}</div>
                      </div>

                      <div className="profilePostBottom">
                        <div className="profilePostTags">
                          {(post.languages ?? []).map((lang) => (
                            <span key={`${post.id}-${lang}`} className="profilePostTag">
                              {lang}
                            </span>
                          ))}
                        </div>
                        <div className="profilePostMeta">
                          <span className="profilePostMetaItem">
                            {typeof post.views === "number" ? post.views : 0}
                          </span>
                          <span className="profilePostMetaItem">{formatRelativeTime(post.createdAt)}</span>
                        </div>
                      </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
