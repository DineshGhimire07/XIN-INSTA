'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Users, ShieldCheck, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface CampaignItem {
  id: string;
  name: string;
  type: 'NEW_COLLECTION_DROP' | 'PRODUCT_RESTOCK' | 'VIP_EARLY_ACCESS';
  productCode: string;
  targetSegment: string;
  eligibleCount: number;
  status: 'SCHEDULED' | 'DISPATCHED' | 'DRAFT';
  scheduledFor: string;
  clicks: number;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: '1',
    name: 'Festive Velvet Party Dress Drop',
    type: 'NEW_COLLECTION_DROP',
    productCode: 'DRESS-001',
    targetSegment: 'Active Inquirers (24h Window)',
    eligibleCount: 840,
    status: 'DISPATCHED',
    scheduledFor: '26 Aug 2026',
    clicks: 524,
  },
  {
    id: '2',
    name: 'Oversized Crop Tee Restock Alert',
    type: 'PRODUCT_RESTOCK',
    productCode: 'TEE-003',
    targetSegment: 'Waitlist & Recent Commenters',
    eligibleCount: 310,
    status: 'SCHEDULED',
    scheduledFor: '28 Aug 2026, 18:00',
    clicks: 0,
  },
  {
    id: '3',
    name: 'Silk Summer Co-ord VIP Preview',
    type: 'VIP_EARLY_ACCESS',
    productCode: 'SET-012',
    targetSegment: 'High Intent Buyers',
    eligibleCount: 145,
    status: 'DRAFT',
    scheduledFor: 'Draft',
    clicks: 0,
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('DRESS-001');
  const [type, setType] = useState<'NEW_COLLECTION_DROP' | 'PRODUCT_RESTOCK' | 'VIP_EARLY_ACCESS'>('NEW_COLLECTION_DROP');
  const [messageText, setMessageText] = useState('');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp: CampaignItem = {
      id: Date.now().toString(),
      name,
      type,
      productCode,
      targetSegment: 'Active Inquirers (Compliant 24h Window)',
      eligibleCount: 420,
      status: 'SCHEDULED',
      scheduledFor: 'Tomorrow, 12:00',
      clicks: 0,
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    setName('');
    setMessageText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Social Campaigns</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Meta-compliant collection drops, restock alerts, and targeted audience broadcasts
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign Drop</span>
        </Button>
      </div>

      {/* Meta Eligibility Rules Summary Card */}
      <Card className="p-4 bg-surface-subtle border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Meta Policy-Enforced Broadcasts</h3>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Every outbound campaign automatically filters contacts against Meta's 24-hour messaging window and active recurring notification tokens.
              </p>
            </div>
          </div>
          <Badge variant="success" dot className="shrink-0">
            0 Cold DMs Policy Active
          </Badge>
        </div>
      </Card>

      {/* Campaigns Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border-subtle text-foreground-muted font-medium">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target SKU</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Eligible Contacts</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Store Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-foreground-secondary">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-surface-subtle transition-colors duration-100">
                  <td className="py-3.5 px-4 font-sans font-semibold text-foreground">{c.name}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <Badge variant={c.type === 'NEW_COLLECTION_DROP' ? 'blue' : 'purple'}>
                      {c.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-accent font-semibold">{c.productCode}</td>
                  <td className="py-3.5 px-4 font-sans text-foreground-muted text-xs">{c.targetSegment}</td>
                  <td className="py-3.5 px-4 text-foreground tabular-nums">{c.eligibleCount} contacts</td>
                  <td className="py-3.5 px-4 font-sans">
                    <Badge variant={c.status === 'DISPATCHED' ? 'success' : c.status === 'SCHEDULED' ? 'warning' : 'neutral'} dot>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold tabular-nums">{c.clicks} clicks</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Marketing Campaign"
        description="Broadcast a new collection drop or restock alert to eligible contacts within compliance windows."
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign Title"
            placeholder="e.g. Winter Velvet Party Dress Drop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Campaign Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-9 px-3 text-xs bg-surface border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-border-strong"
              >
                <option value="NEW_COLLECTION_DROP">New Collection Drop</option>
                <option value="PRODUCT_RESTOCK">Product Restock Alert</option>
                <option value="VIP_EARLY_ACCESS">VIP Early Access</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Target Product SKU</label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-surface border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-border-strong font-mono"
              >
                <option value="DRESS-001">DRESS-001 (Black Velvet Party Dress)</option>
                <option value="TEE-003">TEE-003 (Graphic Oversized Crop Tee)</option>
                <option value="SET-012">SET-012 (Silky Co-ord Summer Set)</option>
              </select>
            </div>
          </div>

          <Input
            label="Broadcast Message Preview"
            placeholder="Exclusive drop alert! The Black Velvet Dress is back. Tap below for direct checkout."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Schedule Compliant Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
