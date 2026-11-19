import React, { useState } from 'react';
import { AudioLines, Bookmark, CheckCircle2, Download, Landmark, LogOut, UserCheck } from 'lucide-react';
import { BeatRow } from '../components/beats/BeatRow';
import { useApp } from '../context/AppContext';
import { BEATS, NIGERIAN_BANKS } from '../data/catalog';
import { formatPrice } from '../utils/format';

export const ProfilePage: React.FC = () => {
  const {
    role,
    setRole,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    compactMode,
    setCompactMode,
    reduceMotion,
    setReduceMotion,
    savedBeatIds,
    followedProducers,
    purchasedLicenses,
    showToast,
    openNeroWithMood,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'licenses' | 'saved' | 'settings'>('licenses');
  const [bank, setBank] = useState(NIGERIAN_BANKS[0]);
  const [accountNum, setAccountNum] = useState('');
  const [bankVerified, setBankVerified] = useState(false);

  const savedBeats = BEATS.filter((b) => savedBeatIds.includes(b.id));

  const handleVerifyBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(accountNum.trim())) {
      showToast('Enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }
    setBankVerified(true);
    showToast(`Verified payout account at ${bank}.`, 'success');
  };

  if (role === 'guest') {
    return (
      <div className="mx-auto max-w-md px-4 pt-12 sm:px-6">
        <div
          className="rounded-xl border p-6 text-center"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
          >
            <UserCheck className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-extrabold">Sign in to KLAVE</h1>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Access purchased stems, saved beats, and Nigerian bank referral payouts.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setRole('artist');
                showToast('Signed in as Artist', 'success');
              }}
              className="cursor-pointer rounded-md py-2.5 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Sign in as Artist
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('producer');
                showToast('Signed in as Producer', 'success');
              }}
              className="cursor-pointer rounded-md border py-2.5 text-xs font-semibold"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              Sign in as Producer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
      <section className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <span className="font-mono-tech text-[11px] uppercase" style={{ color: 'var(--accent-ice)' }}>
            {role} account
          </span>
          <h1 className="font-display text-2xl font-extrabold">
            {role === 'producer' ? 'Northhh' : 'Artist Account'}
          </h1>
          <p className="mt-0.5 font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
            {followedProducers.length} Following · {savedBeatIds.length} Saved · {purchasedLicenses.length} Licenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRole(role === 'artist' ? 'producer' : 'artist')}
            className="cursor-pointer rounded-md border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Switch to {role === 'artist' ? 'Producer' : 'Artist'}
          </button>
          {role === 'producer' && (
            <button
              type="button"
              onClick={() => navigate('studio')}
              className="cursor-pointer rounded-md px-3.5 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Upload Beats
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setRole('guest');
              showToast('Signed out');
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'licenses', label: `Purchased Licenses (${purchasedLicenses.length})` },
          { id: 'saved', label: `Saved Beats (${savedBeats.length})` },
          { id: 'settings', label: 'Settings & Referral Payout' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="cursor-pointer rounded-md border px-3.5 py-1.5 text-xs font-semibold transition"
              style={{
                backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                color: active ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'licenses' && (
        <div>
          {purchasedLicenses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold">No purchased licenses yet</p>
              <button
                type="button"
                onClick={() => openNeroWithMood('Dark')}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <AudioLines className="h-3.5 w-3.5" />
                Match Beats with NERO
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {purchasedLicenses.map((lic) => (
                <div key={lic.id} className="flex items-center justify-between py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <div className="text-sm font-bold">{lic.beatTitle}</div>
                    <div className="font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {lic.tierName} · prod. {lic.producerName} · {lic.purchasedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-sm font-bold">{formatPrice(lic.priceUsd, currency)}</span>
                    <button
                      type="button"
                      onClick={() => showToast(`Downloading files for ${lic.beatTitle}...`, 'success')}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedBeats.length === 0 ? (
            <div className="py-12 text-center">
              <Bookmark className="mx-auto mb-2 h-6 w-6" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-bold">No saved beats yet</p>
            </div>
          ) : (
            savedBeats.map((beat, idx) => <BeatRow key={beat.id} beat={beat} index={idx} />)
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="font-display text-base font-bold">Display</h2>
            {[
              { label: 'Light Mode', desc: 'Switch to light color scheme', checked: theme === 'light', onChange: toggleTheme },
              {
                label: 'Show Prices in Naira (₦)',
                desc: 'Display ₦ across the store',
                checked: currency === 'NGN',
                onChange: () => setCurrency(currency === 'NGN' ? 'USD' : 'NGN'),
              },
              {
                label: 'Compact Beat List',
                desc: 'Tighter rows, more beats on screen',
                checked: compactMode,
                onChange: () => setCompactMode(!compactMode),
              },
              {
                label: 'Reduce Motion',
                desc: 'Turn off animations and transitions',
                checked: reduceMotion,
                onChange: () => setReduceMotion(!reduceMotion),
              },
            ].map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-center justify-between border-b py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <input type="checkbox" checked={item.checked} onChange={item.onChange} className="h-4 w-4 accent-blue-600" />
              </label>
            ))}
          </div>

          <form onSubmit={handleVerifyBank} className="space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4" style={{ color: 'var(--accent-ice)' }} />
              <h2 className="font-display text-base font-bold">Referral Payout (NGN)</h2>
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Nigerian Bank
              </label>
              <select
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  setBankVerified(false);
                }}
                className="mt-1.5 h-10 w-full rounded-md border px-3 text-xs font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                10-Digit Account Number
              </label>
              <input
                type="text"
                maxLength={10}
                value={accountNum}
                onChange={(e) => {
                  setAccountNum(e.target.value.replace(/\D/g, ''));
                  setBankVerified(false);
                }}
                placeholder="0123456789"
                className="mt-1.5 h-10 w-full rounded-md border px-3 font-mono-tech text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {bankVerified && <CheckCircle2 className="h-4 w-4" />}
              {bankVerified ? `Verified · ${bank}` : 'Verify & Save'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
