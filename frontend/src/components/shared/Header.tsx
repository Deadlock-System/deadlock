import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-deadlock-sem-fundo.png';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 right-0 h-20 flex items-center justify-center px-8 bg-default-color border-b border-b-gray-300">
      <button
        type="button"
        className="fixed left-5 hidden md:flex items-center gap-3"
        onClick={() => navigate('/feed')}
        aria-label="Ir para o feed"
      >
        <img
          src={logo}
          alt="Deadlock"
          className="cursor-pointer h-10 w-auto object-contain"
        />
      </button>
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
