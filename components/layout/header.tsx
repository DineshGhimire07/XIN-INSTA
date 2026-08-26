'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Activity, Instagram, Facebook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] || 'overview';
  const pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');

  return (
    <header className="h-16 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 select-none">
      {/* Breadcrumb Context */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-zinc-400 font-medium">XINVORA Platform</span>
        <span className="text-xs text-zinc-600">/</span>
        <h1 className="text-xs font-semibold text-white">{pageTitle}</h1>
      </div>

      {/* Meta API & Active Account Status */}
      <div className="flex items-center gap-3">
        <Badge variant="blue" dot>
          Meta Graph v19.0
        </Badge>
        <Badge variant="success" dot>
          Gatekeeper Online
        </Badge>

        <div className="h-4 w-px bg-[#27272a] mx-1" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181b] border border-[#27272a]">
            <Instagram className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs font-semibold text-zinc-200">@xinvora</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-xs font-bold text-white">
            XV
          </div>
        </div>
      </div>
    </header>
  );
}
