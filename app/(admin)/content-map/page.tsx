'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Link2, Instagram, RefreshCw, CheckCircle2, ExternalLink, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SyncedItem {
  id: string;
  platform_content_id: string;
  content_type: string;
  caption: string;
  permalink: string;
  media_url: string;
  posted_at: string;
  content_product_mappings?: Array<{
    is_primary: boolean;
    product: {
      id: string;
      product_code: string;
      title: string;
      price: number;
      currency: string;
    };
  }>;
}

interface ProductOption {
  id: string;
  product_code: string;
  title: string;
}

export default function ContentMapPage() {
  const [contentList, setContentList] = useState<SyncedItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reelsRes, prodsRes] = await Promise.all([
        fetch('/api/content/reels'),
        fetch('/api/products'),
      ]);

      const reelsData = await reelsRes.json();
      const prodsData = await prodsRes.json();

      if (reelsData.reels) setContentList(reelsData.reels);
      if (reelsData.connectedAccount) setConnectedAccount(reelsData.connectedAccount);
      if (prodsData.products) setProducts(prodsData.products);
    } catch (err) {
      console.error('Failed to load content map data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await fetchData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProductChange = async (contentItemId: string, newSku: string) => {
    try {
      setSavingId(contentItemId);
      await fetch('/api/content/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentItemId, productCode: newSku }),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to bind SKU:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Content Mapping</h1>
            {connectedAccount && (
              <Badge variant="purple" className="font-mono text-xs">
                {connectedAccount}
              </Badge>
            )}
          </div>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Explicitly bind your Instagram Reels & Posts to specific product catalog SKUs
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync from Instagram</span>
        </Button>
      </div>

      {/* Content List Table Card */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-foreground-muted">Loading live content from Instagram...</div>
        ) : contentList.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-foreground-secondary">
              No synced reels or posts found for your account. Click <strong>Sync from Instagram</strong> to import your latest media.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {contentList.map((item) => {
              const mapped = item.content_product_mappings?.[0]?.product;
              const boundSku = mapped?.product_code || 'NONE';

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-subtle transition-colors duration-100"
                >
                  {/* Media Thumbnail & Caption Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-surface-subtle border border-border-subtle flex items-center justify-center">
                      <Video className="w-6 h-6 text-foreground-muted" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/80 text-foreground">
                        {item.content_type}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-foreground-muted">
                          ID: {item.platform_content_id}
                        </span>
                        {item.posted_at && (
                          <span className="text-[11px] text-foreground-muted">
                            • {new Date(item.posted_at).toLocaleDateString()}
                          </span>
                        )}
                        <a
                          href={item.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-accent hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>View on Instagram</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-xs text-foreground line-clamp-2 max-w-xl font-medium">
                        {item.caption || 'Official Instagram Reel'}
                      </p>
                      {mapped && (
                        <p className="text-[11px] text-status-success font-medium">
                          Active Binding: {mapped.product_code} — {mapped.title} ({mapped.currency} {mapped.price})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bound SKU Dropdown */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                      <Link2 className="w-3.5 h-3.5 text-foreground-muted" />
                      <span>Bound SKU:</span>
                    </div>
                    <select
                      value={boundSku}
                      disabled={savingId === item.id}
                      onChange={(e) => handleProductChange(item.id, e.target.value)}
                      className="h-8 px-2.5 text-xs bg-surface border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-border-strong font-mono"
                    >
                      <option value="NONE">-- No Binding (Fallback) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.product_code}>
                          {p.product_code} ({p.title})
                        </option>
                      ))}
                    </select>

                    {boundSku !== 'NONE' ? (
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Fallback</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
