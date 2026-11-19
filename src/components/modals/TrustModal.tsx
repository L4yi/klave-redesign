import React from 'react';
import { FileArchive, Layers, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TrustModal: React.FC = () => {
  const { trustModalOpen, setTrustModalOpen, navigate } = useApp();

  if (!trustModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        className="w-full max-w-xl rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--verified-soft)', color: 'var(--verified)' }}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">100% Human-Made Stem Verification</h2>
              <p className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
                Zero AI-generated audio. Every producer is verified by stem upload.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTrustModalOpen(false)}
            aria-label="Close modal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex gap-3 rounded-xl border p-3.5" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <FileArchive className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div className="text-sm font-semibold">1. Mandatory Multi-Track Stems Upload</div>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Producers cannot publish a beat with only a stereo bounce. Separate kick, snare, bass,
                and melodic bus stems are required.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border p-3.5" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <Layers className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--verified)' }} />
            <div>
              <div className="text-sm font-semibold">2. Phase &amp; DAW Provenance Audit</div>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Stem channels are checked for clean isolation and summed against the preview master to
                confirm authentic DAW arrangement.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setTrustModalOpen(false);
              navigate('studio');
            }}
            className="cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            Try Producer Upload Flow
          </button>
          <button
            type="button"
            onClick={() => setTrustModalOpen(false)}
            className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
