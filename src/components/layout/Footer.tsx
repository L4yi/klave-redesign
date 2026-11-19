import React from 'react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate, setTrustModalOpen, setNeroOpen } = useApp();

  return (
    <footer
      className="mt-16 border-t pt-8 pb-28 md:pb-24"
      style={{
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="font-display text-sm font-extrabold tracking-[0.22em]">
            KL<span style={{ color: 'var(--accent-bright)' }}>A</span>VE
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            100% human-made beats. Every producer is verified by stem upload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
          <button type="button" onClick={() => navigate('discover')} className="cursor-pointer hover:underline">
            Beats
          </button>
          <button type="button" onClick={() => navigate('browse')} className="cursor-pointer hover:underline">
            Search
          </button>
          <button type="button" onClick={() => navigate('producers')} className="cursor-pointer hover:underline">
            Producers
          </button>
          <button type="button" onClick={() => navigate('studio')} className="cursor-pointer hover:underline">
            Sell Beats
          </button>
          <button type="button" onClick={() => setNeroOpen(true)} className="cursor-pointer hover:underline">
            NERO
          </button>
          <button type="button" onClick={() => setTrustModalOpen(true)} className="cursor-pointer hover:underline">
            Stem Verification
          </button>
        </div>
      </div>
    </footer>
  );
};
