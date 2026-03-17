'use client';

import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Email"
        className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        aria-label="Email for updates"
      />
      <Button type="submit" className="bg-[#1e40af] hover:bg-[#2563eb] text-white">
        Subscribe
      </Button>
    </form>
  );
}
