import { useMemo } from "react";

const avatarModules = import.meta.glob("../assets/ProfilesPictures/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export type Avatar = { id: string; src: string };

export const LOCAL_AVATAR_URL_BASE = "https://deadlock.local/avatar";

export function isRemoteUrl(urlProvided: string) {
  return /^https?:\/\//i.test(urlProvided);
}

export function getLocalAvatarIdFromUrl(photoUrl: string) {
  try {
    const baseUrl = new URL(LOCAL_AVATAR_URL_BASE);
    const providedUrl = new URL(photoUrl);
    if (providedUrl.origin !== baseUrl.origin) return null;
    if (providedUrl.pathname !== baseUrl.pathname) return null;
    return providedUrl.searchParams.get("id");
  } catch {
    return null;
  }
}

export function buildLocalAvatarUrl(avatarId: string) {
  return `${LOCAL_AVATAR_URL_BASE}?id=${encodeURIComponent(avatarId)}`;
}

export function buildAvatarsData(): { avatars: Avatar[]; avatarsById: Map<string, string> } {
  const avatars = Object.entries(avatarModules)
    .map(([assetPath, avatarSrc]) => {
      const match = assetPath.match(/Profile-(\d+)\.png$/);
      if (!match) return null;
      return { id: match[1], src: avatarSrc } satisfies Avatar;
    })
    .filter((avatarCandidate): avatarCandidate is Avatar => avatarCandidate !== null)
    .sort((avatarA, avatarB) => Number(avatarA.id) - Number(avatarB.id));

  return {
    avatars,
    avatarsById: new Map(avatars.map((avatar) => [avatar.id, avatar.src])),
  };
}

export function useAvatarsData() {
  return useMemo(() => buildAvatarsData(), []);
}

export function resolveAvatarSrc(params: {
  avatars: Avatar[];
  avatarsById: Map<string, string>;
  storedPhotoUrl: string | null | undefined;
  selectedAvatarId?: string;
}) {
  const fallbackAvatarSrc = params.avatars[0]?.src ?? "";

  if (params.selectedAvatarId) {
    return params.avatarsById.get(params.selectedAvatarId) ?? fallbackAvatarSrc;
  }

  const storedPhotoUrl = params.storedPhotoUrl;
  if (!storedPhotoUrl) return fallbackAvatarSrc;

  const localAvatarId = getLocalAvatarIdFromUrl(storedPhotoUrl);
  if (localAvatarId) return params.avatarsById.get(localAvatarId) ?? fallbackAvatarSrc;

  if (isRemoteUrl(storedPhotoUrl)) return storedPhotoUrl;

  return params.avatarsById.get(storedPhotoUrl) ?? fallbackAvatarSrc;
}

