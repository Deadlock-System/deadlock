import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Eye,
  MessageSquareMore,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../config/Env';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { UserIcon } from './UserIcon';

interface PostCardProps {
  id: string;
  username: string;
  title: string;
  content: string;
  avatarSrc?: string;
  languages?: unknown[];
  showMenu?: boolean;
  onDelete?: () => void;
  navigateState?: Record<string, unknown>;
  // comments: number;
  createdAt: string;
}

function stripSnippetBlocks(content: string) {
  return content
    .replace(/\[\[SNIPPET[^\]]*\]\][\s\S]*?\[\[\/SNIPPET\]\]/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

export function PostCard(props: PostCardProps) {
  const [filled, setFilled] = useState(false);
  const navigate = useNavigate();
  const displayContent = stripSnippetBlocks(props.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const dateToPostCard = props.createdAt
    ? formatDistanceToNow(new Date(props.createdAt), {
        addSuffix: true,
        locale: ptBR,
      })
    : '';

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 w-full">
        {props.avatarSrc ? (
          <img
            src={props.avatarSrc}
            alt="Foto do autor"
            className="w-12 h-12 rounded-full object-cover border border-zinc-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-zinc-800" />
        )}
        <span className="text-main-color text-lg font-bold ">
          @{props.username}
        </span>

        {props.showMenu ? (
          <div className="ml-auto relative">
            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center"
              aria-label="Opções"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              onBlur={() => setMenuOpen(false)}
            >
              <span
                aria-hidden="true"
                className="text-xl leading-none text-main-color"
              >
                ⋮
              </span>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden z-10">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-zinc-100 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    props.onDelete?.();
                  }}
                >
                  Apagar post
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-main-color" />

      <div
        onClick={() =>
          navigate(`/postview/${props.id}`, {
            state: {
              title: props.title,
              content: props.content,
              languages: props.languages ?? [],
              ...(props.navigateState ?? {}),
            },
          })
        }
        className="flex flex-col gap-2 cursor-pointer"
      >
        <span className="text-main-color text-2xl break-all">
          {'<'} {props.title} {'/>'}
        </span>
        <span className="text-main-color whitespace-pre-wrap break-all">
          {displayContent}
        </span>
      </div>

      <div className="border-t border-main-color" />

      <div className="hidden sm:flex items-center gap-4">
        {env.showVotes && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-main-color w-max">
            <button className="active:scale-92 transition-colors group">
              <ArrowBigUp
                className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                fill={filled ? '#263F4C' : 'none'}
                onClick={() => setFilled(!filled)}
              />
            </button>

            <p className="text-sm font-medium leading-none">400</p>

            <button className="active:scale-92 transition-colors group">
              <ArrowBigDown
                className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                fill={filled ? '#263F4C' : 'none'}
                onClick={() => setFilled(!filled)}
              />
            </button>
          </div>
        )}

        {env.showComments && (
          <div className="flex items-center gap-1 text-main-color">
            <button className="p-1 group active:scale-92">
              <MessageSquareMore className="group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer" />
            </button>
            <span className="text-sm text-main-color">42</span>
          </div>
        )}

        {env.showViews && (
          <div className="flex items-center gap-1 text-main-color">
            <Eye />
            <span className="text-sm">1.200</span>
          </div>
        )}

        <p className="text-sm text-main-color ml-4 ">{dateToPostCard}</p>

        {env.showBookmark && (
          <button className="ml-auto p-2 active:scale-92 transition-colors group">
            <Bookmark
              size={22}
              className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
            />
          </button>
        )}
      </div>
    </div>
  );
}
