import React from 'react';
import { Compass, Disc3, LayoutDashboard, Search, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types/klave';

export const MobileNav: React.FC = () => {
  const { view, navigate } = useApp();

  const items: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'discover', label: 'Discover', icon: <Compass className="h-4 w-4" /> },
    { id: 'browse', label: 'Catalog', icon: <Search className="h-4 w-4" /> },
    { id: 'producers', label: 'Roster', icon: <Disc3 className="h-4 w-4" /> },
    { id: 'studio', label: 'Studio', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t backdrop-blur-2xl md:hidden"
      style={{
        backgroundColor: 'var(--bg-glass)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {items.map((item) => {
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.id)}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 text-[10px] font-semibold"
            style={{ color: active ? 'var(--accent-bright)' : 'var(--text-muted)' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
