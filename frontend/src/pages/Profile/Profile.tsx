import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../services/ProfileService";
import { getErrorMessage } from "../../utils/ErrorMessage";
import "./Profile.css";

const avatarModules = import.meta.glob("../../assets/ProfilesPictures/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

type Avatar = { id: string; src: string };

function buildAvatars(): { avatars: Avatar[]; byId: Map<string, string> } {
  const avatars = Object.entries(avatarModules)
    .map(([path, src]) => {
      const match = path.match(/Profile-(\d+)\.png$/);
      if (!match) return null;
      return { id: match[1], src } satisfies Avatar;
    })
    .filter((v): v is Avatar => v !== null)
    .sort((a, b) => Number(a.id) - Number(b.id));

  return {
    avatars,
    byId: new Map(avatars.map((a) => [a.id, a.src])),
  };
}

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

const LOCAL_AVATAR_URL_BASE = "https://deadlock.local/avatar";

function getLocalAvatarIdFromUrl(value: string) {
  try {
    const base = new URL(LOCAL_AVATAR_URL_BASE);
    const url = new URL(value);
    if (url.origin !== base.origin) return null;
    if (url.pathname !== base.pathname) return null;
    return url.searchParams.get("id");
  } catch {
    return null;
  }
}

function getSeniorityLabel(value: string) {
  switch (value) {
    case "STUDENDT":
      return "Estudante";
    case "JUNIOR":
      return "Junior";
    case "PLENO":
      return "Pleno";
    case "SENIOR":
      return "Senior";
    case "TECH_LEAD":
      return "Tech Lead";
    case "C_LEVEL":
      return "C-Level";
    case "NOT_SELECTED":
      return "Não selecionado";
    default:
      return value;
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const meQuery = useMe();
  const avatarsData = useMemo(() => buildAvatars(), []);

  const photoSrc = useMemo(() => {
    const fallback = avatarsData.avatars[0]?.src ?? "";
    const value = meQuery.data?.userPhoto;
    if (!value) return fallback;
    const localId = getLocalAvatarIdFromUrl(value);
    if (localId) return avatarsData.byId.get(localId) ?? fallback;
    if (isRemoteUrl(value)) return value;
    return avatarsData.byId.get(value) ?? fallback;
  }, [avatarsData, meQuery.data?.userPhoto]);

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
        <div className="profileSidebarLogo">L</div>

        <div className="profileSidebarButtons">
          <button type="button" className="profileSidebarButton">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
            </svg>
          </button>
        </div>
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
                      Senioridade: {getSeniorityLabel(me.seniorityId)}
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
