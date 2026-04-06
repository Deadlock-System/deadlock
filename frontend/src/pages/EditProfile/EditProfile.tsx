import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Header } from "../../components/shared/Header";
import { Sidebar } from "../../components/shared/Sidebar";
import { useMe } from "../../services/ProfileService";
import type { MeResponse } from "../../services/ProfileService";
import { useUpdateMe, useUpdatePassword } from "../../services/EditProfileService";
import type { UpdateMeInput } from "../../services/EditProfileService";
import { SENIORITY_LABELS, SENIORITY_OPTIONS } from "../../types/RegisterType";
import type { SeniorityId } from "../../types/RegisterType";
import { getErrorMessage } from "../../utils/ErrorMessage";
import {
  buildLocalAvatarUrl,
  getLocalAvatarIdFromUrl,
  isRemoteUrl,
  resolveAvatarSrc,
  useAvatarsData,
} from "../../utils/avatar";
import "./EditProfile.css";

function EditProfileLoadingState() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="editProfileState">
            <div className="editProfileStateText">Carregando...</div>
          </div>
        </main>
      </div>
    </div>
  );
}

function EditProfileErrorState({ error }: { error: unknown }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="editProfileState">
            <div className="editProfileStateText">
              {getErrorMessage(error, "Erro ao carregar perfil")}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const meQuery = useMe();

  if (meQuery.isLoading) return <EditProfileLoadingState />;

  if (meQuery.isError) return <EditProfileErrorState error={meQuery.error} />;

  const me = meQuery.data;
  if (!me) return null;

  return <EditProfileContent key={me.id} me={me} />;
}

function EditProfileContent({ me }: { me: MeResponse }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateMeMutation = useUpdateMe();
  const updatePasswordMutation = useUpdatePassword();

  const avatarsData = useAvatarsData();
  const avatars = avatarsData.avatars;
  const avatarsById = avatarsData.avatarsById;

  const canChooseAvatar = true;

  const initialAvatarId = useMemo(() => {
    if (!me.userPhoto) return "";
    const localAvatarId = getLocalAvatarIdFromUrl(me.userPhoto);
    if (localAvatarId && avatarsById.has(localAvatarId)) return localAvatarId;
    if (!isRemoteUrl(me.userPhoto)) {
      return avatarsById.has(me.userPhoto) ? me.userPhoto : "";
    }
    return "";
  }, [avatarsById, me.userPhoto]);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarId, setAvatarId] = useState<string>(initialAvatarId);
  const [form, setForm] = useState<{
    username: string;
    seniorityId: SeniorityId;
    currentPassword: string;
    password: string;
    confirmPassword: string;
  }>(
    () => ({
      username: me.username ?? "",
      seniorityId: me.seniorityId ?? "NOT_SELECTED",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    })
  );

  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const photoSrc = useMemo(() => {
    const storedPhotoUrl = me.userPhoto;
    return resolveAvatarSrc({
      avatars,
      avatarsById,
      storedPhotoUrl,
      selectedAvatarId: avatarId || undefined,
    });
  }, [avatarId, avatars, avatarsById, me.userPhoto]);

  const showCurrentPasswordHint =
    (form.password.trim().length > 0 || form.confirmPassword.trim().length > 0) &&
    form.currentPassword.trim().length === 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setFormMessage(null);

      const payload: UpdateMeInput = {};
      if (canChooseAvatar && avatarId) {
        const nextPhoto = buildLocalAvatarUrl(avatarId);
        if (nextPhoto !== me.userPhoto) payload.userPhoto = nextPhoto;
      }
      const trimmedUsername = form.username.trim();
      if (trimmedUsername && trimmedUsername !== me.username) {
        payload.username = trimmedUsername;
      }
      if (form.seniorityId && form.seniorityId !== me.seniorityId) {
        payload.seniorityId = form.seniorityId;
      }

      const wantsPasswordChange =
        form.password.trim().length > 0 || form.confirmPassword.trim().length > 0;

      if (wantsPasswordChange) {
        if (!form.password.trim() || !form.confirmPassword.trim()) {
          setFormMessage({ type: "error", text: "Preencha nova senha e confirmar senha" });
          return;
        }
        if (form.password !== form.confirmPassword) {
          setFormMessage({ type: "error", text: "As senhas não coincidem" });
          return;
        }
        if (!form.currentPassword.trim()) {
          setFormMessage({ type: "error", text: "Para trocar a senha, informe sua senha atual" });
          return;
        }
      }

      const hasProfileChanges = Object.keys(payload).length > 0;

      if (hasProfileChanges) {
        const updated = await updateMeMutation.mutateAsync(payload);
        queryClient.setQueryData(["me"], updated);
      }

      if (wantsPasswordChange) {
        await updatePasswordMutation.mutateAsync({
          currentPassword: form.currentPassword,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        setForm((prev) => ({ ...prev, currentPassword: "", password: "", confirmPassword: "" }));
      }

      if (!hasProfileChanges && !wantsPasswordChange) {
        setFormMessage({ type: "error", text: "Nenhuma alteração para salvar" });
        return;
      }

      navigate("/profile", { replace: true });
    } catch (error: unknown) {
      const status =
        typeof (error as { status?: unknown } | null)?.status === "number"
          ? (error as { status: number }).status
          : undefined;

      const details =
        typeof (error as { details?: unknown } | null)?.details === "object" &&
        (error as { details?: unknown }).details !== null
          ? ((error as { details: Record<string, unknown> }).details as Record<string, unknown>)
          : null;

      const backendCode = details && typeof details.code === "string" ? details.code : null;
      const backendMessage = details && typeof details.message === "string" ? details.message : null;

      if (status === 400 && backendCode === "INVALID_PASSWORD") {
        setFormMessage({ type: "error", text: "Senha atual incorreta" });
        return;
      }

      if (status === 401 || status === 403) {
        setFormMessage({ type: "error", text: "Sessão expirada. Faça login novamente." });
        return;
      }

      if (status === 404) {
        setFormMessage({
          type: "error",
          text: backendMessage ?? "Rota não encontrada ao atualizar senha",
        });
        return;
      }

      setFormMessage({
        type: "error",
        text: backendMessage ?? getErrorMessage(error, "Erro ao atualizar perfil"),
      });
    }
  };

  const isSubmitting = updateMeMutation.isPending || updatePasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="editProfileContentWrap">
            <div className="editProfileContent">
              <div className="editProfileCard">
                <div className="editProfileGrid">
                <div className="editProfileLeft">
                  <button
                    type="button"
                    className="editProfileAvatarWrap"
                    onClick={() => {
                      if (canChooseAvatar) setShowAvatarPicker((prev) => !prev);
                    }}
                    disabled={isSubmitting || !canChooseAvatar}
                  >
                    <img
                      src={photoSrc}
                      alt="Foto de perfil"
                      className={
                        isSubmitting
                          ? "editProfileAvatar editProfileAvatarDim"
                          : "editProfileAvatar"
                      }
                    />
                    <div aria-hidden="true" className="editProfileAvatarOverlay">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66Z" />
                      </svg>
                    </div>
                  </button>

                  <div aria-hidden="true" className="editProfileVerticalLine" />

                  {canChooseAvatar && showAvatarPicker ? (
                    <div className="editProfileAvatarOptions">
                      {avatars.map((avatar) => {
                        const selected = avatarId === avatar.id;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setAvatarId(avatar.id)}
                            disabled={isSubmitting}
                            className={
                              selected
                                ? "editProfileAvatarOption editProfileAvatarOptionSelected"
                                : "editProfileAvatarOption"
                            }
                          >
                            <img src={avatar.src} alt={`Avatar ${avatar.id}`} />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="editProfileRight">
                  <div className="editProfileUserText">
                    <div className="editProfileUsername">&lt;{form.username} /&gt;</div>
                    <div className="editProfileSeniority">
                      Senioridade: {SENIORITY_LABELS[form.seniorityId]}
                    </div>
                  </div>

                  <div className="editProfileSectionTitle">INFORMAÇÕES PESSOAIS</div>
                  <div className="editProfileSectionRule" />

                  <form className="editProfileForm" onSubmit={(e) => void handleSubmit(e)}>
                    {formMessage ? (
                      <div
                        className={
                          formMessage.type === "success"
                            ? "editProfileMessage editProfileMessageSuccess"
                            : "editProfileMessage editProfileMessageError"
                        }
                        role={formMessage.type === "error" ? "alert" : "status"}
                      >
                        {formMessage.text}
                      </div>
                    ) : null}

                    <div className="editProfileFields">
                      <Input
                        label="usuario"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="USUARIO"
                      />

                      <Input
                        label="email"
                        name="email"
                        type="text"
                        value={me.email ?? ""}
                        onChange={() => {}}
                        placeholder="EMAIL"
                        readOnly
                      />

                      <Input
                        label="senha atual"
                        name="currentPassword"
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="SENHA ATUAL"
                      />

                      {showCurrentPasswordHint ? (
                        <div className="editProfileHint" role="note">
                          Para trocar a senha, preencha a senha atual.
                        </div>
                      ) : null}

                      <Input
                        label="nova senha"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="NOVA SENHA"
                      />

                      <Input
                        label="confirmar senha"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="confirmar senha"
                      />

                      <Select
                        label="senioridade"
                        name="seniorityId"
                        value={form.seniorityId}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            seniorityId: e.target.value as SeniorityId,
                          }))
                        }
                        options={SENIORITY_OPTIONS}
                      />

                      <div className="editProfileActions">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="editProfileBackButton"
                          onClick={() => navigate("/profile")}
                        >
                          VOLTAR
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="editProfileSubmit"
                        >
                          SALVAR
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
