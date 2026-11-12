import { brand } from '@/brand'

// A sheet cell with a selection corner. Swap for your own mark.
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label={brand.name}
    >
      <rect x="2" y="2" width="28" height="28" rx="3" fill="var(--primary)" />
      <path
        d="M2 11h28M11 2v28"
        stroke="var(--primary-foreground)"
        strokeOpacity=".45"
      />
      <rect x="11" y="11" width="19" height="19" fill="var(--highlight)" />
      <rect x="25" y="25" width="5" height="5" fill="var(--edge)" />
    </svg>
  )
}
