import { CurrencyCode } from '../types/klave';

export const USD_TO_NGN_RATE = 1600;

export function formatPrice(priceUsd: number, currency: CurrencyCode): string {
  if (currency === 'NGN') {
    const ngn = Math.round(priceUsd * USD_TO_NGN_RATE);
    return `₦${ngn.toLocaleString('en-NG')}`;
  }
  return `$${priceUsd.toLocaleString('en-US')}`;
}

export function formatDuration(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const form = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${form}`;
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}
