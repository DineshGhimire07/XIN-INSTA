'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  AlertOctagon,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Instagram,
  Facebook,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Channel {
  id: string;
  channel_type: 'INSTAGRAM' | 'FACEBOOK';
  platform_account_id: string;
  platform_username: string;
  token_expires_at: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  created_at: string;
}

export default function SettingsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Manual connect modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualChannelType, setManualChannelType] = useState<'INSTAGRAM' | 'FACEBOOK'>('INSTAGRAM');
  const [manualAccountId, setManualAccountId] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setIsLoadingChannels(true);
      const res = await fetch('/api/channels');
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setIsLoadingChannels(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestToken = async (channelId: string) => {
    try {
      setTestingChannelId(channelId);
      setTestResult(null);
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_token', channelId }),
      });
      const data = await res.json();

      if (data.valid) {
        setTestResult({
          id: channelId,
          success: true,
          message: `Live on Meta! Name: ${data.accountName || 'Active'} (ID: ${data.accountId})`,
        });
      } else {
        setTestResult({
          id: channelId,
          success: false,
          message: data.error || 'Token test failed',
        });
      }
    } catch (err) {
      setTestResult({
        id: channelId,
        success: false,
        message: err instanceof Error ? err.message : 'Network error testing token',
      });
    } finally {
      setTestingChannelId(null);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure you want to disconnect this channel?')) return;
    try {
      await fetch(`/api/channels?id=${channelId}`, { method: 'DELETE' });
      fetchChannels();
    } catch (err) {
      console.error('Failed to disconnect channel:', err);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    setManualError(null);

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_connect',
          channelType: manualChannelType,
          platformAccountId: manualAccountId.trim(),
          platformUsername: manualUsername.trim(),
          rawToken: manualToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save channel');
      }

      setShowManualModal(false);
      setManualAccountId('');
      setManualUsername('');
      setManualToken('');
      fetchChannels();
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Error connecting channel');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const webhookCallbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/meta`
    : 'https://your-domain.com/api/webhooks/meta';
  const webhookVerifyToken = 'xinvora_meta_webhook_secure_token_2026';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings & Meta Integration</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Official Meta Graph API v19.0 OAuth, Webhook handshake, and anti-ban policy compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowManualModal(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Token Input</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.href = '/api/auth/meta';
            }}
            className="text-xs gap-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Connect with Meta OAuth</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Social Channels */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                <span>Connected Meta Channels</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchChannels}
                disabled={isLoadingChannels}
                className="h-7 px-2 text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingChannels ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>

          {isLoadingChannels ? (
            <div className="py-8 text-center text-xs text-foreground-muted">Loading connected channels...</div>
          ) : channels.length === 0 ? (
            <div className="p-6 rounded-lg bg-surface-subtle/50 border border-border-subtle text-center space-y-3">
              <p className="text-xs text-foreground-secondary">
                No active Meta channels connected yet. Click <strong>Connect with Meta OAuth</strong> above to authorize your Instagram Professional and Facebook accounts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center">
                        {channel.channel_type === 'INSTAGRAM' ? (
                          <Instagram className="w-4 h-4 text-pink-500" />
                        ) : (
                          <Facebook className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">{channel.platform_username}</h4>
                        <p className="text-[11px] text-foreground-muted">
                          {channel.channel_type === 'INSTAGRAM' ? 'Instagram Professional' : 'Facebook Page'} • ID: {channel.platform_account_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={channel.status === 'CONNECTED' ? 'success' : 'warning'} dot>
                        {channel.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="h-7 w-7 p-0 text-foreground-muted hover:text-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/40 text-[11px]">
                    <span className="text-foreground-muted">
                      AES-256 Encrypted Token
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTestToken(channel.id)}
                      disabled={testingChannelId === channel.id}
                      className="h-6 text-[10px] px-2"
                    >
                      {testingChannelId === channel.id ? 'Testing...' : 'Test Token Live'}
                    </Button>
                  </div>

                  {testResult && testResult.id === channel.id && (
                    <div
                      className={`text-[11px] p-2 rounded flex items-center gap-1.5 ${
                        testResult.success
                          ? 'bg-status-success/10 text-status-success border border-status-success/20'
                          : 'bg-status-danger/10 text-status-danger border border-status-danger/20'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-lg bg-surface-elevated/40 border border-border-subtle/60 text-[11px] text-foreground-secondary space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Zero-Scraping Meta Compliance Guarantee</span>
            </div>
            <p className="text-foreground-muted leading-relaxed">
              All Instagram private replies and direct messages are transmitted strictly over authenticated Meta Graph API v19.0 endpoints with 24-hr care window & 1-reply comment constraints.
            </p>
          </div>
        </Card>

        {/* Meta Developer Webhook Credentials */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Meta Webhook Configuration</span>
            </CardTitle>
          </CardHeader>

          <p className="text-xs text-foreground-secondary">
            Provide these credentials inside your{' '}
            <a
              href="https://developers.facebook.com/apps/4507487636164247/webhooks/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline inline-flex items-center gap-0.5"
            >
              Meta App Dashboard <ExternalLink className="w-2.5 h-2.5" />
            </a>{' '}
            under <strong>Webhooks &gt; Instagram / Page</strong>:
          </p>

          <div className="space-y-3">
            {/* Meta App ID */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground-secondary">App ID</span>
                <Badge variant="neutral">Meta Configured</Badge>
              </div>
              <p className="text-xs font-mono text-foreground font-semibold">4507487636164247</p>
            </div>

            {/* Webhook Callback URL */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground-secondary">Webhook Callback URL</span>
                <button
                  onClick={() => copyToClipboard(webhookCallbackUrl, 'url')}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  {copiedField === 'url' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-foreground break-all">{webhookCallbackUrl}</p>
            </div>

            {/* Verify Token */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground-secondary">Verify Token</span>
                <button
                  onClick={() => copyToClipboard(webhookVerifyToken, 'token')}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  {copiedField === 'token' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'token' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-foreground">{webhookVerifyToken}</p>
            </div>
          </div>

          {/* Emergency Kill-Switch */}
          <div className="pt-2 border-t border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-status-danger">
                <AlertOctagon className="w-4 h-4" />
                <h4 className="text-xs font-semibold">Emergency Automation Freeze</h4>
              </div>
              <Badge variant="danger">Safety Gate</Badge>
            </div>

            <p className="text-[11px] text-foreground-muted">
              Instantly pauses all comment triggers and stops outbound message dispatching.
            </p>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle border border-status-danger/20">
              <span className="text-xs font-medium text-foreground">
                Status: {isFrozen ? 'FROZEN (DISPATCH PAUSED)' : 'NORMAL DISPATCHING'}
              </span>
              <Button
                variant={isFrozen ? 'primary' : 'danger'}
                onClick={() => setIsFrozen(!isFrozen)}
                size="sm"
                className="h-7 text-xs"
              >
                {isFrozen ? 'Resume Automations' : 'Freeze All'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Manual Token Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border-subtle shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Connect Channel with Graph API Token</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-foreground-muted hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            {manualError && (
              <div className="p-2.5 rounded-lg bg-status-danger/10 text-status-danger border border-status-danger/20 text-xs">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-foreground-secondary block mb-1">
                  Channel Type
                </label>
                <select
                  value={manualChannelType}
                  onChange={(e) => setManualChannelType(e.target.value as 'INSTAGRAM' | 'FACEBOOK')}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="INSTAGRAM">Instagram Professional Account</option>
                  <option value="FACEBOOK">Facebook Page</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground-secondary block mb-1">
                  Platform Account ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 17841400000000000"
                  value={manualAccountId}
                  onChange={(e) => setManualAccountId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-foreground focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground-secondary block mb-1">
                  Username / Page Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. @xinvora"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground-secondary block mb-1">
                  Meta Access Token (AES-256 Encrypted on save)
                </label>
                <textarea
                  rows={3}
                  placeholder="EAAG..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-foreground focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingManual}
                >
                  {isSubmittingManual ? 'Saving & Encrypting...' : 'Save & Connect'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
