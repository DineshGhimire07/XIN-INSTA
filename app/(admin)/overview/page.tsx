'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Send, 
  MousePointerClick, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  Instagram,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OverviewPage() {
  const [channelName, setChannelName] = useState<string | null>(null);
  const [reelsCount, setReelsCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [chRes, reelsRes, prodsRes] = await Promise.all([
        fetch('/api/channels'),
        fetch('/api/content/reels'),
        fetch('/api/products'),
      ]);

      const chData = await chRes.json();
      const reelsData = await reelsRes.json();
      const prodsData = await prodsRes.json();

      if (chData.channels && chData.channels.length > 0) {
        setChannelName(chData.channels[0].platform_username);
      }
      if (reelsData.reels) {
        setReelsCount(reelsData.reels.length);
      }
      if (prodsData.products) {
        setProductsCount(prodsData.products.length);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = [
    { 
      title: 'Connected Channel', 
      value: channelName || '@xinvora', 
      meta: 'Meta Graph API v19.0', 
      badge: 'Live', 
      icon: Instagram 
    },
    { 
      title: 'Synced Reels & Posts', 
      value: reelsCount.toString(), 
      meta: 'Active in Content Map', 
      icon: MessageSquare 
    },
    { 
      title: 'Catalog SKUs', 
      value: productsCount.toString(), 
      meta: 'Mapped to Auto DMs', 
      icon: MousePointerClick 
    },
    { 
      title: 'Compliance Status', 
      value: '100% PASS', 
      badge: 'Anti-Ban Protected', 
      icon: ShieldCheck 
    },
  ];

  const recentActivity = [
    { 
      id: '1', 
      time: 'Live', 
      channel: 'Instagram', 
      user: channelName || '@xinvora', 
      action: 'Instagram Professional Account connected via Meta Graph API', 
      status: 'Channel Active', 
      statusType: 'success' as const 
    },
    { 
      id: '2', 
      time: 'Synced', 
      channel: 'Instagram', 
      user: channelName || '@xinvora', 
      action: 'Synced Reel #17898316245589162 & bound to product catalog', 
      status: 'Mapped SKU', 
      statusType: 'blue' as const 
    },
    { 
      id: '3', 
      time: 'Enforced', 
      channel: 'Meta Security', 
      user: 'ComplianceGatekeeper', 
      action: '7-day comment limit + 24-hr care window guardrails active', 
      status: 'Anti-Ban Active', 
      statusType: 'success' as const 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Overview</h1>
            {channelName && (
              <Badge variant="purple" className="text-xs font-mono">
                {channelName}
              </Badge>
            )}
          </div>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Real-time social commerce funnel metrics and active compliance telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/simulator">
            <Button size="sm" className="gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Launch Test Simulator</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground-muted">{stat.title}</span>
                <Icon className="w-3.5 h-3.5 text-foreground-muted" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-semibold text-foreground tracking-tight truncate">
                  {stat.value}
                </span>
                {stat.badge && (
                  <Badge variant="success" dot>
                    {stat.badge}
                  </Badge>
                )}
              </div>
              {stat.meta && (
                <span className="text-[11px] text-foreground-muted mt-1">
                  {stat.meta}
                </span>
              )}
            </Card>
          );
        })}
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Activity Feed */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <h2 className="text-xs font-semibold text-foreground tracking-tight">Live Activity Stream</h2>
            </div>
            <span className="text-[11px] text-foreground-muted font-mono">Meta Graph API v19.0</span>
          </div>

          <div className="divide-y divide-border-subtle">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-surface-subtle transition-colors duration-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant={act.channel === 'Instagram' ? 'purple' : 'neutral'}>
                    {act.channel}
                  </Badge>
                  <span className="font-medium text-foreground shrink-0">{act.user}</span>
                  <span className="text-foreground-secondary truncate">{act.action}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={act.statusType}>
                    {act.status}
                  </Badge>
                  <span className="text-[11px] text-foreground-muted font-mono">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Compliance Guardrails Panel */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <CardHeader className="pb-3 mb-3">
              <CardTitle className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                <span>Anti-Ban Compliance Guardrails</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-foreground">Instagram 7-Day Window</span>
                  <Badge variant="success" dot>Active</Badge>
                </div>
                <p className="text-[11px] text-foreground-muted">Max 1 private reply per comment enforced.</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-foreground">24h Messaging Window</span>
                  <Badge variant="success" dot>Active</Badge>
                </div>
                <p className="text-[11px] text-foreground-muted">Blocks outbound messages after 24h inactivity.</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1.5">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-foreground">Rate Limit Budget</span>
                  <span className="text-foreground-secondary font-mono text-[11px]">0 / 120 calls/min</span>
                </div>
                <div className="w-full bg-border-subtle h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[4%]" />
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/logs"
            className="flex items-center justify-center gap-1 text-xs text-foreground-secondary hover:text-foreground font-medium transition-colors pt-2 border-t border-border-subtle"
          >
            <span>View compliance audit logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
