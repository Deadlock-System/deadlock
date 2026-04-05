import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Eye,
  MessageSquareMore,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface PostCardProps {
  id: string;
  username: string;
  title: string;
  content: string;
  // comments: number;
  // createdAt: string;
}

export function PostCard(props: PostCardProps) {
  const [filled, setFilled] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800" />
        <span className="text-main-color">@{props.username}</span>
      </div>

      <div className="border-t border-main-color" />

      <div
        onClick={() =>
          navigate(`/postview/${props.id}`, {
            state: { title: props.title, content: props.content },
          })
        }
        className="flex flex-col gap-2 cursor-pointer"
      >
        <span className="text-main-color text-2xl">{props.title}</span>
        <span className="text-main-color">{props.content}</span>
      </div>

      <div className="border-t border-main-color" />

      <div className="hidden sm:flex items-center gap-4">
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
    </div>
  );
}
