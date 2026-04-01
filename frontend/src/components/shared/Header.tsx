import { Search } from 'lucide-react';

export function Header() {
  return (
    <header
      className="sticky top-0 left-0 right-0 h-20 flex items-center justify-center px-8 bg-default-color border-b border-b-gray-300"
      // style={{ backgroundColor: '#00FF00', borderBottom: '1px solid #FF0000' }}
    >
      <div className="fixed left-5 hidden md:block">DeadLock Logo</div>
      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="text"
          placeholder="Pesquisar"
          className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-400 bg-white text-sm text-zinc-400 placeholder:-tracking-normal placeholder:uppercase focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
        />
      </div>
    </header>
  );
}
