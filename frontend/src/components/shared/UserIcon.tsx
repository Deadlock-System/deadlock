type UserIconSize = 'md' | 'lg';

interface IconProps {
  size?: UserIconSize;
}

export function UserIcon({ size = 'md' }: IconProps) {
  const sizeClasses: Record<UserIconSize, string> = {
    md: 'w-12 h-12',
    lg: 'w-32 h-32',
  };

  const style = `${sizeClasses[size]} rounded-full bg-zinc-800 overflow-hidden hover:ring-2 hover:ring-zinc-400 transition-all`;

  return <div className={style} />;
}
