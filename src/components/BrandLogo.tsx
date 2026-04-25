import React from 'react';

type Tone = 'dark' | 'light';

interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Decorative only (header), or labeled (standalone) */
  title?: string;
}

/**
 * Note Counter brand mark — pure inline SVG.
 * Stacked banknotes inside a soft indigo squircle, with an amber counter dot.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 36, className = '', title }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
    width={size}
    height={size}
    role={title ? 'img' : 'presentation'}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    className={className}
  >
    <defs>
      <linearGradient id="ncBrandGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#818cf8" />
        <stop offset="0.55" stopColor="#4f46e5" />
        <stop offset="1" stopColor="#3730a3" />
      </linearGradient>
      <linearGradient id="ncNoteGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="1" stopColor="#e0e7ff" stopOpacity="1" />
      </linearGradient>
    </defs>

    {/* Squircle background */}
    <rect width="40" height="40" rx="10" fill="url(#ncBrandGrad)" />

    {/* Soft inner highlight */}
    <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="none" stroke="white" strokeOpacity="0.12" />

    {/* Three stacked banknotes */}
    <rect x="8.5"  y="11.5" width="23" height="5" rx="1.8" fill="white" opacity="0.42" />
    <rect x="8.5"  y="18"   width="23" height="5" rx="1.8" fill="white" opacity="0.72" />
    <rect x="8.5"  y="24.5" width="23" height="5" rx="1.8" fill="url(#ncNoteGrad)" />

    {/* Strap detail on top note */}
    <rect x="13" y="25.6" width="3" height="2.8" rx="0.6" fill="#4f46e5" opacity="0.85" />

    {/* Counter / coin dot */}
    <circle cx="30.5" cy="11" r="4" fill="#fbbf24" stroke="white" strokeWidth="1.2" />
    <circle cx="30.5" cy="11" r="1.4" fill="#92400e" opacity="0.4" />
  </svg>
);

interface BrandLogoProps extends BrandMarkProps {
  showWordmark?: boolean;
  tone?: Tone;
}

/**
 * Brand mark + wordmark. Defaults look great in a dark header (`tone="dark"`).
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  className = '',
  showWordmark = true,
  tone = 'dark',
  title = 'Note Counter',
}) => {
  const wordTone = tone === 'dark' ? 'text-white' : 'text-ink-900';
  const subTone  = tone === 'dark' ? 'text-ink-300' : 'text-ink-500';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandMark size={size} title={title} />
      {showWordmark && (
        <span className="leading-none">
          <span className={`block text-base font-extrabold tracking-tight ${wordTone}`}>
            Note <span className="text-amber-400">Counter</span>
          </span>
          <span className={`block text-[10px] font-mono uppercase tracking-[0.2em] mt-0.5 ${subTone}`}>
            count · save · share
          </span>
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
