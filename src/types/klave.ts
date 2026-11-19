export type Genre = 'Afrobeats' | 'Trap' | 'Drill' | 'Boom Bap';

export type MoodTag =
  | 'Dark'
  | 'Sad'
  | 'Hype'
  | 'Chill'
  | 'Cinematic'
  | 'Rage'
  | 'Romantic'
  | 'Spiritual'
  | 'Trap';

export type LicenseTierId = 'mp3' | 'wav' | 'stems' | 'exclusive';

export type CurrencyCode = 'USD' | 'NGN';

export type UserRole = 'guest' | 'artist' | 'producer';

export type AppView = 'discover' | 'browse' | 'producers' | 'producer' | 'studio' | 'profile';

export interface LicenseTier {
  id: LicenseTierId;
  name: string;
  shortLabel: string;
  priceUsd: number;
  formats: string[];
  streamsLimit: string;
  musicVideos: string;
  distribution: string;
  stemsIncluded: boolean;
  exclusiveTransfer?: boolean;
}

export interface Producer {
  id: string;
  handle: string;
  displayName: string;
  location: string;
  bio: string;
  primaryGenre: Genre;
  daw: string;
  followers: number;
  totalPlays: number;
  verifiedStemsCount: number;
  beatCount: number;
  accentColor: string;
  initials: string;
  featuredBeatId: string;
}

export interface Beat {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  genre: Genre;
  bpm: number;
  musicalKey: string;
  durationSec: number;
  plays: number;
  moods: MoodTag[];
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  exclusiveAvailable: boolean;
  stemsVerified: boolean;
  stemCount: number;
  daw: string;
  uploadedAt: string;
  coverSeed: number;
  palette: [string, string, string];
  waveform: number[];
  licenses: Record<LicenseTierId, LicenseTier>;
}

export interface CuratedPlaylist {
  id: string;
  title: string;
  subtitle: string;
  curator: string;
  beatIds: string[];
  accent: string;
  tag: string;
}

export interface CartItem {
  beatId: string;
  tierId: LicenseTierId;
}

export interface PurchasedLicense {
  id: string;
  beatTitle: string;
  producerName: string;
  tierName: string;
  priceUsd: number;
  purchasedAt: string;
  stemCount: number;
}
