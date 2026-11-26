import { Beat, Genre, LicenseTierId, LicenseTier, MoodTag } from '../types/klave';

export interface RawFirestoreBeat {
  id?: string;
  title?: string;
  prod?: string;
  producerName?: string;
  producerId?: string;
  genre?: string;
  bpm?: number | string;
  key?: string;
  musicalKey?: string;
  price?: number | string;
  exclPrice?: number | string;
  audioUrl?: string;
  previewUrl?: string;
  soldExclusive?: boolean;
  plays?: number;
  stemsVerified?: boolean;
  stemsUrl?: string;
  stemCount?: number;
  daw?: string;
  tags?: string[] | string;
  moods?: MoodTag[];
  uploadedAt?: string;
  createdAt?: unknown;
}

const DEFAULT_WAVEFORM = [
  30, 45, 60, 80, 65, 40, 55, 75, 90, 85, 60, 45, 70, 85, 95, 70,
  50, 40, 65, 80, 55, 40, 60, 75, 85, 65, 50, 65, 80, 95, 70, 55,
  40, 50, 75, 90, 70, 55, 65, 85, 95, 80, 60, 45, 70, 85, 60, 45,
  55, 75, 90, 65, 50, 60, 80, 95, 80, 60, 50, 65, 85, 70, 50, 40,
];

export function transformFirestoreBeat(raw: RawFirestoreBeat, docId: string): Beat {
  const priceNum = Math.max(7, Number(raw.price) || 29);
  const exclPriceNum = Math.max(100, Number(raw.exclPrice) || 299);

  // Normalize genre
  const rawGenre = String(raw.genre || 'Afrobeats');
  const validGenres: Genre[] = ['Afrobeats', 'Trap', 'Drill', 'Boom Bap'];
  const genre: Genre = validGenres.includes(rawGenre as Genre)
    ? (rawGenre as Genre)
    : 'Afrobeats';

  // Build license tiers based on price
  const licenses: Record<LicenseTierId, LicenseTier> = {
    mp3: {
      id: 'mp3',
      name: 'Standard MP3 Lease',
      shortLabel: 'MP3',
      priceUsd: priceNum,
      formats: ['MP3 (320 kbps)'],
      streamsLimit: '50,000 Streams',
      musicVideos: '1 Non-Monetized Video',
      distribution: 'Limited commercial release',
      stemsIncluded: false,
    },
    wav: {
      id: 'wav',
      name: 'High Quality WAV Lease',
      shortLabel: 'WAV',
      priceUsd: Math.round(priceNum * 1.6),
      formats: ['WAV (24-bit 44.1kHz)', 'MP3 (320 kbps)'],
      streamsLimit: '500,000 Streams',
      musicVideos: '2 Music Videos',
      distribution: 'Commercial release & streaming',
      stemsIncluded: false,
    },
    stems: {
      id: 'stems',
      name: 'Trackout Stems License',
      shortLabel: 'Stems',
      priceUsd: Math.round(priceNum * 2.8),
      formats: ['Isolated Audio Stems (ZIP)', 'WAV 24-bit', 'MP3'],
      streamsLimit: 'Unlimited Streams',
      musicVideos: 'Unlimited Videos',
      distribution: 'Full commercial release, remix, & sync',
      stemsIncluded: true,
    },
    exclusive: {
      id: 'exclusive',
      name: 'Exclusive Ownership & Transfer',
      shortLabel: 'Exclusive',
      priceUsd: exclPriceNum,
      formats: ['Full Master Rights', 'All Isolated Stems', 'WAV', 'MP3'],
      streamsLimit: 'Unlimited Streams',
      musicVideos: 'Unlimited Broadcasts',
      distribution: 'Full copyright buyout; beat removed from store',
      stemsIncluded: true,
      exclusiveTransfer: true,
    },
  };

  const parsedTags: string[] = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === 'string'
      ? raw.tags.split(',').map((t) => t.trim())
      : ['human-made', genre.toLowerCase()];

  return {
    id: docId,
    title: (raw.title || 'Untitled Beat').replace(/^\s*\d+\.(?!\d)\s*/, '').trim(),
    producerId: raw.producerId || 'producer-klave',
    producerName: raw.prod || raw.producerName || 'KLAVE Producer',
    genre,
    bpm: Number(raw.bpm) || 120,
    musicalKey: raw.musicalKey || raw.key || 'C minor',
    durationSec: 180,
    plays: typeof raw.plays === 'number' ? raw.plays : 140,
    moods: (Array.isArray(raw.moods) && raw.moods.length ? raw.moods : ['Hype', 'Dark']) as MoodTag[],
    tags: parsedTags,
    isNew: true,
    isTrending: false,
    exclusiveAvailable: !raw.soldExclusive,
    stemsVerified: raw.stemsVerified ?? true,
    stemCount: raw.stemCount || 16,
    daw: raw.daw || 'FL Studio 24',
    uploadedAt: typeof raw.uploadedAt === 'string' ? raw.uploadedAt : 'Recently',
    coverSeed: (docId.charCodeAt(0) || 5) * 17,
    palette: ['#0f172a', '#2563eb', '#60a5fa'],
    waveform: DEFAULT_WAVEFORM,
    licenses,
    audioUrl: raw.audioUrl,
    previewUrl: raw.previewUrl,
    soldExclusive: Boolean(raw.soldExclusive),
  };
}
