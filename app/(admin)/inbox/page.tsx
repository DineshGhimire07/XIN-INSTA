'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Bot, 
  Send, 
  Clock, 
  ExternalLink, 
  AlertTriangle,
  Instagram,
  Facebook,
  ShieldCheck 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatItem {
  id: string;
  username: string;
  channel: 'INSTAGRAM' | 'FACEBOOK';
  status: 'AUTOMATED' | 'NEEDS_ATTENTION' | 'HUMAN_HANDLED';
  lastMessage: string;
  lastMessageTime: string;
  hoursRemaining: number;
  productTitle?: string;
  messages: { sender: 'bot' | 'user' | 'agent'; text: string; time: string; card?: { title: string; price: string; url: string } }[];
}

const INITIAL_CONVERSATIONS: ChatItem[] = [
  {
    id: '1',
    username: '@anita_shrestha',
    channel: 'INSTAGRAM',
    status: 'NEEDS_ATTENTION',
    lastMessage: 'Do you have this dress in red color as well?',
    lastMessageTime: '12m ago',
    hoursRemaining: 23,
    productTitle: 'Black Velvet Party Dress',
    messages: [
      { sender: 'user', text: 'LINK please for the party dress!', time: '14:10' },
      { 
        sender: 'bot', 
        text: 'Here are the details for the Velvet Dress you asked about.', 
        time: '14:10',
        card: { title: 'Black Velvet Party Dress', price: 'NPR 3,499', url: 'https://your-store.com/products/black-velvet-dress' } 
      },
      { sender: 'user', text: 'Do you have this dress in red color as well?', time: '14:15' },
    ],
  },
  {
    id: '2',
    username: '@priya_k',
    channel: 'INSTAGRAM',
    status: 'AUTOMATED',
    lastMessage: 'Sent you the product card with direct pricing.',
    lastMessageTime: '1h ago',
    hoursRemaining: 21,
    productTitle: 'Graphic Crop Tee',
    messages: [
      { sender: 'user', text: 'price please', time: '13:00' },
      { sender: 'bot', text: 'Sent you the product card with direct pricing.', time: '13:00' },
    ],
  },
  {
    id: '3',
    username: '@ram_kumar',
    channel: 'FACEBOOK',
    status: 'HUMAN_HANDLED',
    lastMessage: 'Thank you! I will place the order.',
    lastMessageTime: '3h ago',
    hoursRemaining: 18,
    messages: [
      { sender: 'user', text: 'Can I pay via cash on delivery in Pokhara?', time: '11:00' },
      { sender: 'agent', text: 'Yes, we provide Cash on Delivery all across Nepal including Pokhara!', time: '11:05' },
      { sender: 'user', text: 'Thank you! I will place the order.', time: '11:10' },
    ],
  },
];

export default function InboxPage() {
  const [conversations, setConversations] = useState<ChatItem[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>('1');
  const [agentInput, setAgentInput] = useState('');

  const activeChat = conversations.find((c) => c.id === activeId) || conversations[0];

  const toggleHandoff = (newStatus: 'AUTOMATED' | 'HUMAN_HANDLED') => {
    setConversations(
      conversations.map((c) => (c.id === activeId ? { ...c, status: newStatus } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const newMsg = {
      sender: 'agent' as const,
      text: agentInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(
      conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              status: 'HUMAN_HANDLED',
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
            }
          : c
      )
    );
    setAgentInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Inbox</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Omnichannel live chat, 24-hour customer care timer, and instant human handoff
          </p>
        </div>
      </div>

      {/* Two-Pane Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[620px]">
        {/* Left Pane: Conversation List */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Conversations</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-elevated text-foreground-secondary font-mono">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`p-3.5 cursor-pointer transition-colors duration-100 ${
                  c.id === activeId ? 'bg-surface-elevated border-l-2 border-accent' : 'hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{c.username}</span>
                  </div>
                  <span className="text-[10px] text-foreground-muted font-mono">{c.lastMessageTime}</span>
                </div>
                <p className="text-xs text-foreground-secondary mt-1 truncate">{c.lastMessage}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <Badge
                    variant={
                      c.status === 'NEEDS_ATTENTION'
                        ? 'warning'
                        : c.status === 'HUMAN_HANDLED'
                        ? 'blue'
                        : 'success'
                    }
                    dot
                  >
                    {c.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                    <Clock className="w-3 h-3 text-foreground-muted" />
                    <span>{c.hoursRemaining}h left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Pane: Chat Window */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          {/* Thread Header */}
          <div className="p-3.5 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center font-semibold text-foreground text-xs">
                {activeChat.username.slice(1, 3).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">{activeChat.username}</h3>
                <p className="text-[11px] text-foreground-muted">
                  {activeChat.channel} • 24h Window: {activeChat.hoursRemaining}h remaining
                </p>
              </div>
            </div>

            {/* Handoff Toggle Button */}
            <div>
              {activeChat.status === 'HUMAN_HANDLED' ? (
                <Button variant="secondary" size="sm" onClick={() => toggleHandoff('AUTOMATED')} className="gap-1.5 text-xs">
                  <Bot className="w-3.5 h-3.5 text-status-success" />
                  <span>Resume Bot Automation</span>
                </Button>
              ) : (
                <Button variant="danger" size="sm" onClick={() => toggleHandoff('HUMAN_HANDLED')} className="gap-1.5 text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Take Over (Human)</span>
                </Button>
              )}
            </div>
          </div>

          {/* Message Thread Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-canvas">
            {activeChat.status === 'NEEDS_ATTENTION' && (
              <div className="p-3 rounded-lg bg-status-warning-subtle border border-status-warning/20 text-xs text-status-warning flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Customer requested human assistance. Automated replies paused.</span>
              </div>
            )}

            {activeChat.messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-md p-3 rounded-lg text-xs space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-surface-elevated text-foreground border border-border-subtle'
                      : m.sender === 'agent'
                      ? 'bg-accent text-white'
                      : 'bg-surface text-foreground border border-border-subtle'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>

                  {/* Rendered Product Card in Bot Message */}
                  {m.card && (
                    <div className="mt-2 p-3 rounded-md bg-canvas border border-border-subtle space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">{m.card.title}</span>
                        <span className="text-status-info font-semibold">{m.card.price}</span>
                      </div>
                      <a
                        href={m.card.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-foreground text-canvas font-semibold hover:bg-foreground/90 transition-colors text-[11px]"
                      >
                        <span>VIEW PRICE</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-foreground-muted mt-1 px-1 font-mono">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Agent Reply Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border-subtle bg-surface flex gap-2">
            <input
              type="text"
              placeholder={
                activeChat.status === 'AUTOMATED'
                  ? 'Type a message to take over in Human Mode...'
                  : 'Message to customer via Official Meta API...'
              }
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              className="flex-1 h-9 px-3 text-xs bg-surface-subtle border border-border-subtle rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent transition-all"
            />
            <Button type="submit" size="md" className="gap-1.5 shrink-0">
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
