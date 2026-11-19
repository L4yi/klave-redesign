import React, { useMemo, useState } from 'react';
import { Check, FileAudio, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LicenseTierId } from '../../types/klave';
import { generateCoverDataUri } from '../../utils/artwork';
import { formatPrice } from '../../utils/format';

const TIER_ORDER: LicenseTierId[] = ['mp3', 'wav', 'stems', 'exclusive'];

export const LicenseModal: React.FC = () => {
  const {
    licenseModalBeat,
    closeLicenseModal,
    currency,
    addToCart,
    setCartOpen,
  } = useApp();

  const [selectedTier, setSelectedTier] = useState<LicenseTierId>('wav');

  const coverUri = useMemo(() => {
    if (!licenseModalBeat) return '';
    return generateCoverDataUri(
      licenseModalBeat.coverSeed,
      licenseModalBeat.palette,
      `${licenseModalBeat.bpm} BPM`
    );
  }, [licenseModalBeat]);

  if (!licenseModalBeat) return null;

  const availableTiers = TIER_ORDER.filter(
    (id) => id !== 'exclusive' || licenseModalBeat.exclusiveAvailable
  );
  const activeTierId = availableTiers.includes(selectedTier) ? selectedTier : 'mp3';
  const activeTier = licenseModalBeat.licenses[activeTierId];

  const handleAddAndStay = () => {
    addToCart(licenseModalBeat.id, activeTierId);
    closeLicenseModal();
  };

  const handleBuyNow = () => {
    addToCart(licenseModalBeat.id, activeTierId);
    closeLicenseModal();
    setCartOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-modal-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-4 border-b p-5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <img src={coverUri} alt={licenseModalBeat.title} className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="license-modal-title" className="truncate text-lg font-bold">
                  {licenseModalBeat.title}
                </h2>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono-tech text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--verified-soft)', color: 'var(--verified)' }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {licenseModalBeat.stemCount} Stems Verified
                </span>
              </div>
              <p className="mt-0.5 font-mono-tech text-xs" style={{ color: 'var(--text-secondary)' }}>
                prod. {licenseModalBeat.producerName} · {licenseModalBeat.genre} · {licenseModalBeat.bpm} BPM ·{' '}
                {licenseModalBeat.musicalKey}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLicenseModal}
            aria-label="Close licensing modal"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tier Selector Grid */}
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-tech text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Select License Tier
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--verified)' }}>
              Bundle 2+ beats in cart for 15% off leases
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {availableTiers.map((tierId) => {
              const tier = licenseModalBeat.licenses[tierId];
              const isSelected = tierId === activeTierId;
              return (
                <button
                  key={tierId}
                  type="button"
                  onClick={() => setSelectedTier(tierId)}
                  className="flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {tier.name}
                      </div>
                      <div className="mt-0.5 font-mono-tech text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {tier.formats.join(' + ')}
                      </div>
                    </div>
                    <div className="font-mono-tech text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(tier.priceUsd, currency)}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                      <span>{tier.streamsLimit}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                      <span>{tier.musicVideos}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <FileAudio
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: tier.stemsIncluded ? 'var(--verified)' : 'var(--text-muted)' }}
                      />
                      <span>
                        {tier.stemsIncluded
                          ? `Includes all ${licenseModalBeat.stemCount} individual WAV stems`
                          : tier.distribution}
                      </span>
                    </li>
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="flex flex-col items-stretch justify-between gap-3 border-t p-5 sm:flex-row sm:items-center"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <div>
            <div className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
              {activeTier.name} · Instant PDF Contract + Files
            </div>
            <div className="font-mono-tech text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {formatPrice(activeTier.priceUsd, currency)}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddAndStay}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:flex-initial"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 sm:flex-initial"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
