import { useEffect, useState, type ReactNode } from 'react';

export type Route =
  | 'home'
  | 'community'
  | 'ask'
  | 'my-questions'
  | 'question'
  | 'live'
  | 'profile'
  | 'premium'
  | 'login'
  | 'signup';

function parseHash(): { route: Route; param?: string } {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path, param] = hash.split('/');

  const validRoutes: Route[] = [
    'home',
    'community',
    'ask',
    'my-questions',
    'question',
    'live',
    'profile',
    'premium',
    'login',
    'signup',
  ];

  const route = (validRoutes as string[]).includes(path)
    ? (path as Route)
    : 'home';

  return { route, param };
}

export function navigate(route: Route, param?: string) {
  const hash = param ? `/${route}/${param}` : `/${route}`;
  window.location.hash = hash;
}

export function useRoute() {
  const [current, setCurrent] = useState(parseHash());

  useEffect(() => {
    const handler = () => {
      setCurrent(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return current;
}

interface LinkProps {
  to: Route;
  param?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ to, param, children, className, onClick }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to, param);
    onClick?.();
  };

  return (
    <a href={`#/${to}${param ? `/${param}` : ''}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
