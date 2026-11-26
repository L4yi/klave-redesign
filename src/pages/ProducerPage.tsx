import React, { useMemo } from 'react';
import { ArrowLeft, MapPin, Play } from 'lucide-react';
import { BeatRow } from '../components/beats/BeatRow';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { useApp } from '../context/AppContext';
import { PRODUCERS } from '../data/catalog';
import { getProducerPortrait } from '../utils/artwork';
import { formatCompactNumber, pluralize } from '../utils/format';

export const ProducerPage: React.FC = () => {
  const {
    beats,
    selectedProducerId,
    navigate,
    followedProducers,
    toggleFollowProducer,
    playBeat,
    setTrustModalOpen,
  } = useApp();

  const producer = PRODUCERS.find((p) => p.id === selectedProducerId) ?? PRODUCERS[0];
  const producerBeats = useMemo(
    () => beats.filter((b) => b.producerId === producer.id),
    [producer.id, beats]
  );
  const featured = producerBeats.find((b) => b.id === producer.featuredBeatId) ?? producerBeats[0];
  const following = followedProducers.includes(producer.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 sm:px-6">
      <button
        type="button"
        onClick={() => navigate('producers')}
        className="inline-flex cursor-pointer items-center gap-1.5 font-mono-tech text-xs hover:underline"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Producers
      </button>

      {/* Storefront Header */}
      <section className="border-b pb-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="flex items-start gap-4">
            <img
              src={getProducerPortrait(producer.id)}
              alt={producer.displayName}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-extrabold tracking-tight">{producer.displayName}</h1>
                <VerifiedBadge onClick={() => setTrustModalOpen(true)} />
              </div>
              <p className="max-w-xl text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {producer.bio}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-0.5 font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {producer.location}
                </span>
                <span>{producer.daw}</span>
                <span>{pluralize(producerBeats.length, 'beat')}</span>
                <span>{formatCompactNumber(producer.totalPlays)} plays</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {featured && (
              <button
                type="button"
                onClick={() => playBeat(featured)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Play Featured
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleFollowProducer(producer.id)}
              className="cursor-pointer rounded-md border px-4 py-2 text-xs font-semibold"
              style={{
                backgroundColor: following ? 'var(--accent-soft)' : 'transparent',
                borderColor: following ? 'var(--border-strong)' : 'var(--border-subtle)',
                color: following ? 'var(--accent-ice)' : 'var(--text-primary)',
              }}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </section>

      {/* Producer Track Ledger */}
      <section className="space-y-2">
        <div className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
          {pluralize(producerBeats.length, 'beat')}
        </div>
        <div>
          {producerBeats.map((beat, idx) => (
            <BeatRow key={beat.id} beat={beat} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
};
