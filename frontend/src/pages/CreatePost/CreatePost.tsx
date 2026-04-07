import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { Header } from "../../components/shared/Header";
import { Sidebar } from "../../components/shared/Sidebar";
import { useCreatePost } from "../../services/CreatePostService";
import { useMe } from "../../services/ProfileService";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { resolveAvatarSrc, useAvatarsData } from "../../utils/avatar";
import "./CreatePost.css";

type Mode = "edit" | "preview";

type Snippet = {
  id: string;
  languageId: string;
  themeId: ThemeId;
  code: string;
};

type ThemeId = "vs" | "vs-dark" | "hc-black";

type Tag = string;

type LanguageOption = {
  id: string;
  label: string;
};

const THEMES: { id: ThemeId; label: string }[] = [
  { id: "vs", label: "Light" },
  { id: "vs-dark", label: "Visual Studio Dark" },
  { id: "hc-black", label: "High Contrast" },
];

function buildId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function addUniqueTag(tags: Tag[], tagToAdd: string) {
  const normalized = normalizeTag(tagToAdd);
  if (!normalized) return tags;
  if (tags.some((t) => normalizeTag(t) === normalized)) return tags;
  return [...tags, normalized];
}

function removeTag(tags: Tag[], tagToRemove: string) {
  const normalized = normalizeTag(tagToRemove);
  return tags.filter((t) => normalizeTag(t) !== normalized);
}

function buildContentWithSnippets(params: { content: string; snippets: Snippet[] }) {
  const base = params.content.trim();
  const blocks = params.snippets
    .map((snippet) => {
      const code = snippet.code.trim();
      if (!code) return "";
      const lang = snippet.languageId?.trim() || "";
      const tag = lang ? `\n\n[[SNIPPET lang=${lang}]]\n${code}\n[[/SNIPPET]]\n` : `\n\n[[SNIPPET]]\n${code}\n[[/SNIPPET]]\n`;
      return tag;
    })
    .filter(Boolean)
    .join("");

  return `${base}${blocks}`.trim();
}

function clampVisibleLines(lineCount: number) {
  return Math.max(1, Math.min(40, lineCount));
}

function getPreviewEditorHeightPx(params: { code: string; lineHeightPx: number }) {
  const lineCount = params.code.split("\n").length;
  const visibleLines = clampVisibleLines(lineCount);
  return visibleLines * params.lineHeightPx + 18;
}

function copyToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function SnippetPreview({
  snippet,
  lineHeightPx,
  onCopy,
  onFullscreen,
}: {
  snippet: Snippet;
  lineHeightPx: number;
  onCopy: () => void;
  onFullscreen: () => void;
}) {
  const heightPx = useMemo(
    () => getPreviewEditorHeightPx({ code: snippet.code, lineHeightPx }),
    [lineHeightPx, snippet.code]
  );

  return (
    <div className="createPostSnippetPreview">
      <div className="createPostSnippetPreviewTop">
        <div className="createPostSnippetMeta">
          <span className="createPostSnippetLang">{snippet.languageId}</span>
        </div>

        <div className="createPostSnippetActions">
          <button type="button" className="createPostSnippetIcon" onClick={onCopy}>
            Copiar
          </button>
          <button type="button" className="createPostSnippetIcon" onClick={onFullscreen}>
            Tela cheia
          </button>
        </div>
      </div>

      <div className="createPostSnippetEditorFrame" style={{ height: heightPx }}>
        <Editor
          language={snippet.languageId}
          theme={snippet.themeId}
          value={snippet.code}
          options={{
            readOnly: true,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 13,
            lineHeight: lineHeightPx,
            renderLineHighlight: "none",
            contextmenu: false,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>
    </div>
  );
}

function FullscreenSnippet({
  snippet,
  lineHeightPx,
  onClose,
}: {
  snippet: Snippet;
  lineHeightPx: number;
  onClose: () => void;
}) {
  const editorHeight = "72vh";

  return (
    <div className="createPostFullscreenOverlay" role="dialog" aria-modal="true">
      <div className="createPostFullscreenCard">
        <div className="createPostFullscreenTop">
          <div className="createPostFullscreenTitle">{snippet.languageId}</div>
          <div className="createPostFullscreenTopActions">
            <button
              type="button"
              className="createPostFullscreenButton"
              onClick={() => void copyToClipboard(snippet.code)}
            >
              Copiar
            </button>
            <button type="button" className="createPostFullscreenButton" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>

        <div className="createPostSnippetEditorFrame" style={{ height: editorHeight }}>
          <Editor
            language={snippet.languageId}
            theme={snippet.themeId}
            value={snippet.code}
            options={{
              readOnly: true,
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              fontSize: 14,
              lineHeight: lineHeightPx,
              renderLineHighlight: "none",
              contextmenu: false,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePost();
  const meQuery = useMe();
  const avatarsData = useAvatarsData();

  const [mode, setMode] = useState<Mode>("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagLanguageId, setSelectedTagLanguageId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const lineHeightPx = 18;
  const [fullscreenSnippetId, setFullscreenSnippetId] = useState<string | null>(null);

  useEffect(() => {
    void loader.init().then((monaco: Monaco) => {
      const nextLanguages = monaco.languages
        .getLanguages()
        .map((lang: { id: string; aliases?: string[] }) => {
          const label =
            Array.isArray(lang.aliases) && lang.aliases.length > 0
              ? lang.aliases[0]
              : lang.id;
          return { id: lang.id, label };
        })
        .sort((languageA: LanguageOption, languageB: LanguageOption) =>
          languageA.label.localeCompare(languageB.label)
        );

      setLanguageOptions(nextLanguages);
      setSelectedTagLanguageId((prev) => prev || nextLanguages[0]?.id || "");
    });
  }, []);

  const activeFullscreenSnippet = useMemo(() => {
    if (!fullscreenSnippetId) return null;
    return snippets.find((s) => s.id === fullscreenSnippetId) ?? null;
  }, [fullscreenSnippetId, snippets]);

  const handleAddSnippet = () => {
    const defaultLanguage = languageOptions[0]?.id ?? "javascript";
    const nextSnippet: Snippet = {
      id: buildId(),
      languageId: defaultLanguage,
      themeId: "vs-dark",
      code: "",
    };

    setSnippets((prev) => [...prev, nextSnippet]);
  };

  const handleRemoveLastSnippet = () => {
    setSnippets((prev) => prev.slice(0, -1));
  };

  const handleRemoveSnippet = (snippetId: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
  };

  const updateSnippet = (snippetId: string, patch: Partial<Snippet>) => {
    setSnippets((prev) =>
      prev.map((snippet) => (snippet.id === snippetId ? { ...snippet, ...patch } : snippet))
    );
  };

  const submitPost = async () => {
    try {
      setSubmitError(null);

      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      if (!trimmedTitle || !trimmedContent) {
        setSubmitError("Preencha título e conteúdo antes de postar");
        return;
      }

      const contentWithSnippets = buildContentWithSnippets({ content: trimmedContent, snippets });

      await createPostMutation.mutateAsync({
        title: trimmedTitle,
        content: contentWithSnippets,
        anonymous: isAnonymous,
        languages: tags,
      });

      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTitle("");
      setContent("");
      setTags([]);
      setSnippets([]);
      setFullscreenSnippetId(null);
      setIsAnonymous(false);
      setMode("edit");
      navigate("/profile", { replace: true });
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, "Erro ao criar post"));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitPost();
  };

  const previewAvatarSrc = useMemo(() => {
    const storedPhotoUrl = isAnonymous ? null : meQuery.data?.userPhoto;
    return resolveAvatarSrc({
      avatars: avatarsData.avatars,
      avatarsById: avatarsData.avatarsById,
      storedPhotoUrl,
    });
  }, [avatarsData.avatars, avatarsData.avatarsById, isAnonymous, meQuery.data?.userPhoto]);

  const previewHandle = isAnonymous
    ? "@anonimo"
    : meQuery.data?.username
      ? `@${meQuery.data.username}`
      : "@usuario";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
      {activeFullscreenSnippet ? (
        <FullscreenSnippet
          snippet={activeFullscreenSnippet}
          lineHeightPx={lineHeightPx}
          onClose={() => setFullscreenSnippetId(null)}
        />
      ) : null}

          <div className="createPostContentWrap">
            <div className="createPostContent">
              <div className="createPostTopRow">
                <h2 className="createPostTitle">ESCREVA SUA DUVIDA</h2>
              </div>

              <div className="createPostGrid">
                <form className="createPostCard" onSubmit={handleSubmit}>
                {mode === "edit" ? (
                  <>
                    <div className="createPostFieldBox">
                      <input
                        className="createPostInput"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="TITULO"
                        aria-label="Título"
                      />

                      <textarea
                        className="createPostTextarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="CONTEUDO"
                        aria-label="Conteúdo"
                      />
                    </div>

                    {snippets.length > 0 ? (
                      <div className="createPostSnippets">
                        {snippets.map((snippet) => (
                          <div key={snippet.id} className="createPostSnippet">
                            <div className="createPostSnippetHeader">
                              <div className="createPostSnippetSelectRow">
                                <label className="createPostSnippetLabel">
                                  Language
                                  <select
                                    className="createPostSnippetSelect"
                                    value={snippet.languageId}
                                    onChange={(e) => {
                                      const nextLanguageId = e.target.value;
                                      updateSnippet(snippet.id, { languageId: nextLanguageId });
                                    }}
                                  >
                                    {languageOptions.map((opt) => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label className="createPostSnippetLabel">
                                  Theme
                                  <select
                                    className="createPostSnippetSelect"
                                    value={snippet.themeId}
                                    onChange={(e) =>
                                      updateSnippet(snippet.id, { themeId: e.target.value as ThemeId })
                                    }
                                  >
                                    {THEMES.map((theme) => (
                                      <option key={theme.id} value={theme.id}>
                                        {theme.label}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>

                              <button
                                type="button"
                                className="createPostSnippetRemoveSmall"
                                onClick={() => handleRemoveSnippet(snippet.id)}
                              >
                                Remover
                              </button>
                            </div>

                            <div className="createPostSnippetEditor">
                              <Editor
                                language={snippet.languageId}
                                theme={snippet.themeId}
                                value={snippet.code}
                                height="320px"
                                onChange={(nextCode) => updateSnippet(snippet.id, { code: nextCode ?? "" })}
                                options={{
                                  minimap: { enabled: false },
                                  wordWrap: "on",
                                  scrollBeyondLastLine: false,
                                  fontSize: 13,
                                  lineHeight: lineHeightPx,
                                  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="createPostSnippetButtons">
                      <button
                        type="button"
                        className="createPostSnippetButton"
                        onClick={handleAddSnippet}
                      >
                        ADICIONAR SNIPPET
                      </button>

                      {snippets.length > 0 ? (
                        <button
                          type="button"
                          className="createPostSnippetButton createPostSnippetButtonDanger"
                          onClick={handleRemoveLastSnippet}
                        >
                          REMOVER SNIPPET
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="createPostPreview">
                    <article className="createPostPreviewPost" aria-label="Pré-visualização do post">
                      <div className="createPostPreviewPostTop">
                        <div className="createPostPreviewAuthor">
                          <img
                            src={previewAvatarSrc}
                            alt="Autor"
                            className="createPostPreviewAvatar"
                          />
                          <div className="createPostPreviewHandle">{previewHandle}</div>
                        </div>
                      </div>

                      <div className="createPostPreviewPostBody">
                        <div className="createPostPreviewPostTitle">
                          &lt; {title.trim() || "Titulo"} /&gt;
                        </div>
                        <div className="createPostPreviewPostContent">
                          {content.trim() || "Conteudo"}
                        </div>
                      </div>

                      {tags.length > 0 ? (
                        <div className="createPostPreviewTags">
                          {tags.map((tag) => (
                            <span key={tag} className="createPostPreviewTag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>

                    {snippets.length > 0 ? (
                      <div className="createPostPreviewSnippets">
                        {snippets.map((snippet) => (
                          <SnippetPreview
                            key={snippet.id}
                            snippet={snippet}
                            lineHeightPx={lineHeightPx}
                            onCopy={() => void copyToClipboard(snippet.code)}
                            onFullscreen={() => setFullscreenSnippetId(snippet.id)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </form>

              <aside className="createPostPanel">
                <div className="createPostModeSwitch">
                  <button
                    type="button"
                    className={mode === "edit" ? "createPostModeButton active" : "createPostModeButton"}
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={mode === "preview" ? "createPostModeButton active" : "createPostModeButton"}
                    onClick={() => setMode("preview")}
                  >
                    Preview
                  </button>
                </div>

                <div className="createPostPanelCard">
                  <div className="createPostPanelSectionTitle">POSTAGEM ANONIMA?</div>
                  <div className="createPostRadioRow">
                    <label className="createPostRadioLabel">
                      <input
                        type="radio"
                        name="anonymous"
                        checked={isAnonymous}
                        onChange={() => setIsAnonymous(true)}
                      />
                      SIM
                    </label>
                    <label className="createPostRadioLabel">
                      <input
                        type="radio"
                        name="anonymous"
                        checked={!isAnonymous}
                        onChange={() => setIsAnonymous(false)}
                      />
                      NÃO
                    </label>
                  </div>
                </div>

                <div className="createPostPanelCard">
                  <div className="createPostPanelSectionTitle">TAGS</div>
                  <div className="createPostTagLanguageRow">
                    <select
                      className="createPostTagLanguageSelect"
                      value={selectedTagLanguageId}
                      onChange={(e) => setSelectedTagLanguageId(e.target.value)}
                      aria-label="Selecionar linguagem"
                    >
                      <option value="">Selecione uma linguagem</option>
                      {languageOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="createPostTagLanguageAdd"
                      onClick={() => {
                        if (!selectedTagLanguageId) return;
                        const selected = languageOptions.find(
                          (opt) => opt.id === selectedTagLanguageId
                        );
                        const labelToAdd = selected?.label ?? selectedTagLanguageId;
                        setTags((prev) => addUniqueTag(prev, labelToAdd));
                      }}
                      aria-label="Adicionar tag de linguagem"
                      title="Adicionar tag"
                    >
                      +
                    </button>
                  </div>

                  {tags.length > 0 ? (
                    <div className="createPostTagList">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="createPostTagChip"
                          onClick={() => setTags((prev) => removeTag(prev, tag))}
                        >
                          {tag} ×
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {submitError ? <div className="createPostSubmitError">{submitError}</div> : null}

                <button
                  type="button"
                  className="createPostSubmit"
                  disabled={createPostMutation.isPending}
                  onClick={() => void submitPost()}
                >
                  POSTAR
                </button>
              </aside>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
