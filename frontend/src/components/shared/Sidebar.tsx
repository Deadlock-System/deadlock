import { Bookmark, Plus } from 'lucide-react';

export function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-20 h-full w-20 flex-col items-center z-20 border-r border-r-gray-200 bg-default-color">
        <div className="mt-32 space-y-10">
          <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-zinc-200 transition-colors">
            <Bookmark size={30} strokeWidth={2} className="text-zinc-600" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-zinc-200 transition-colors">
            <Plus size={30} strokeWidth={2} className="text-zinc-600" />
          </button>
        </div>

        <div className="absolute bottom-28 flex flex-col items-center gap-4">
          <div className="w-full border-t-2 border-zinc-600" />
          <button className="w-13 h-13 rounded-full bg-zinc-800 overflow-hidden hover:ring-2 hover:ring-zinc-400 transition-all">
            <div className="w-full h-full bg-linear-to-br from-zinc-600 to-zinc-900" />
          </button>
        </div>
      </aside>
    </>
  );
}
