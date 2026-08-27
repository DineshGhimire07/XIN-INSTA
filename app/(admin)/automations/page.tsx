'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Filter, 
  MessageSquare, 
  ExternalLink, 
  Plus, 
  Minus, 
  Wand2, 
  HelpCircle, 
  Check, 
  Play, 
  X, 
  SlidersHorizontal, 
  Instagram, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  RotateCcw, 
  Workflow, 
  Layers, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  MessageCircle, 
  AtSign, 
  UserPlus, 
  Compass, 
  RefreshCw,
  Copy,
  Link2,
  Shuffle,
  Film,
  Search,
  CheckCircle,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FlowButton {
  id: string;
  label: string;
  actionType: 'TRIGGER_NODE' | 'OPEN_URL' | 'HUMAN_HANDOFF';
  targetNodeId?: string;
  url?: string;
}

interface InstagramReelItem {
  id: string;
  platform_content_id: string;
  content_type: 'REEL' | 'POST';
  permalink: string;
  caption: string;
  media_url: string;
  views?: string;
  comments_count?: number;
  bound_product?: string;
}

interface FlowNode {
  id: string;
  type: 'trigger' | 'message' | 'condition' | 'public_reply';
  title: string;
  subtitle?: string;
  content?: string;
  // Trigger Specific Data
  triggerMode?: 'SPECIFIC_REEL' | 'ANY_REEL' | 'NEXT_REEL';
  selectedReelId?: string;
  selectedReelThumbnail?: string;
  selectedReelTitle?: string;
  triggerKeywords?: string;
  // Message & Buttons
  buttons?: FlowButton[];
  buttonLabel?: string;
  buttonUrl?: string;
  // Public Reply Data
  publicReplies?: string[];
  selectionStrategy?: 'RANDOM_AVOID_REPEAT' | 'SEQUENTIAL';
  alreadySentReply?: string;
  x: number;
  y: number;
  conditionType?: 'IS_FOLLOWER' | 'ALREADY_SENT_LINK' | 'KEYWORD_MATCH' | 'CUSTOM';
  conditionTrueLabel?: string;
  conditionFalseLabel?: string;
}

interface FlowEdge {
  id: string;
  from: string;
  to: string;
  branch?: 'true' | 'false' | 'default' | string;
  buttonId?: string;
}

interface AutomationTemplate {
  id: string;
  title: string;
  description: string;
  category: 'VIRAL_GROWTH' | 'ECOMMERCE' | 'CUSTOMER_CARE' | 'LEAD_GEN';
  badge: string;
  stepCount: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  previewGradient: string;
  previewPills: string[];
}

const SAMPLE_REELS: InstagramReelItem[] = [
  {
    id: 'reel_42',
    platform_content_id: 'reel_42',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8jKl2xM91',
    caption: 'Our viral Black Velvet Party Dress is back in stock! ✨ Drop LINK or PRICE below for instant priority checkout access 🛍️',
    media_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    views: '48.2K',
    comments_count: 142,
    bound_product: 'Black Velvet Party Dress (DRESS-001 - NPR 3,499)',
  },
  {
    id: 'reel_43',
    platform_content_id: 'reel_43',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8lNx54P32',
    caption: 'Pure Cashmere Oversized Winter Knit ❄️ Comment KATI to get the price and sizing card in your DMs!',
    media_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    views: '29.5K',
    comments_count: 86,
    bound_product: 'Cashmere Oversized Knit (KNIT-002 - NPR 4,200)',
  },
  {
    id: 'reel_44',
    platform_content_id: 'reel_44',
    content_type: 'REEL',
    permalink: 'https://instagram.com/reel/C8qYz99K11',
    caption: 'Emerald Satin Evening Gown — hand-tailored luxury for your wedding season ✨ Comment SHOP for link!',
    media_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    views: '63.1K',
    comments_count: 219,
    bound_product: 'Emerald Satin Evening Gown (GOWN-004 - NPR 5,800)',
  },
  {
    id: 'post_101',
    platform_content_id: 'post_101',
    content_type: 'POST',
    permalink: 'https://instagram.com/p/C8uRt12J99',
    caption: 'Weekend Outfit Inspiration 👗 Tap our bio link or comment LOOK for the whole set breakdown!',
    media_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    views: '15.4K',
    comments_count: 42,
    bound_product: 'Organic Cotton Graphic Tee (TEE-003 - NPR 1,850)',
  },
];

const TEMPLATES: AutomationTemplate[] = [
  {
    id: 'template-1-custom-dm-reply',
    title: 'Template 1: Custom DM Auto-Reply (Any Text / Selected Keywords)',
    description: 'Instant automated direct message responder. Choose to trigger on ALL incoming messages (e.g. "hi", "hello") or ONLY when users mention specific selected keywords (e.g. "price", "kati", "order").',
    category: 'CUSTOMER_CARE',
    badge: '100% Configurable',
    stepCount: 2,
    previewGradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
    previewPills: ['Any Text or Keyword Trigger', 'Custom Reply Message', 'Optional Product Card'],
    nodes: [
      {
        id: 'trig-t1',
        type: 'trigger',
        title: 'When...',
        subtitle: 'User sends any DM or mentions selected keywords',
        content: 'Keywords: hi, hello, hey, price, kati, order',
        x: 60,
        y: 280,
      },
      {
        id: 'msg-t1-reply',
        type: 'message',
        title: 'Instagram Custom Auto-Reply',
        content: '👋 Hello! Welcome to XINVORA ✨\nThank you for reaching out to us. How can we help you today? Let us know what you are looking for!',
        buttons: [
          { id: 'btn-t1-catalog', label: 'VIEW PRICE & CATALOG 🛍️', actionType: 'OPEN_URL', url: 'https://xin-insta.vercel.app' },
        ],
        x: 440,
        y: 280,
      },
    ],
    edges: [
      { id: 'e-t1-main', from: 'trig-t1', to: 'msg-t1-reply', branch: 'default' },
    ],
  },
  {
    id: 'reel-auto-dm-random-reply',
    title: 'Reel Comment-to-DM with Reel Picker & Random Reply Pool',
    description: 'Bind to any specific Instagram Reel. When users comment, send a private DM and pick randomly from 4 public comment replies. Handles repeat comments seamlessly.',
    category: 'VIRAL_GROWTH',
    badge: 'Reel Connected',
    stepCount: 4,
    previewGradient: 'from-amber-500/20 to-pink-500/20 border-pink-500/30',
    previewPills: ['Reel #42 Connected', 'Random Public Reply (4 Pools)', 'Private Product DM'],
    nodes: [
      {
        id: 'trig-reel-1',
        type: 'trigger',
        title: 'When...',
        subtitle: 'User comments on specific Reel',
        triggerMode: 'SPECIFIC_REEL',
        selectedReelId: 'reel_42',
        selectedReelTitle: 'Reel #42 (Black Velvet Party Dress)',
        selectedReelThumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        triggerKeywords: 'PRICE, LINK, BUY, KATI, SHOP',
        content: 'Reel #42 (Black Velvet Party Dress)',
        x: 60,
        y: 280,
      },
      {
        id: 'node-pub-reply',
        type: 'public_reply',
        title: 'Public Comment Reply Pool',
        subtitle: 'Randomly cycles 4 variations (Anti-Repeat)',
        publicReplies: [
          'Sent you the details! Check your DMs 💌',
          'Just dropped the link in your inbox! ✨',
          'Check your messages for the direct product link! 🛍️',
          'Details sent! Let us know if you need help with sizing 💕',
        ],
        selectionStrategy: 'RANDOM_AVOID_REPEAT',
        alreadySentReply: 'We already sent the link to your DMs! Please check your inbox 💌',
        x: 380,
        y: 160,
      },
      {
        id: 'msg-priv-dm',
        type: 'message',
        title: 'Instagram Private DM Card',
        content: 'Hey there! 👗 Here is the direct link for the Black Velvet Party Dress you asked about on our Reel.\n\nSizing and direct checkout are available now 👇',
        buttons: [
          {
            id: 'btn-view-price',
            label: 'VIEW PRICE (NPR 3,499) 🛍️',
            actionType: 'OPEN_URL',
            url: 'https://your-store.com/products/black-velvet-dress',
          },
          {
            id: 'btn-ask-cod',
            label: 'Cash on Delivery? 💵',
            actionType: 'TRIGGER_NODE',
            targetNodeId: 'msg-cod-info',
          },
        ],
        x: 740,
        y: 240,
      },
      {
        id: 'msg-cod-info',
        type: 'message',
        title: 'Instagram COD & Delivery Info',
        content: '💵 Yes! Cash on Delivery is 100% available across Nepal! Delivery inside Kathmandu takes 24 hours, outside valley 2-3 days.',
        buttons: [
          {
            id: 'btn-order-now',
            label: 'Order on Website 🛍️',
            actionType: 'OPEN_URL',
            url: 'https://your-store.com/checkout',
          },
        ],
        x: 1100,
        y: 320,
      },
    ],
    edges: [
      { id: 'e-trig-pub', from: 'trig-reel-1', to: 'node-pub-reply', branch: 'default' },
      { id: 'e-pub-dm', from: 'node-pub-reply', to: 'msg-priv-dm', branch: 'default' },
      { id: 'e-dm-cod', from: 'msg-priv-dm', to: 'msg-cod-info', buttonId: 'btn-ask-cod', branch: 'btn-ask-cod' },
    ],
  },
  {
    id: 'conversation-starters-multi-cta',
    title: 'Instagram DM Conversation Starters (Multi-CTA Menu)',
    description: 'Welcome new inquirers with 3 interactive quick-reply buttons: [What are your prices? 👗], [Cash on Delivery? 💵], and [Delivery time kati lagxa? 🚚]—each triggering a dedicated smart message branch!',
    category: 'ECOMMERCE',
    badge: 'Multi-CTA Active',
    stepCount: 4,
    previewGradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    previewPills: ['Welcome FAQ Menu', '3 CTA Buttons', 'Branching Replies'],
    nodes: [
      {
        id: 'trig-cs',
        type: 'trigger',
        title: 'When...',
        subtitle: 'User opens Direct Messages for the first time',
        content: 'Conversation Starter Trigger',
        x: 60,
        y: 280,
      },
      {
        id: 'msg-main-menu',
        type: 'message',
        title: 'Instagram Send FAQ Menu',
        content: 'Welcome to XINVORA! 👗✨ How can we help you today?\n\nTap an option below for instant details:',
        buttons: [
          { id: 'btn-prices', label: 'What are your prices? 🛍️', actionType: 'TRIGGER_NODE', targetNodeId: 'msg-prices' },
          { id: 'btn-cod', label: 'Cash on Delivery? 💵', actionType: 'TRIGGER_NODE', targetNodeId: 'msg-cod' },
          { id: 'btn-delivery', label: 'Delivery time kati lagxa? 🚚', actionType: 'TRIGGER_NODE', targetNodeId: 'msg-delivery' },
        ],
        x: 360,
        y: 220,
      },
      {
        id: 'msg-prices',
        type: 'message',
        title: 'Instagram Product Pricing',
        content: '✨ Our Velvet Party Dresses start at NPR 3,499 with complimentary gift packaging and size exchanges.\n\nTap below to explore our live catalog:',
        buttons: [
          { id: 'btn-view-catalog', label: 'View Live Catalog 👗', actionType: 'OPEN_URL', url: 'https://your-store.com/products' },
        ],
        x: 740,
        y: 60,
      },
      {
        id: 'msg-cod',
        type: 'message',
        title: 'Instagram COD Policy',
        content: '💵 Yes! Cash on Delivery (COD) is 100% available all across Nepal! You only pay when your parcel arrives safely at your doorstep.',
        buttons: [
          { id: 'btn-shop-cod', label: 'Place COD Order 🛍️', actionType: 'OPEN_URL', url: 'https://your-store.com/checkout' },
        ],
        x: 740,
        y: 260,
      },
      {
        id: 'msg-delivery',
        type: 'message',
        title: 'Instagram Delivery Timelines',
        content: '🚚 Delivery Timelines:\n• Inside Kathmandu Valley: Same-Day / 24 Hours\n• Outside Valley (Pokhara, Biratnagar, Chitwan): 2-3 Business Days via Express Courier.',
        buttons: [
          { id: 'btn-ask-support', label: 'Talk to Support 👩‍💼', actionType: 'HUMAN_HANDOFF' },
        ],
        x: 740,
        y: 460,
      },
    ],
    edges: [
      { id: 'e-trig', from: 'trig-cs', to: 'msg-main-menu', branch: 'default' },
      { id: 'e-btn1', from: 'msg-main-menu', to: 'msg-prices', buttonId: 'btn-prices', branch: 'btn-prices' },
      { id: 'e-btn2', from: 'msg-main-menu', to: 'msg-cod', buttonId: 'btn-cod', branch: 'btn-cod' },
      { id: 'e-btn3', from: 'msg-main-menu', to: 'msg-delivery', buttonId: 'btn-delivery', branch: 'btn-delivery' },
    ],
  },
];

export default function AutomationHubPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'my-automations' | 'sequences'>('templates');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Canvas Studio State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [flowTitle, setFlowTitle] = useState('Reel Comment-to-DM with Reel Picker & Random Reply Pool');
  const [nodes, setNodes] = useState<FlowNode[]>(TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(TEMPLATES[0].edges);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('trig-reel-1');

  // Reel Picker Modal
  const [isReelPickerOpen, setIsReelPickerOpen] = useState(false);
  const [reelsList, setReelsList] = useState<InstagramReelItem[]>(SAMPLE_REELS);
  const [reelSearchQuery, setReelSearchQuery] = useState('');

  // Dragging
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeOffset, setNodeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add Node Modal
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);

  // Live Simulator Test Drawer
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFollower, setSimFollower] = useState(true);
  const [simAlreadySent, setSimAlreadySent] = useState(false);
  const [simComment, setSimComment] = useState('price please');
  const [executedPath, setExecutedPath] = useState<string[]>([]);
  const [simOutput, setSimOutput] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [newPublicReplyText, setNewPublicReplyText] = useState('');

  // Template 1 Custom DM Auto-Reply State
  const [isTemplate1ModalOpen, setIsTemplate1ModalOpen] = useState(false);
  const [t1TriggerMode, setT1TriggerMode] = useState<'ANY_TEXT' | 'KEYWORDS'>('ANY_TEXT');
  const [t1Keywords, setT1Keywords] = useState<string[]>(['hi', 'hello', 'hey', 'price', 'kati', 'order', 'link']);
  const [t1NewKeyword, setT1NewKeyword] = useState('');
  const [t1ReplyText, setT1ReplyText] = useState('👋 Hello! Welcome to XINVORA ✨\nThank you for reaching out to us. How can we help you today? Let us know what you are looking for!');
  const [t1AttachProduct, setT1AttachProduct] = useState(true);
  const [t1Status, setT1Status] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [t1IsSaving, setT1IsSaving] = useState(false);
  const [t1SaveSuccess, setT1SaveSuccess] = useState(false);

  // Load Synced Reels & Template 1 config from Supabase
  useEffect(() => {
    fetch('/api/content/reels')
      .then((r) => r.json())
      .then((data) => {
        if (data?.reels?.length) {
          setReelsList(data.reels);
        }
      })
      .catch(console.error);

    fetch('/api/automations')
      .then((r) => r.json())
      .then((data) => {
        const dm = data?.automations?.find((a: any) => a.trigger_type === 'DM');
        if (dm) {
          const flow = dm.flow_graph || {};
          if (flow.triggerMode) setT1TriggerMode(flow.triggerMode);
          if (flow.keywords) setT1Keywords(flow.keywords);
          if (flow.replyText) setT1ReplyText(flow.replyText);
          if (flow.attachProductCard !== undefined) setT1AttachProduct(flow.attachProductCard);
          if (dm.status) setT1Status(dm.status);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveTemplate1 = async () => {
    setT1IsSaving(true);
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'b0000000-0000-0000-0000-000000000001',
          name: 'Template 1: Custom DM Auto-Reply (Any Text / Keywords)',
          triggerType: 'DM',
          status: t1Status,
          flowGraph: {
            templateId: 'template-1-custom-dm-reply',
            triggerMode: t1TriggerMode,
            keywords: t1Keywords,
            replyText: t1ReplyText,
            attachProductCard: t1AttachProduct,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setT1SaveSuccess(true);
        setTimeout(() => {
          setT1SaveSuccess(false);
          setIsTemplate1ModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      alert('Failed to save Template 1 automation.');
    } finally {
      setT1IsSaving(false);
    }
  };

  const handleUseTemplate = (template: AutomationTemplate) => {
    if (template.id === 'template-1-custom-dm-reply') {
      setIsTemplate1ModalOpen(true);
      return;
    }
    setFlowTitle(template.title);
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(template.nodes[0]?.id || null);
    setIsCanvasOpen(true);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNodeOffset({
        x: e.clientX / zoom - node.x,
        y: e.clientY / zoom - node.y,
      });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.round(e.clientX / zoom - nodeOffset.x);
      const newY = Math.round(e.clientY / zoom - nodeOffset.y);
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const updateSelectedNode = (field: keyof FlowNode, value: any) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, [field]: value } : n))
    );
  };

  // Binding a selected Reel to the Trigger Node
  const handleSelectReel = (reel: InstagramReelItem) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            triggerMode: 'SPECIFIC_REEL',
            selectedReelId: reel.platform_content_id,
            selectedReelThumbnail: reel.media_url,
            selectedReelTitle: `Reel #${reel.platform_content_id.replace('reel_', '')} (${reel.caption.slice(0, 30)}...)`,
            content: `Reel #${reel.platform_content_id.replace('reel_', '')}`,
          };
        }
        return n;
      })
    );
    setIsReelPickerOpen(false);
  };

  const handleAddButton = () => {
    if (!selectedNodeId) return;
    const newBtnId = `btn-${Date.now()}`;
    const newBtn: FlowButton = {
      id: newBtnId,
      label: 'New Button CTA ✨',
      actionType: 'TRIGGER_NODE',
    };

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          const currentButtons = n.buttons || [];
          return {
            ...n,
            buttons: [...currentButtons, newBtn],
          };
        }
        return n;
      })
    );
  };

  const handleUpdateButton = (buttonId: string, updates: Partial<FlowButton>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId && n.buttons) {
          return {
            ...n,
            buttons: n.buttons.map((b) => (b.id === buttonId ? { ...b, ...updates } : b)),
          };
        }
        return n;
      })
    );

    if (updates.targetNodeId !== undefined) {
      setEdges((prev) => {
        const filtered = prev.filter((e) => !(e.from === selectedNodeId && e.buttonId === buttonId));
        if (updates.targetNodeId) {
          return [
            ...filtered,
            {
              id: `e-${buttonId}-${updates.targetNodeId}`,
              from: selectedNodeId,
              to: updates.targetNodeId,
              buttonId,
              branch: buttonId,
            },
          ];
        }
        return filtered;
      });
    }
  };

  const handleDeleteButton = (buttonId: string) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId && n.buttons) {
          return {
            ...n,
            buttons: n.buttons.filter((b) => b.id !== buttonId),
          };
        }
        return n;
      })
    );
    setEdges((prev) => prev.filter((e) => !(e.from === selectedNodeId && e.buttonId === buttonId)));
  };

  const handleAddPublicReplyVariation = () => {
    if (!selectedNodeId || !newPublicReplyText.trim()) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          const current = n.publicReplies || [];
          return { ...n, publicReplies: [...current, newPublicReplyText.trim()] };
        }
        return n;
      })
    );
    setNewPublicReplyText('');
  };

  const handleRemovePublicReplyVariation = (index: number) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId && n.publicReplies) {
          return {
            ...n,
            publicReplies: n.publicReplies.filter((_, i) => i !== index),
          };
        }
        return n;
      })
    );
  };

  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/automations/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          flow: { name: flowTitle, nodes, edges },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      alert('Failed to save flow to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      const res = await fetch('/api/automations/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          flow: { nodes, edges },
          context: {
            channel: 'INSTAGRAM',
            commentText: simComment,
            isFollower: simFollower,
            alreadySentLink: simAlreadySent,
            userHandle: '@anita_shrestha',
          },
        }),
      });
      const data = await res.json();
      if (data?.result) {
        setExecutedPath(data.result.executedPath || []);
        setSimOutput(data.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getNodeCenter = (nodeId: string, portType: 'out' | 'in' | 'out-true' | 'out-false' | string) => {
    const n = nodes.find((node) => node.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    const width = 270;
    const baseHeight = 140;

    if (portType === 'in') return { x: n.x, y: n.y + 60 };
    if (portType === 'out-true') return { x: n.x + width, y: n.y + 40 };
    if (portType === 'out-false') return { x: n.x + width, y: n.y + 90 };
    
    if (portType && portType.startsWith('btn-') && n.buttons) {
      const btnIndex = n.buttons.findIndex((b) => b.id === portType);
      if (btnIndex >= 0) {
        return { x: n.x + width, y: n.y + 110 + btnIndex * 38 };
      }
    }

    return { x: n.x + width, y: n.y + baseHeight / 2 };
  };

  const filteredReels = reelsList.filter((r) =>
    r.caption.toLowerCase().includes(reelSearchQuery.toLowerCase()) ||
    r.platform_content_id.toLowerCase().includes(reelSearchQuery.toLowerCase())
  );

  // =========================================================================
  // VIEW A: INTERACTIVE VISUAL CANVAS STUDIO
  // =========================================================================

  if (isCanvasOpen) {
    return (
      <div className="flex h-full w-full bg-[#f8f9fa] text-zinc-900 overflow-hidden relative select-none">
        
        {/* Top Header Banner */}
        <div className="absolute top-4 left-6 z-30 flex items-center gap-3">
          <button
            onClick={() => setIsCanvasOpen(false)}
            className="h-9 px-3.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-sm transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>Templates Menu</span>
          </button>
          <div className="h-4 w-px bg-zinc-300" />
          <span className="text-xs font-bold text-zinc-800">{flowTitle}</span>
        </div>

        {/* Top Floating Helper Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200 shadow-sm text-xs font-medium text-zinc-700 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-pink-500" />
            <span>Click Trigger Node to select any Instagram Reel or Post</span>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div className="absolute top-4 right-6 z-30 flex items-center gap-2.5">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-sm animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved to Database!</span>
            </span>
          )}

          <button
            onClick={() => {
              setIsSimulating(!isSimulating);
              if (!isSimulating) handleRunSimulation();
            }}
            className={`h-9 px-4 rounded-xl border text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>{isSimulating ? 'Close Live Tester' : 'Live Test Flow'}</span>
          </button>

          <button
            onClick={handleSaveFlow}
            disabled={isSaving}
            className="h-9 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Go Live</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-8 right-6 z-30 flex flex-col gap-2">
          <div className="flex flex-col bg-white border border-zinc-200 rounded-xl shadow-md overflow-hidden">
            <button 
              onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}
              className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 border-b border-zinc-100"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.6))}
              className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
            title="Reset Canvas View"
            className="w-9 h-9 rounded-xl bg-white border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Flow Canvas */}
        <div
          className="flex-1 h-full w-full relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Connector Lines */}
            <svg className="absolute top-0 left-0 w-[2600px] h-[1800px] pointer-events-none z-0">
              {edges.map((edge) => {
                const fromPort = edge.buttonId || edge.branch || 'out';
                const p1 = getNodeCenter(edge.from, fromPort);
                const p2 = getNodeCenter(edge.to, 'in');

                const isEdgeActive =
                  executedPath.includes(edge.from) && executedPath.includes(edge.to);

                const strokeColor = isEdgeActive
                  ? '#2563eb'
                  : edge.branch === 'true'
                  ? '#10b981'
                  : edge.branch === 'false'
                  ? '#ef4444'
                  : edge.buttonId
                  ? '#3b82f6'
                  : '#94a3b8';

                const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 40);
                const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isEdgeActive ? 3.5 : 2.5}
                      strokeDasharray={isEdgeActive ? '6,3' : '0'}
                      className={isEdgeActive ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Flow Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isExecuted = executedPath.includes(node.id);
              const nodeButtons = node.buttons || [];

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  className={`canvas-node absolute w-[270px] rounded-2xl bg-white border-2 p-4 shadow-lg transition-all cursor-pointer ${
                    isExecuted
                      ? 'border-emerald-500 ring-4 ring-emerald-100'
                      : isSelected
                      ? 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 text-xs font-semibold text-zinc-800">
                    <div className="flex items-center gap-1.5">
                      {node.type === 'trigger' ? (
                        <Zap className="w-4 h-4 text-zinc-600 fill-current" />
                      ) : node.type === 'public_reply' ? (
                        <Shuffle className="w-4 h-4 text-pink-600" />
                      ) : node.type === 'condition' ? (
                        <Filter className="w-4 h-4 text-cyan-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-[9px] text-white font-bold">
                          IG
                        </div>
                      )}
                      <span className="truncate">{node.title}</span>
                    </div>
                    {isExecuted && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                        Executed
                      </span>
                    )}
                  </div>

                  {/* Node Type: TRIGGER (Shows Connected Reel Thumbnail & Title) */}
                  {node.type === 'trigger' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                      {node.selectedReelThumbnail ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={node.selectedReelThumbnail}
                            alt="Reel"
                            className="w-12 h-14 rounded-lg object-cover border border-emerald-300 shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-pink-600 uppercase flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              <span>Connected Reel</span>
                            </span>
                            <p className="font-bold text-xs text-zinc-900 truncate mt-0.5">
                              {node.selectedReelTitle || node.content}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-mono mt-0.5 truncate">
                              Keywords: {node.triggerKeywords || 'PRICE, LINK'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                            <span>{node.subtitle}</span>
                          </div>
                          <p className="text-[11px] text-emerald-700">{node.content}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Node Type: PUBLIC COMMENT REPLY POOL */}
                  {node.type === 'public_reply' && (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Random Pool (Anti-Spam)</span>
                        <span className="font-bold text-pink-600 font-mono">{(node.publicReplies || []).length} Options</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-200/80 space-y-1 text-xs text-pink-950">
                        <p className="font-semibold italic">"{node.publicReplies?.[0] || 'Check your DMs! 💌'}"</p>
                        <p className="text-[10px] text-pink-700">+ {Math.max((node.publicReplies || []).length - 1, 0)} other options</p>
                      </div>
                    </div>
                  )}

                  {/* Node Type: PRIVATE MESSAGE */}
                  {node.type === 'message' && (
                    <div className="mt-2.5 space-y-2">
                      <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed line-clamp-3">
                        {node.content}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {nodeButtons.map((btn) => (
                          <div
                            key={btn.id}
                            className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-xs font-semibold text-zinc-800 flex items-center justify-between relative hover:border-blue-300"
                          >
                            <span className="truncate text-left">{btn.label}</span>
                            {btn.actionType === 'OPEN_URL' && <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />}
                            {btn.actionType === 'HUMAN_HANDOFF' && <Badge variant="warning" className="text-[9px] py-0 px-1">Agent</Badge>}
                            
                            <div className="w-3 h-3 rounded-full bg-blue-500 absolute -right-4 top-1/2 -translate-y-1/2 border-2 border-white shadow-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Node Type: CONDITION */}
                  {node.type === 'condition' && (
                    <div className="mt-2.5 space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center justify-between relative">
                        <span>{node.conditionTrueLabel || 'True'}</span>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -right-4 top-1/2 -translate-y-1/2 border-2 border-white shadow-sm" />
                      </div>
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 font-medium flex items-center justify-between relative">
                        <span className="truncate">{node.conditionFalseLabel || 'False'}</span>
                        <div className="w-3 h-3 rounded-full bg-red-500 absolute -right-4 top-1/2 -translate-y-1/2 border-2 border-white shadow-sm" />
                      </div>
                    </div>
                  )}

                  {node.type !== 'condition' && nodeButtons.length === 0 && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-zinc-400 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Configuration Drawer (Slide-Over Panel) */}
        {selectedNode && !isSimulating && (
          <div className="w-96 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-40 animate-in slide-in-from-right duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              
              {/* TRIGGER CONFIGURATION & REEL SELECTION */}
              {selectedNode.type === 'trigger' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-zinc-900 block mb-1.5">Trigger Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateSelectedNode('triggerMode', 'SPECIFIC_REEL')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedNode.triggerMode !== 'ANY_REEL'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-zinc-200 bg-white text-zinc-700'
                        }`}
                      >
                        Specific Reel
                      </button>
                      <button
                        onClick={() => updateSelectedNode('triggerMode', 'ANY_REEL')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedNode.triggerMode === 'ANY_REEL'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-zinc-200 bg-white text-zinc-700'
                        }`}
                      >
                        Any Reel / Post
                      </button>
                    </div>
                  </div>

                  {/* Connected Reel Card with "Change Reel" button */}
                  {selectedNode.triggerMode !== 'ANY_REEL' && (
                    <div className="space-y-2">
                      <label className="font-bold text-zinc-900 block">Selected Instagram Reel</label>
                      <div className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={selectedNode.selectedReelThumbnail || SAMPLE_REELS[0].media_url}
                            alt="Reel"
                            className="w-14 h-16 rounded-xl object-cover border border-zinc-300 shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-pink-600 uppercase flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              <span>Instagram Reel</span>
                            </span>
                            <p className="font-bold text-xs text-zinc-900 truncate mt-0.5">
                              {selectedNode.selectedReelTitle || 'Reel #42 (Black Velvet Dress)'}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Ready for auto-replies</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsReelPickerOpen(true)}
                          className="h-8 px-3 rounded-lg bg-white border border-zinc-200 hover:border-blue-500 text-blue-600 font-semibold text-xs shrink-0 shadow-sm transition-all"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Trigger Keywords */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                    <label className="font-bold text-zinc-900 block">Comment Trigger Keywords</label>
                    <input
                      type="text"
                      value={selectedNode.triggerKeywords || 'PRICE, LINK, BUY, KATI, SHOP'}
                      onChange={(e) => updateSelectedNode('triggerKeywords', e.target.value)}
                      className="w-full h-8 px-2.5 border border-zinc-300 rounded-lg text-zinc-900 text-xs font-mono focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-zinc-500">
                      When someone comments any of these words on this Reel, the flow triggers immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* PUBLIC REPLY CONFIGURATION */}
              {selectedNode.type === 'public_reply' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-pink-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Shuffle className="w-3.5 h-3.5 text-pink-600" />
                      <span>Randomized Reply Pool</span>
                    </p>
                    <p className="text-[11px] text-pink-700">
                      Cycles through these public comment replies randomly to keep comments authentic and prevent Meta spam flags.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-zinc-900 block">Reply Variations ({selectedNode.publicReplies?.length || 0})</label>
                    {(selectedNode.publicReplies || []).map((reply, i) => (
                      <div key={i} className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-2">
                        <span className="text-zinc-800 text-xs italic">"{reply}"</span>
                        <button
                          onClick={() => handleRemovePublicReplyVariation(i)}
                          className="text-zinc-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="font-medium text-zinc-700 block">Add New Variation</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPublicReplyText}
                        onChange={(e) => setNewPublicReplyText(e.target.value)}
                        placeholder="e.g. Check your messages! 🛍️"
                        className="flex-1 h-8 px-2.5 border border-zinc-300 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-blue-600"
                      />
                      <button
                        onClick={handleAddPublicReplyVariation}
                        className="h-8 px-3 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 space-y-2">
                    <label className="font-bold text-zinc-900 block">If User Comments Again (Already Sent Link)</label>
                    <textarea
                      rows={2}
                      value={selectedNode.alreadySentReply || ''}
                      onChange={(e) => updateSelectedNode('alreadySentReply', e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-blue-600 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* DIRECT MESSAGE & MULTI-CTA BUTTONS */}
              {selectedNode.type === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-zinc-800 block mb-1.5">Instagram Direct Message</label>
                    <textarea
                      rows={4}
                      value={selectedNode.content || ''}
                      onChange={(e) => updateSelectedNode('content', e.target.value)}
                      className="w-full p-3 border border-zinc-300 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-blue-600 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-zinc-900 block">Interactive Buttons (CTAs)</label>
                        <span className="text-[11px] text-zinc-500">Add up to 3 buttons per message</span>
                      </div>
                      <button
                        onClick={handleAddButton}
                        className="h-7 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors border border-blue-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Button</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(selectedNode.buttons || []).map((btn, index) => (
                        <div key={btn.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-700 text-[11px]">Button #{index + 1}</span>
                            <button
                              onClick={() => handleDeleteButton(btn.id)}
                              className="text-zinc-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-zinc-600 block mb-1">Button Label</label>
                            <input
                              type="text"
                              value={btn.label}
                              onChange={(e) => handleUpdateButton(btn.id, { label: e.target.value })}
                              className="w-full h-8 px-2.5 border border-zinc-300 rounded-lg text-zinc-900 text-xs bg-white focus:outline-none focus:border-blue-600 font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-medium text-zinc-600 block mb-1">Action Type</label>
                              <select
                                value={btn.actionType}
                                onChange={(e) => handleUpdateButton(btn.id, { actionType: e.target.value as any })}
                                className="w-full h-8 px-2 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-blue-600"
                              >
                                <option value="TRIGGER_NODE">Trigger Next Message</option>
                                <option value="OPEN_URL">Open Web URL</option>
                                <option value="HUMAN_HANDOFF">Human Handoff</option>
                              </select>
                            </div>

                            {btn.actionType === 'TRIGGER_NODE' && (
                              <div>
                                <label className="text-[11px] font-medium text-zinc-600 block mb-1">Target Node</label>
                                <select
                                  value={btn.targetNodeId || ''}
                                  onChange={(e) => handleUpdateButton(btn.id, { targetNodeId: e.target.value })}
                                  className="w-full h-8 px-2 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-blue-600"
                                >
                                  <option value="">-- Connect Node --</option>
                                  {nodes
                                    .filter((n) => n.id !== selectedNode.id && n.type !== 'trigger')
                                    .map((n) => (
                                      <option key={n.id} value={n.id}>
                                        {n.title}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}

                            {btn.actionType === 'OPEN_URL' && (
                              <div>
                                <label className="text-[11px] font-medium text-zinc-600 block mb-1">Redirect URL</label>
                                <input
                                  type="text"
                                  value={btn.url || ''}
                                  onChange={(e) => handleUpdateButton(btn.id, { url: e.target.value })}
                                  className="w-full h-8 px-2 border border-zinc-300 rounded-lg text-zinc-900 text-xs bg-white focus:outline-none focus:border-blue-600 font-mono"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Interactive Simulator Drawer */}
        {isSimulating && (
          <div className="w-96 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-40 animate-in slide-in-from-right duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-blue-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-950">Live Flow Sandbox</h3>
              </div>
              <button onClick={() => setIsSimulating(false)} className="p-1 text-blue-700 hover:bg-blue-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-zinc-800 block">Simulate Inbound Interaction</label>
                <input
                  type="text"
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  className="w-full h-9 px-3 border border-zinc-300 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-800">Has User Already Received Link?</p>
                  <p className="text-[11px] text-zinc-500">Test repeat comment replies</p>
                </div>
                <input
                  type="checkbox"
                  checked={simAlreadySent}
                  onChange={(e) => setSimAlreadySent(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              <Button onClick={handleRunSimulation} size="md" className="w-full gap-2">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Sandbox Run</span>
              </Button>

              {simOutput && (
                <div className="space-y-3 pt-3 border-t border-zinc-200">
                  <p className="font-bold text-zinc-900">Execution Steps Log:</p>

                  {simOutput.finalOutput?.publicReply && (
                    <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 space-y-1">
                      <span className="font-bold text-pink-900 text-[11px] uppercase tracking-wider block">
                        Published Public Reply on Reel:
                      </span>
                      <p className="text-xs font-semibold text-pink-950 italic">
                        "{simOutput.finalOutput.publicReply}"
                      </p>
                    </div>
                  )}

                  {simOutput.steps?.map((step: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-800">{step.action}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      {step.messageText && (
                        <p className="text-[11px] text-zinc-600 italic">"{step.messageText.slice(0, 70)}..."</p>
                      )}
                      {step.publicReplyChosen && (
                        <p className="text-[11px] text-pink-700 italic">Public: "{step.publicReplyChosen}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REEL SELECTOR MODAL (Instagram Grid Picker) */}
        {isReelPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 p-6 w-full max-w-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Select Instagram Reel or Post</h3>
                  <p className="text-xs text-zinc-500">Pick which content will trigger this automation flow</p>
                </div>
                <button onClick={() => setIsReelPickerOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reelSearchQuery}
                  onChange={(e) => setReelSearchQuery(e.target.value)}
                  placeholder="Search reels by caption or SKU..."
                  className="w-full h-10 pl-9 pr-3 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Reels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredReels.map((reel) => {
                  const isCurrentlySelected = selectedNode?.selectedReelId === reel.platform_content_id;

                  return (
                    <div
                      key={reel.platform_content_id}
                      onClick={() => handleSelectReel(reel)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 hover:shadow-md ${
                        isCurrentlySelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={reel.media_url}
                          alt="Reel"
                          className="w-16 h-20 rounded-xl object-cover shadow-sm"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase flex items-center gap-0.5">
                          <Film className="w-2.5 h-2.5" />
                          <span>{reel.content_type}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-500 font-mono">
                            {reel.platform_content_id.toUpperCase()}
                          </span>
                          {isCurrentlySelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-snug">
                          {reel.caption}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-0.5">
                          <span>{reel.views || '45K'} views</span>
                          <span>•</span>
                          <span>{reel.comments_count || 120} comments</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span>Synced with Meta Graph API v19.0</span>
                <Button variant="outline" size="sm" onClick={() => setIsReelPickerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW B: READY-MADE TEMPLATE GALLERY
  // =========================================================================

  return (
    <div className="flex h-full w-full bg-[#f8f9fa] text-zinc-900 overflow-hidden select-none">
      
      {/* Inner Sub-Navigation Sidebar */}
      <div className="w-60 border-r border-zinc-200 bg-white flex flex-col shrink-0 p-4 space-y-6">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Automation Hub</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Multi-CTA templates & Reel mapping</p>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ready-Made Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('my-automations')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'my-automations'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Workflow className="w-4 h-4 text-blue-600" />
            <span>My Active Flows</span>
          </button>

          <button
            onClick={() => setActiveTab('sequences')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'sequences'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Drip Sequences</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* TAB 1: TEMPLATE GALLERY */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Pre-Built Automation Templates</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Select any specific Instagram Reel or Post to connect and automate.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: 'ALL', label: 'All Templates' },
                    { key: 'VIRAL_GROWTH', label: 'Viral Growth' },
                    { key: 'ECOMMERCE', label: 'E-Commerce' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeCategory === cat.key
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {template.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {template.stepCount} Steps Flow
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </h4>

                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {template.previewPills.map((pill, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium flex items-center gap-1"
                          >
                            {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-zinc-400" />}
                            <span>{pill}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{template.badge}</span>
                      </span>

                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span>Use Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: MY AUTOMATIONS */}
          {activeTab === 'my-automations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">My Active Automation Flows</h3>
                  <p className="text-xs text-zinc-500">Connected Reels deployed to Meta Graph APIs</p>
                </div>
                <button
                  onClick={() => setIsCanvasOpen(true)}
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build New Flow</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden divide-y divide-zinc-100 shadow-sm">
                <div 
                  onClick={() => handleUseTemplate(TEMPLATES[0])}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={SAMPLE_REELS[0].media_url}
                      alt="Reel"
                      className="w-12 h-14 rounded-xl object-cover shadow-sm border border-zinc-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Reel #42: Black Velvet Party Dress</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Trigger: Reel #42 Comments → 4 Random Public Replies + Private Product DM (NPR 3,499)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      LIVE • Reel #42 Bound
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEQUENCES */}
          {activeTab === 'sequences' && (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-3 shadow-sm">
              <Clock className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900">Multi-Step Drip Sequences</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Schedule delayed follow-up DMs within Meta's compliant 24-hour window.
              </p>
              <button
                onClick={() => handleUseTemplate(TEMPLATES[0])}
                className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
              >
                Launch Visual Canvas
              </button>
            </div>
          )}

        </div>
      </div>

      {/* TEMPLATE 1: CUSTOM DM AUTO-REPLY CONFIGURATION MODAL */}
      {isTemplate1ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Template 1: Custom DM Auto-Responder
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Automate custom direct message replies for all incoming texts or specific keywords.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplate1ModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Status Toggle */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Automation Status</h4>
                  <p className="text-[11px] text-zinc-500">
                    When active, incoming Instagram DMs will be automatically processed.
                  </p>
                </div>
                <button
                  onClick={() => setT1Status((s) => (s === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'))}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                    t1Status === 'ACTIVE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {t1Status === 'ACTIVE' ? '✓ ACTIVE' : '⏸ PAUSED'}
                </button>
              </div>

              {/* Step 1: Trigger Condition */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  <span>1. Inbound Trigger Condition</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setT1TriggerMode('ANY_TEXT')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      t1TriggerMode === 'ANY_TEXT'
                        ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-zinc-900">Any Inbound Message</span>
                      <input
                        type="radio"
                        checked={t1TriggerMode === 'ANY_TEXT'}
                        onChange={() => setT1TriggerMode('ANY_TEXT')}
                        className="text-purple-600"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Responds to <strong>every incoming DM</strong> (e.g. "hi", "hello", "hey", or any question).
                    </p>
                  </div>

                  <div
                    onClick={() => setT1TriggerMode('KEYWORDS')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      t1TriggerMode === 'KEYWORDS'
                        ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-zinc-900">Specific Keywords Only</span>
                      <input
                        type="radio"
                        checked={t1TriggerMode === 'KEYWORDS'}
                        onChange={() => setT1TriggerMode('KEYWORDS')}
                        className="text-purple-600"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Triggers only when the message contains selected keywords (e.g. "price", "kati", "order").
                    </p>
                  </div>
                </div>

                {/* Keywords Tag Input (If keywords mode is selected) */}
                {t1TriggerMode === 'KEYWORDS' && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 animate-in fade-in duration-200">
                    <label className="text-[11px] font-bold text-zinc-700">Configured Keywords:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {t1Keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{kw}</span>
                          <button
                            onClick={() => setT1Keywords((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add new keyword (e.g. offer, buy, size)..."
                        value={t1NewKeyword}
                        onChange={(e) => setT1NewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && t1NewKeyword.trim()) {
                            e.preventDefault();
                            if (!t1Keywords.includes(t1NewKeyword.trim().toLowerCase())) {
                              setT1Keywords([...t1Keywords, t1NewKeyword.trim().toLowerCase()]);
                            }
                            setT1NewKeyword('');
                          }
                        }}
                        className="flex-1 h-9 px-3 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          if (t1NewKeyword.trim()) {
                            if (!t1Keywords.includes(t1NewKeyword.trim().toLowerCase())) {
                              setT1Keywords([...t1Keywords, t1NewKeyword.trim().toLowerCase()]);
                            }
                            setT1NewKeyword('');
                          }
                        }}
                        className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Custom Automated Reply Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>2. Custom Automated Reply Message</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {t1ReplyText.length} characters
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={t1ReplyText}
                  onChange={(e) => setT1ReplyText(e.target.value)}
                  placeholder="Type your automated response here..."
                  className="w-full p-3.5 rounded-2xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed shadow-sm font-sans"
                />
              </div>

              {/* Step 3: Product Card Attachment */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Attach Featured Product Card</h4>
                  <p className="text-[11px] text-indigo-700/80">
                    Automatically sends the Black Velvet Party Dress card with direct "VIEW PRICE" CTA button.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={t1AttachProduct}
                  onChange={(e) => setT1AttachProduct(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <button
                onClick={() => setIsTemplate1ModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200/60 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTemplate1}
                disabled={t1IsSaving}
                className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                {t1IsSaving ? (
                  <span>Saving...</span>
                ) : t1SaveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved & Live!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Deploy Automation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
