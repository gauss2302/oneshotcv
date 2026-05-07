'use client';

import Link from 'next/link';

export function HeroForm() {
  return (
    <form
      className="heroForm"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="input"
        type="email"
        placeholder="Work email"
        aria-label="Work email"
      />
      <Link href="/dashboard" className="btn primary">
        Get started
      </Link>
    </form>
  );
}
