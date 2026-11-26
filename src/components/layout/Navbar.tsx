import React from 'react';
import { AudioLines, Moon, Search, ShoppingBag, Sun, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types/klave';

export const Navbar: React.FC = () => {
  const {
    view,
    navigate,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    cart,
    setCartOpen,
    setNeroOpen,
    setTrustModalOpen,
    currentUser,
    userProfile,
    openAuthModal,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const navItems: { id: AppView; label: string }[] = [
    { id: 'discover', label: 'Beats' },
    { id: 'browse', label: 'Search' },
    { id: 'producers', label: 'Producers' },
    { id: 'studio', label: 'Sell Beats' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('browse');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--bg-glass)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Wordmark + Navigation */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate('discover')}
            className="cursor-pointer text-left font-display text-base font-extrabold tracking-[0.22em]"
          >
            KL<span style={{ color: 'var(--accent-bright)' }}>A</span>VE
          </button>

          <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const active = view === item.id || (item.id === 'producers' && view === 'producer');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className="cursor-pointer text-xs font-semibold transition-colors"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Inline Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden flex-1 max-w-xs lg:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beats, producers, BPM, key..."
            className="h-8 w-full rounded-md border pr-3 pl-8 text-xs outline-none transition focus:border-blue-500"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </form>

        {/* Right: Studio Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTrustModalOpen(true)}
            className="hidden cursor-pointer font-mono-tech text-[11px] transition hover:underline xl:inline-block"
            style={{ color: 'var(--text-secondary)' }}
          >
            No AI · Stems Verified
          </button>

          <button
            type="button"
            onClick={() => setNeroOpen(true)}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 font-mono-tech text-xs font-semibold transition hover:border-blue-500"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--border-strong)',
              color: 'var(--accent-ice)',
            }}
          >
            <AudioLines className="h-3.5 w-3.5" />
            <span>NERO</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrency(currency === 'USD' ? 'NGN' : 'USD')}
            title="Switch currency USD ($) / Naira (₦)"
            className="h-8 cursor-pointer rounded-md border px-2 font-mono-tech text-xs font-semibold transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {currency === 'USD' ? '$ USD' : '₦ NGN'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 font-mono-tech text-xs font-semibold transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{cart.length}</span>
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={() => navigate('profile')}
              aria-label="Open profile"
              className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition md:inline-flex"
              style={{
                backgroundColor: view === 'profile' ? 'var(--accent-soft)' : 'var(--bg-surface)',
                borderColor: view === 'profile' ? 'var(--border-strong)' : 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span className="max-w-[90px] truncate">
                {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-semibold text-white transition md:inline-flex"
              style={{
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-bright)',
              }}
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
