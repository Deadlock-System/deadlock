interface PostCardProps {
  username: string;
  title: string;
  content: string;
  comments: number;
  createdAt: string;
}

export function PostCard() {
  return (
    <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800" />
        <span className="text-zinc-900 text-[]">@zakendo</span>
      </div>

      <div className="border-t border-zinc-400" />

      <span
        className="text-zinc-900"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          fontSize: '25px',
          letterSpacing: '-0.6%',
          lineHeight: '20px',
        }}
      >
        Title
      </span>
    </div>
  );
}
