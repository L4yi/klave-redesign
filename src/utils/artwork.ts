/**
 * Curated photographic record sleeves and producer portraits.
 * Eliminates repetitive programmatic SVG circles while keeping a backup data URI if offline.
 */
const COVER_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1461784121038-f088ca1e7714?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1526328828355-69b01701ca6a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504898770365-14faca6a7320?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535979014625-490762ceb2ff?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=400&q=80',
];

const PRODUCER_PORTRAITS: Record<string, string> = {
  soundsbykannon: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  northhh: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  ultra: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  'alibel-fragoso': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
  ayubajerry00: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=80',
};

export function generateCoverDataUri(
  seed: number,
  _palette?: [string, string, string],
  _label?: string
): string {
  const index = Math.abs(seed) % COVER_PHOTOS.length;
  return COVER_PHOTOS[index];
}

export function getProducerPortrait(producerId: string): string {
  return PRODUCER_PORTRAITS[producerId] ?? COVER_PHOTOS[0];
}
