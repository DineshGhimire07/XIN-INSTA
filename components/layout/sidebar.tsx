'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  Megaphone,
  PlaySquare, 
  ScrollText, 
  Settings, 
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core Commerce',
    items: [
      { name: 'Overview', href: '/overview', icon: LayoutDashboard },
      { name: 'Products Catalog', href: '/products', icon: ShoppingBag },
      { name: 'Content Mapping', href: '/content-map', icon: Layers },
    ],
  },
  {
    label: 'Automation & Engine',
    items: [
      { name: 'Automation Studio', href: '/automations', icon: Sparkles },
      { name: 'Test Simulator', href: '/simulator', icon: PlaySquare },
    ],
  },
  {
    label: 'Engagement & CRM',
    items: [
      { name: 'Unified Inbox', href: '/inbox', icon: MessageSquare, badge: 'Live' },
      { name: 'Social Campaigns', href: '/campaigns', icon: Megaphone },
    ],
  },
  {
    label: 'Governance & System',
    items: [
      { name: 'Audit Logs', href: '/logs', icon: ScrollText },
      { name: 'Settings & Meta Auth', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#121215] border-r border-[#27272a] flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            X
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              XINVORA
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block -mt-0.5">
              Social Commerce Engine
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-emerald-400 border border-emerald-500/20 font-semibold">
          LIVE
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#18181b] text-white font-semibold shadow-sm border border-[#27272a]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-blue-500' : 'text-zinc-400')} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Compliance Policy Gatekeeper Footer */}
      <div className="p-3 border-t border-[#27272a]">
        <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-zinc-200">Compliance Gate</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono">100% OK</span>
          </div>
          <p className="text-[11px] text-zinc-400">Meta 24h & 7d private reply guard active</p>
        </div>
      </div>
    </aside>
  );
}
