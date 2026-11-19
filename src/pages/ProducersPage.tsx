import React from 'react';
import { ArrowUpRight, MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCERS } from '../data/catalog';
import { getProducerPortrait } from '../utils/artwork';
import { formatCompactNumber, pluralize } from '../utils/format';

export const ProducersPage: React.FC = () => {
  const { navigate, followedProducers, toggleFollowProducer } = useApp();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6">
      <div className="border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Producers</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Verified by raw stem upload before listing on KLAVE.
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {PRODUCERS.map((producer) => {
          const following = followedProducers.includes(producer.id);
          return (
            <article
              key={producer.id}
              className="flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={getProducerPortrait(producer.id)}
                  alt={producer.displayName}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('producer', producer.id)}
                      className="font-display cursor-pointer text-base font-bold hover:underline"
                    >
                      {producer.displayName}
                    </button>
                    <ShieldCheck className="h-4 w-4" style={{ color: 'var(--accent-ice)' }} />
                    <span className="font-mono-tech text-xs" style={{ color: 'var(--text-muted)' }}>
                      {producer.handle}
                    </span>
                  </div>
                  <p className="max-w-xl text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {producer.bio}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-0.5 font-mono-tech text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {producer.location}
                    </span>
                    <span>{producer.primaryGenre}</span>
                    <span>{pluralize(producer.beatCount, 'beat')}</span>
                    <span>{formatCompactNumber(producer.totalPlays)} plays</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFollowProducer(producer.id)}
                  className="cursor-pointer rounded-md border px-3.5 py-2 text-xs font-semibold transition"
                  style={{
                    backgroundColor: following ? 'var(--accent-soft)' : 'transparent',
                    borderColor: following ? 'var(--border-strong)' : 'var(--border-subtle)',
                    color: following ? 'var(--accent-ice)' : 'var(--text-secondary)',
                  }}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('producer', producer.id)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-3.5 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Catalog <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
