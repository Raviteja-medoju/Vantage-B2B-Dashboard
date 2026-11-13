import { cx } from '@/lib/cx';
import s from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  const slot = (hash(name) % 8) + 1;
  return (
    <span className={cx(s.avatar, s[size], className)} style={{ ['--avatar-color' as string]: `var(--series-${slot})` }} role="img" aria-label={name} title={name} data-component="Avatar">
      {initials}
    </span>
  );
}
