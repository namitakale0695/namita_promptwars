import React from 'react';

interface BlindSpotLogoProps {
  size?: number;
  wordmark?: boolean;
  className?: string;
}

export default function BlindSpotLogo({
  size = 32,
  wordmark = true,
  className = '',
}: BlindSpotLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}
      aria-label={wordmark ? 'BLIND SPOT' : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        role={wordmark ? undefined : 'img'}
        aria-label={wordmark ? undefined : 'BLIND SPOT mark'}
        aria-hidden={wordmark ? true : undefined}
      >
        <path
          d="M3.5 16C6.8 10.7 11.1 8 16 8s9.2 2.7 12.5 8C25.2 21.3 20.9 24 16 24S6.8 21.3 3.5 16Z"
          stroke="#7CE7C4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="4" stroke="#7CE7C4" strokeWidth="2" />
        <circle cx="22.25" cy="10.75" r="1.75" fill="#FFC857" />
      </svg>
      {wordmark && (
        <span className="whitespace-nowrap text-[0.95rem] font-semibold tracking-[0.045em] text-[#F5F7F4]">
          BLIND SPOT
        </span>
      )}
    </span>
  );
}
