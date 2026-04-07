import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CommentCard,
  type CommentCardProps,
} from '../components/shared/CommentCard';
import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Eye,
  MessageSquareMore,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { postService } from '../shared/services/PostService';
import { useDeletePost } from '../services/CreatePostService';
import { useQueryClient } from '@tanstack/react-query';

type PostViewState = {
  title?: string;
  content?: string;
  languages?: unknown[];
  from?: string;
};

type PostData = {
  id: string;
  title: string;
  content: string;
  languages: string[];
  isOwner: boolean;
};

function normalizeLanguage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const v = value as { name?: unknown; slug?: unknown; id?: unknown };
    if (typeof v.name === 'string') return v.name;
    if (typeof v.slug === 'string') return v.slug;
    if (typeof v.id === 'string') return v.id;
  }
  return null;
}

function normalizeLanguages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[])
    .map(normalizeLanguage)
    .filter((v: string | null): v is string => Boolean(v));
}

function clampVisibleLines(lineCount: number) {
  return Math.max(1, Math.min(40, lineCount));
}

function getPreviewEditorHeightPx(params: { code: string; lineHeightPx: number }) {
  const lineCount = params.code.split('\n').length;
  const visibleLines = clampVisibleLines(lineCount);
  return visibleLines * params.lineHeightPx + 18;
}

function copyToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function PostOptionsMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-9 h-9 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center"
        aria-label="Opções"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true" className="text-xl leading-none text-main-color">
          ⋮
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden z-10">
          <button
            type="button"
            className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-zinc-100 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            Apagar post
          </button>
        </div>
      ) : null}
    </div>
  );
}

function parseContentBlocks(content: string) {
  const parts: Array<
    | { type: 'text'; text: string }
    | { type: 'code'; language: string | null; code: string }
  > = [];

  const upper = content.toUpperCase();
  let i = 0;
  while (i < content.length) {
    const fenceStart = content.indexOf('```', i);
    const tagStart = upper.indexOf('[[SNIPPET', i);

    const starts = [fenceStart, tagStart].filter((v) => v !== -1);
    const start = starts.length > 0 ? Math.min(...starts) : -1;
    if (start === -1) {
      const text = content.slice(i);
      if (text) parts.push({ type: 'text', text });
      break;
    }

    const before = content.slice(i, start);
    if (before) parts.push({ type: 'text', text: before });

    if (start === fenceStart) {
      const langStart = start + 3;
      const firstNewline = content.indexOf('\n', langStart);
      if (firstNewline === -1) {
        parts.push({ type: 'text', text: content.slice(start) });
        break;
      }

      const langLine = content.slice(langStart, firstNewline).trim();
      const end = content.indexOf('```', firstNewline + 1);
      if (end === -1) {
        parts.push({ type: 'text', text: content.slice(start) });
        break;
      }

      const code = content.slice(firstNewline + 1, end).replace(/\n$/, '');
      parts.push({ type: 'code', language: langLine || null, code });
      i = end + 3;
      continue;
    }

    const headerClose = content.indexOf(']]', start);
    if (headerClose === -1) {
      parts.push({ type: 'text', text: content.slice(start) });
      break;
    }

    const header = content.slice(start + 2, headerClose);
    const match = header.match(/lang\s*=\s*("?)([^"\s]+)\1/i);
    const language = match && typeof match[2] === 'string' ? match[2] : null;

    let bodyStart = headerClose + 2;
    if (content.startsWith('\r\n', bodyStart)) bodyStart += 2;
    else if (content.startsWith('\n', bodyStart) || content.startsWith('\r', bodyStart)) bodyStart += 1;

    const endMarker = upper.indexOf('[[/SNIPPET]]', bodyStart);
    if (endMarker === -1) {
      parts.push({ type: 'text', text: content.slice(start) });
      break;
    }

    const code = content.slice(bodyStart, endMarker).replace(/\n$/, '');
    parts.push({ type: 'code', language, code });
    i = endMarker + '[[/SNIPPET]]'.length;
  }

  return parts;
}

export function PostView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deletePostMutation = useDeletePost();
  const state = (location.state ?? {}) as PostViewState;
  const [comments, setComments] = useState<CommentCardProps[]>([]);
  const [newComment, setNewComment] = useState('');
  const [post, setPost] = useState<PostData>(() => ({
    id: id ?? '',
    title: state.title ?? '',
    content: state.content ?? '',
    languages: normalizeLanguages(state.languages),
    isOwner: false,
  }));

  const contentParts = useMemo(() => parseContentBlocks(post.content ?? ''), [post.content]);

  useEffect(() => {
    setPost({
      id: id ?? '',
      title: state.title ?? '',
      content: state.content ?? '',
      languages: normalizeLanguages(state.languages),
      isOwner: false,
    });
  }, [id, state.content, state.languages, state.title]);

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      const data = {
        content: newComment,
        anonymous: false,
      };

      await postService.addComments(id!, data);
      window.location.reload();
    } catch (err) {
      console.error('Erro ao adicionar conmentário: ', err);
    }
  }

  useEffect(() => {
    async function loadComments() {
      try {
        if (!id) return;
        const data = await postService.getCommentsByPostId(id!);
        setComments(data);
      } catch (err) {
        console.error('Erro ao buscar os comentários: ', err);
      }
    }

    loadComments();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const postId: string = id;
    let cancelled = false;

    async function loadPost() {
      try {
        const payload = await postService.getPostById(postId);
        const raw =
          (payload && typeof payload === 'object' && 'data' in payload && (payload as any).data) ||
          (payload && typeof payload === 'object' && 'post' in payload && (payload as any).post) ||
          payload;

        const nextTitle = typeof raw?.title === 'string' ? raw.title : state.title ?? '';
        const nextContent = typeof raw?.content === 'string' ? raw.content : state.content ?? '';
        const rawLanguages = Array.isArray(raw?.languages) ? (raw.languages as unknown[]) : null;
        const nextLanguages = rawLanguages
          ? rawLanguages
              .map(normalizeLanguage)
              .filter((v: string | null): v is string => Boolean(v))
          : Array.isArray(state.languages)
            ? normalizeLanguages(state.languages)
            : [];
        const nextIsOwner = typeof raw?.isOwner === 'boolean' ? raw.isOwner : false;

        if (!cancelled) {
          setPost({ id: postId, title: nextTitle, content: nextContent, languages: nextLanguages, isOwner: nextIsOwner });
        }
      } catch {
        if (!cancelled) {
          setPost((prev) => ({
            title: prev.title || state.title || '',
            content: prev.content || state.content || '',
            languages:
              Array.isArray(prev.languages) && prev.languages.length > 0
                ? prev.languages
                : normalizeLanguages(state.languages),
            id: prev.id || postId,
            isOwner: prev.isOwner ?? false,
          }));
        }
      }
    }

    void loadPost();
    return () => {
      cancelled = true;
    };
  }, [id, state.content, state.languages, state.title]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
              <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-main-color text-2xl break-all">{post.title}</span>
                  {post.isOwner && state.from === 'profile' ? (
                    <div className="relative">
                      <PostOptionsMenu
                        onDelete={() => {
                          const confirmed = window.confirm('Deseja apagar este post?');
                          if (!confirmed) return;
                          void deletePostMutation
                            .mutateAsync({ postId: post.id })
                            .then(() => queryClient.invalidateQueries({ queryKey: ['posts'] }))
                            .then(() => navigate('/profile', { replace: true }))
                            .catch(() => {});
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-main-color" />

                {Array.isArray(post.languages) && post.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.languages.map((lang, idx) => (
                      <span
                        key={`${lang}-${idx}`}
                        className="px-3 py-1 rounded-full border border-zinc-300 text-xs uppercase tracking-wide text-main-color bg-white"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  {contentParts.map((part, idx) => {
                    if (part.type === 'code') {
                      const lineHeightPx = 18;
                      const heightPx = getPreviewEditorHeightPx({ code: part.code, lineHeightPx });

                      return (
                        <div
                          key={`code-${idx}`}
                          className="w-full rounded-2xl border border-zinc-200 overflow-hidden bg-default-color"
                          style={{ transform: 'translateZ(0)' }}
                        >
                          <div className="px-3 py-1.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between gap-3">
                            <div className="text-xs uppercase tracking-wide text-main-color">
                              {part.language ?? 'snippet'}
                            </div>
                            <button
                              type="button"
                              className="h-7 px-3 rounded-full border border-zinc-300 bg-white text-main-color text-xs font-semibold hover:bg-zinc-200 transition-colors"
                              onClick={() => void copyToClipboard(part.code)}
                            >
                              Copiar
                            </button>
                          </div>
                          <pre
                            className="p-3 overflow-auto bg-zinc-900 text-zinc-100 text-sm whitespace-pre"
                            style={{
                              maxHeight: heightPx,
                              lineHeight: `${lineHeightPx}px`,
                            }}
                          >
                            {part.code}
                          </pre>
                        </div>
                      );
                    }

                    const normalizedText = part.text
                      .replace(/\r\n/g, '\n')
                      .replace(/\n{3,}/g, '\n\n')
                      .replace(/^\n+/, '')
                      .replace(/\n+$/, '\n');

                    if (!normalizedText.trim()) return null;

                    return (
                      <span key={`text-${idx}`} className="text-main-color whitespace-pre-wrap break-all">
                        {normalizedText}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-main-color w-max">
                  <button className="active:scale-92 transition-colors group">
                    <ArrowBigUp
                      className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                      fill={false ? '#263F4C' : 'none'}
                      onClick={() => {}}
                    />
                  </button>

                  <p className="text-sm font-medium leading-none">400</p>

                  <button className="active:scale-92 transition-colors group">
                    <ArrowBigDown
                      className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                      fill={false ? '#263F4C' : 'none'}
                      onClick={() => {}}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-main-color">
                  <button className="p-1 group active:scale-92">
                    <MessageSquareMore className="group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer" />
                  </button>
                  <span className="text-sm text-main-color">42</span>
                </div>

                <div className="flex items-center gap-1 text-main-color">
                  <Eye />
                  <span className="text-sm">1.200</span>
                </div>

                <p className="text-sm text-main-color ml-4 ">Há 4 dias</p>

                <button className="ml-auto p-2 active:scale-92 transition-colors group">
                  <Bookmark
                    size={22}
                    className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                  />
                </button>
              </div>

              <div className="border-t border-second" />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-1 space-y-8">
              <div className="w-full rounded-3xl border border-main-color bg-default-color p-4 flex flex-col gap-2">
                <textarea
                  className="w-full rounded-xl border border-zinc-300 p-3 focus:outline-none focus:ring-1 focus:ring-main-color resize-none"
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    className="bg-main-color text-white px-4 py-2 rounded-xl hover:bg-main-color/90 transition-colors cursor-pointer"
                    onClick={handleAddComment}
                  >
                    Comentar
                  </button>
                </div>
              </div>

              {comments.map((comment: CommentCardProps, idx: number) => (
                <CommentCard key={`${comment.user?.user_name ?? 'user'}-${idx}`} content={comment.content} user={comment.user} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
