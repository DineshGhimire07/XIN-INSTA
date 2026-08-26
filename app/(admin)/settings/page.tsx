'use client';

import React, { useState } from 'react';
import { Key, AlertOctagon, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [isFrozen, setIsFrozen] = useState(false);

  const toggleEmergencyFreeze = () => {
    setIsFrozen(!isFrozen);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Meta OAuth tokens, webhook keys, and emergency safety controls
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Social Channels */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-accent" />
              <span>Connected Meta Channels</span>
            </CardTitle>
          </CardHeader>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">@xinvora</h4>
                  <p className="text-[11px] text-foreground-muted">Instagram Professional Account</p>
                </div>
              </div>
              <Badge variant="success" dot>Connected</Badge>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">XINVORA Boutique</h4>
                  <p className="text-[11px] text-foreground-muted">Facebook Page</p>
                </div>
              </div>
              <Badge variant="success" dot>Connected</Badge>
            </div>
          </div>

          <Button variant="secondary" size="md" className="w-full gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh 60-Day OAuth Tokens</span>
          </Button>
        </Card>

        {/* Emergency Kill-Switch */}
        <Card className="space-y-4 border-status-danger/30">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-status-danger">
              <AlertOctagon className="w-4 h-4" />
              <span>Emergency Controls</span>
            </CardTitle>
            <Badge variant="danger">Safety Gate</Badge>
          </CardHeader>

          <p className="text-xs text-foreground-secondary">
            Freezing automations immediately pauses inbound comment processing and stops all outbound queues.
          </p>

          <div className="p-3.5 rounded-lg bg-surface-subtle border border-status-danger/20 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Global Automation Freeze</h4>
              <p className="text-[11px] text-foreground-muted">
                Status: {isFrozen ? 'FROZEN (ALL QUEUES PAUSED)' : 'NORMAL OPERATION'}
              </p>
            </div>
            <Button
              variant={isFrozen ? 'primary' : 'danger'}
              onClick={toggleEmergencyFreeze}
              size="sm"
            >
              {isFrozen ? 'Resume' : 'Freeze All'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
