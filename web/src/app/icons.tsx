interface IconProps {
  className?: string;
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPaw({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="7" cy="9" r="2" />
      <circle cx="12" cy="6.5" r="2.2" />
      <circle cx="17" cy="9" r="2" />
      <path d="M12 11c-3.2 0-5.8 2.3-5.8 5.1 0 1.7 1.4 2.9 3.1 2.9.9 0 1.5-.3 2.2-.6.4-.2.9-.4 1.5-.4s1.1.2 1.5.4c.7.3 1.3.6 2.2.6 1.7 0 3.1-1.2 3.1-2.9 0-2.8-2.6-5.1-5.8-5.1z" />
    </svg>
  );
}

export function IconNose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <ellipse cx="12" cy="9" rx="6" ry="4" />
      <path d="M12 13v3m0 0c-2.5 0-4.5 1.5-4.5 3.5h9c0-2-2-3.5-4.5-3.5z" />
    </svg>
  );
}

export function IconFootprint({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <ellipse cx="12" cy="14" rx="5" ry="7" />
      <circle cx="8.5" cy="4.5" r="1.4" />
      <circle cx="12" cy="3" r="1.4" />
      <circle cx="15.5" cy="4.5" r="1.4" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconChevrons({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M5 17l7-6-7-6M19 17l-7-6 7-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMap({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCruz({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
