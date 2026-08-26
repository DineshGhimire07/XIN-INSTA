'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Send, 
  MousePointerClick, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp 
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OverviewPage() {
  const stats = [
    { title: 'Comments Today', value: '1,420', change: '+18.4%', trend: 'positive', icon: MessageSquare },
    { title: 'Automated DMs Sent', value: '1,394', meta: '98.2% delivered', trend: 'neutral', icon: Send },
    { title: 'Store Clicks (CTR)', value: '912', meta: '65.4% click-rate', trend: 'positive', icon: MousePointerClick },
    { title: 'Needs Attention', value: '3', badge: 'Active', trend: 'warning', icon: AlertCircle },
  ];

  const recentActivity = [
    { id: '1', time: '14:24', channel: 'Instagram', user: '@anita_shrestha', action: 'Commented "link please" on Reel #42', status: 'Sent DRESS-001', statusType: 'success' as const },
    { id: '2', time: '14:22', channel: 'Facebook', user: '@ram_kumar', action: 'Commented "price" on Post #12', status: 'Sent TEE-003', statusType: 'success' as const },
    { id: '3', time: '14:19', channel: 'Instagram', user: '@maya_9', action: 'Clicked "VIEW PRICE" CTA button', status: 'Store Visit', statusType: 'blue' as const },
    { id: '4', time: '14:15', channel: 'Instagram', user: '@sneha_m', action: 'Replied: "Do you have size XL?"', status: 'Human Handoff', statusType: 'warning' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Overview</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Real-time social commerce funnel metrics and active compliance telemetry
          </p>
        </div>
        <Link href="/simulator">
          <Button size="sm" className="gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Launch Test Simulator</span>
          </Button>
        </Link>
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
                <span className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
                  {stat.value}
                </span>
                {stat.change && (
                  <span className="text-xs font-medium text-status-success tabular-nums">
                    {stat.change}
                  </span>
                )}
                {stat.meta && (
                  <span className="text-xs text-foreground-muted tabular-nums">
                    {stat.meta}
                  </span>
                )}
                {stat.badge && (
                  <Badge variant="warning" dot>
                    {stat.badge}
                  </Badge>
                )}
              </div>
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
            <span className="text-[11px] text-foreground-muted font-mono">Meta Webhooks</span>
          </div>

          <div className="divide-y divide-border-subtle">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="px-5 py-3 flex items-center justify-between text-xs hover:bg-surface-subtle transition-colors duration-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant={act.channel === 'Instagram' ? 'purple' : 'blue'}>
                    {act.channel}
                  </Badge>
                  <span className="font-medium text-foreground shrink-0">{act.user}</span>
                  <span className="text-foreground-secondary truncate">{act.action}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={act.statusType}>
                    {act.status}
                  </Badge>
                  <span className="text-[11px] text-foreground-muted font-mono tabular-nums">{act.time}</span>
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
                <span>Compliance Guardrails</span>
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
                  <span className="text-foreground-secondary font-mono text-[11px]">12 / 120 calls/min</span>
                </div>
                <div className="w-full bg-border-subtle h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[10%]" />
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
