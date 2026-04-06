import { ArrowBigDown, ArrowBigUp } from 'lucide-react';

export interface CommentCardProps {
  content: string;
  user: {
    user_name: string;
    user_photo: string;
  };
}

export function CommentCard(props: CommentCardProps) {
  console.log('Props: ', props);
  return (
    <div className="w-fit max-w-full rounded-3xl border border-gray-500 bg-default-color p-6 flex gap-3">
      <div className="w-12 h-12 rounded-full bg-zinc-800" />

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="text-main-color">{`@${props.user.user_name}`}</span>

        <span className="text-main-color break-words">{props.content}</span>
      </div>
      <div className="hidden sm:flex items-center gap-5 px-2 rounded-4xl border border-main-color h-8 w-max mt-auto">
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
    </div>
  );
}
