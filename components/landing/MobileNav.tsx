'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';

const PRODUCT_NAME = 'One Shot CV';
const BRAND_SLUG = 'oneshotcv';

const navLinks = [
  { href: '#features', label: 'Product' },
  { href: '#how-it-works', label: 'Solutions' },
  { href: '#pricing', label: 'Pricing' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="landing-mobile-nav-trigger"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <span className="landing-mobile-nav-icon" aria-hidden />
        <span className="landing-mobile-nav-icon" aria-hidden />
        <span className="landing-mobile-nav-icon" aria-hidden />
      </button>

      <div
        className="landing-mobile-nav-backdrop"
        aria-hidden={!open}
        data-open={open}
        onClick={close}
      />

      <aside
        className="landing-mobile-nav-drawer"
        aria-label="Primary navigation"
        data-open={open}
        role="dialog"
        aria-modal="true"
      >
        <div className="landing-mobile-nav-drawer-inner">
          <div className="landing-mobile-nav-header">
            <Link href="/" className="brand" onClick={close} aria-label={`${PRODUCT_NAME} home`}>
              <div className="logoMark" aria-hidden />
              <span>{BRAND_SLUG}</span>
            </Link>
            <button
              type="button"
              onClick={close}
              className="landing-mobile-nav-close"
              aria-label="Close menu"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          <nav className="landing-mobile-nav-links">
            <ul>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="landing-mobile-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="landing-mobile-nav-actions">
              <Link href="/login" className="btn" onClick={close}>
                Log in
              </Link>
              <Link href="/dashboard" className="btn primary" onClick={close}>
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
