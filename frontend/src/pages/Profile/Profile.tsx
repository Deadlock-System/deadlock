import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../services/ProfileService";
import { SENIORITY_LABELS } from "../../types/RegisterType";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { resolveAvatarSrc, useAvatarsData } from "../../utils/avatar";
import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const meQuery = useMe();
  const avatarsData = useAvatarsData();

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

  return (
    <div className="profilePage">
      <aside className="profileSidebar">
        <img src={logo} alt="Deadlock" className="profileSidebarLogo" />
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
                <input type="text" placeholder="PESQUISAR" className="profileSectionSearch" />
              </div>

              <div className="profileEmpty">Nenhuma postagem para exibir ainda.</div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
