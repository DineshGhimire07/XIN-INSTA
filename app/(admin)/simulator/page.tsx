'use client';

import React, { useState } from 'react';
import { PlaySquare, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface SimulationOutput {
  matchedIntent: string;
  confidence: number;
  matchedKeyword?: string;
  resolvedProduct: {
    code: string;
    title: string;
    price: number;
    currency: string;
    imageUrl: string;
    availableSizes: string[];
  };
  complianceCheck: {
    allowed: boolean;
    reason: string;
    policyRule: string;
  };
  selectedPublicReply: string;
  renderedPrivateCard: {
    title: string;
    subtitle: string;
    imageUrl: string;
    cta: string;
    url: string;
  };
}

export default function SimulatorPage() {
  const [commentText, setCommentText] = useState('LINK please kati parcha?');
  const [channel, setChannel] = useState<'INSTAGRAM' | 'FACEBOOK'>('INSTAGRAM');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationOutput | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/simulator/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulatedComment: commentText,
          channel,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert('Simulation failed to execute.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Test Simulator</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Test keyword matching, verify compliance rules, and preview generated DM cards
          </p>
        </div>
        <Badge variant="blue" dot>
          Sandbox Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Input Panel */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-accent" />
              <span>Simulated Inbound Interaction</span>
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleRunSimulation} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('INSTAGRAM')}
                  className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    channel === 'INSTAGRAM'
                      ? 'bg-surface-elevated text-foreground border-accent'
                      : 'bg-surface border-border-subtle text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Instagram Professional
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('FACEBOOK')}
                  className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    channel === 'FACEBOOK'
                      ? 'bg-surface-elevated text-foreground border-accent'
                      : 'bg-surface border-border-subtle text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Facebook Page
                </button>
              </div>
            </div>

            <Input
              label="Simulated Comment Text"
              placeholder="e.g. LINK please kati parcha?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />

            {/* Quick Test Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-foreground-muted">Quick Test Phrases:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'link please',
                  'kati parcha price?',
                  'what sizes are available?',
                  'I need to talk to a human agent',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCommentText(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-surface-subtle border border-border-subtle text-foreground-secondary hover:text-foreground hover:border-border transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="md" isLoading={isLoading} className="w-full gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Execute Dry-Run Simulation</span>
            </Button>
          </form>
        </Card>

        {/* Simulation Output Panel */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>Execution Results</span>
            </CardTitle>
            {result && (
              <Badge variant={result.complianceCheck.allowed ? 'success' : 'danger'} dot>
                {result.complianceCheck.allowed ? 'Policy Passed' : 'Policy Blocked'}
              </Badge>
            )}
          </CardHeader>

          {result ? (
            <div className="space-y-4 text-xs">
              {/* Classification Summary */}
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">Matched Intent:</span>
                  <Badge variant="blue" className="font-mono">
                    {result.matchedIntent} ({(result.confidence * 100).toFixed(0)}%)
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">Resolved SKU:</span>
                  <span className="font-semibold text-foreground">
                    {result.resolvedProduct.code} — {result.resolvedProduct.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted">Public Reply:</span>
                  <span className="text-foreground italic">"{result.selectedPublicReply}"</span>
                </div>
              </div>

              {/* Compliance Gate Log */}
              <div className="p-3.5 rounded-lg bg-status-success-subtle border border-status-success/20 space-y-1">
                <div className="flex items-center gap-1.5 text-status-success font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Compliance Gatekeeper Decision</span>
                </div>
                <p className="text-foreground-secondary text-[11px] font-mono">
                  Rule: {result.complianceCheck.policyRule}
                </p>
                <p className="text-foreground-muted text-[11px]">
                  Reason: {result.complianceCheck.reason}
                </p>
              </div>

              {/* Rendered Product Card Preview */}
              <div className="p-3.5 rounded-lg bg-canvas border border-border-subtle space-y-2">
                <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">
                  Instagram DM Card Preview
                </span>
                <div className="rounded-lg overflow-hidden border border-border-subtle bg-surface">
                  <img
                    src={result.renderedPrivateCard.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 space-y-2">
                    <h4 className="font-semibold text-foreground text-xs">{result.renderedPrivateCard.title}</h4>
                    <p className="text-[11px] text-foreground-muted">{result.renderedPrivateCard.subtitle}</p>
                    <a
                      href={result.renderedPrivateCard.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-foreground text-canvas hover:bg-foreground/90 font-semibold text-xs transition-colors"
                    >
                      <span>{result.renderedPrivateCard.cta}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-foreground-muted text-center space-y-2">
              <PlaySquare className="w-8 h-8 stroke-1 text-foreground-muted" />
              <p className="text-xs">Click "Execute Dry-Run Simulation" to inspect execution plan.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
