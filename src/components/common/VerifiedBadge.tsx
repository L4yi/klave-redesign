import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  stemCount?: number;
  compact?: boolean;
  onClick?: () => void;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  stemCount,
  compact = false,
  onClick,
}) => {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title="100% Human-Made · Verified via Producer Stem Upload"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-tech text-[10px] font-medium uppercase tracking-wider transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-400/50' : ''
      }`}
      style={{
        backgroundColor: 'var(--verified-soft)',
        borderColor: 'rgba(59, 130, 246, 0.25)',
        color: 'var(--verified)',
      }}
    >
      <ShieldCheck className="h-3 w-3 shrink-0" />
      {compact ? (
        <span>{stemCount ? `${stemCount} STEMS` : 'VERIFIED'}</span>
      ) : (
        <span>{stemCount ? `HUMAN-MADE · ${stemCount} STEMS` : '100% HUMAN-MADE'}</span>
      )}
    </Tag>
  );
};
