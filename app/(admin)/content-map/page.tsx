'use client';

import React, { useState } from 'react';
import { Layers, Link2, Instagram, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SyncedContent {
  id: string;
  mediaId: string;
  type: 'REEL' | 'POST';
  caption: string;
  thumbnail: string;
  postedAt: string;
  mappedProductCode: string | null;
}

const INITIAL_CONTENT: SyncedContent[] = [
  {
    id: '1',
    mediaId: '17999888777666',
    type: 'REEL',
    caption: 'Our best-selling Velvet Dress is back for the season! Drop LINK below for the direct price and sizing guide 💌✨ #xinvora',
    thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    postedAt: '2 hours ago',
    mappedProductCode: 'DRESS-001',
  },
  {
    id: '2',
    mediaId: '17999888777667',
    type: 'REEL',
    caption: 'Oversized aesthetic fits for daily casuals 🌸 Comment TEE to get your link in DMs!',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    postedAt: '1 day ago',
    mappedProductCode: 'TEE-003',
  },
  {
    id: '3',
    mediaId: '17999888777668',
    type: 'POST',
    caption: 'New collection preview dropping this weekend. Turn on post notifications! 🔔',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    postedAt: '3 days ago',
    mappedProductCode: null,
  },
];

export default function ContentMapPage() {
  const [contentList, setContentList] = useState<SyncedContent[]>(INITIAL_CONTENT);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 900);
  };

  const handleProductChange = (contentId: string, newSku: string) => {
    setContentList(
      contentList.map((c) =>
        c.id === contentId ? { ...c, mappedProductCode: newSku === 'NONE' ? null : newSku } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Content Mapping</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Explicitly bind Instagram Reels & Facebook Posts to specific product catalog SKUs
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSync} isLoading={isSyncing} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Recent Reels</span>
        </Button>
      </div>

      {/* Content List Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border-subtle">
          {contentList.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-subtle transition-colors duration-100"
            >
              {/* Media Thumbnail & Caption Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-surface-subtle border border-border-subtle">
                  <img src={item.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/80 text-foreground">
                    {item.type}
                  </span>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-foreground-muted">ID: {item.mediaId}</span>
                    <span className="text-[11px] text-foreground-muted">• {item.postedAt}</span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 max-w-xl">{item.caption}</p>
                </div>
              </div>

              {/* Bound SKU Dropdown */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                  <Link2 className="w-3.5 h-3.5 text-foreground-muted" />
                  <span>Bound SKU:</span>
                </div>
                <select
                  value={item.mappedProductCode || 'NONE'}
                  onChange={(e) => handleProductChange(item.id, e.target.value)}
                  className="h-8 px-2.5 text-xs bg-surface border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-border-strong font-mono"
                >
                  <option value="NONE">-- No Binding (Fallback) --</option>
                  <option value="DRESS-001">DRESS-001 (Black Velvet Party Dress)</option>
                  <option value="TEE-003">TEE-003 (Graphic Crop Tee)</option>
                  <option value="SET-012">SET-012 (Silky Co-ord Set)</option>
                </select>

                {item.mappedProductCode ? (
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                ) : (
                  <Badge variant="neutral">
                    Fallback
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
