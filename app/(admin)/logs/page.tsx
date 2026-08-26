'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LogItem {
  id: string;
  time: string;
  channel: 'Instagram' | 'Facebook';
  type: string;
  recipient: string;
  status: 'ALLOWED' | 'BLOCKED' | 'COMPLETED';
  rule: string;
  reason: string;
}

const SAMPLE_LOGS: LogItem[] = [
  {
    id: '1',
    time: '00:30:12',
    channel: 'Instagram',
    type: 'COMMENT_PRIVATE_REPLY',
    recipient: 'comment_179238491823901',
    status: 'COMPLETED',
    rule: 'META_IG_PRIVATE_REPLY_7_DAY_WINDOW',
    reason: 'Comment 2m old. 0 previous replies. Passed policy.',
  },
  {
    id: '2',
    time: '00:25:40',
    channel: 'Facebook',
    type: 'COMMENT_PRIVATE_REPLY',
    recipient: 'comment_1899981123901',
    status: 'COMPLETED',
    rule: 'META_OFFICIAL_POLICY_APPROVED',
    reason: 'First response to user comment. Passed policy.',
  },
  {
    id: '3',
    time: '00:15:02',
    channel: 'Instagram',
    type: 'DIRECT_MESSAGE',
    recipient: 'user_17841400238491',
    status: 'BLOCKED',
    rule: 'META_STANDARD_MESSAGING_24H_WINDOW',
    reason: 'User last interacted 31 hours ago (> 24h limit).',
  },
  {
    id: '4',
    time: '00:05:18',
    channel: 'Instagram',
    type: 'COMMENT_PRIVATE_REPLY',
    recipient: 'comment_179238491823901',
    status: 'BLOCKED',
    rule: 'META_IG_PRIVATE_REPLY_1_MSG_LIMIT',
    reason: 'Private reply already sent to this comment.',
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Audit Logs</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Immutable audit trail of all webhook events, queue jobs, and compliance decisions
          </p>
        </div>
      </div>

      {/* Log Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border-subtle text-foreground-muted font-medium">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Evaluated Rule</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-foreground-secondary">
              {SAMPLE_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-surface-subtle transition-colors duration-100">
                  <td className="py-3 px-4 text-foreground-muted whitespace-nowrap tabular-nums">{log.time}</td>
                  <td className="py-3 px-4 font-sans">
                    <Badge variant={log.channel === 'Instagram' ? 'purple' : 'blue'}>
                      {log.channel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-foreground">{log.type}</td>
                  <td className="py-3 px-4 text-foreground-muted">{log.recipient}</td>
                  <td className="py-3 px-4 font-sans">
                    <Badge variant={log.status === 'COMPLETED' ? 'success' : 'danger'} dot>
                      {log.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground-muted text-[11px]">{log.rule}</td>
                  <td className="py-3 px-4 font-sans text-foreground-secondary text-xs">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
