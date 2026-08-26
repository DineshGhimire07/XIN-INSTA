import { ComplianceGatekeeper } from '@/lib/compliance/gatekeeper';
import { supabase } from '@/lib/supabase/client';
import { selectFromResponsePool } from '@/lib/engine/response-pool';

export interface FlowButton {
  id: string;
  label: string;
  actionType: 'TRIGGER_NODE' | 'OPEN_URL' | 'HUMAN_HANDOFF';
  targetNodeId?: string;
  url?: string;
}

export interface FlowNodeData {
  id: string;
  type: 'trigger' | 'message' | 'condition' | 'public_reply';
  title: string;
  subtitle?: string;
  content?: string;
  buttons?: FlowButton[];
  buttonLabel?: string;
  buttonUrl?: string;
  // Public Comment Response Pool Variations
  publicReplies?: string[];
  selectionStrategy?: 'RANDOM_AVOID_REPEAT' | 'SEQUENTIAL';
  alreadySentReply?: string;
  x: number;
  y: number;
  conditionType?: 'IS_FOLLOWER' | 'ALREADY_SENT_LINK' | 'KEYWORD_MATCH' | 'CUSTOM';
  conditionTrueLabel?: string;
  conditionFalseLabel?: string;
  targetTrueNodeId?: string;
  targetFalseNodeId?: string;
  targetNodeId?: string;
}

export interface FlowGraph {
  id?: string;
  name: string;
  nodes: FlowNodeData[];
  edges: { 
    id: string; 
    from: string; 
    to: string; 
    branch?: 'true' | 'false' | 'default' | string; 
    buttonId?: string;
  }[];
}

export interface WorkflowExecutionResult {
  success: boolean;
  executedPath: string[];
  steps: {
    nodeId: string;
    action: string;
    messageText?: string;
    publicReplyChosen?: string;
    buttons?: FlowButton[];
    conditionResult?: boolean;
    compliancePassed: boolean;
    complianceReason: string;
  }[];
  finalOutput: {
    publicReply?: string;
    privateDMs: {
      text: string;
      buttons?: { label: string; url?: string }[];
    }[];
  };
}

export class WorkflowRunner {
  /**
   * Executes a visual flow graph given an inbound simulated or live interaction
   */
  static async executeFlow(
    flow: FlowGraph,
    context: {
      channel: 'INSTAGRAM' | 'FACEBOOK';
      commentText: string;
      isFollower: boolean;
      alreadySentLink?: boolean;
      userHandle: string;
      clickedButtonId?: string;
      accountId?: string;
      commentId?: string;
    }
  ): Promise<WorkflowExecutionResult> {
    const executedPath: string[] = [];
    const steps: WorkflowExecutionResult['steps'] = [];
    const privateDMs: WorkflowExecutionResult['finalOutput']['privateDMs'] = [];
    let chosenPublicReply: string | undefined = undefined;

    // 1. Find trigger node
    const triggerNode = flow.nodes.find((n) => n.type === 'trigger');
    if (!triggerNode) {
      return {
        success: false,
        executedPath: [],
        steps: [],
        finalOutput: { privateDMs: [] },
      };
    }

    executedPath.push(triggerNode.id);
    steps.push({
      nodeId: triggerNode.id,
      action: 'TRIGGER_COMMENT_INGESTED',
      compliancePassed: true,
      complianceReason: 'Inbound comment matched keyword trigger',
    });

    // 2. Find next connected node from trigger
    let currentEdge = flow.edges.find((e) => e.from === triggerNode.id);
    let currentNode: FlowNodeData | null = currentEdge
      ? flow.nodes.find((n) => n.id === currentEdge!.to) || null
      : null;

    let iterations = 0;
    while (currentNode && iterations < 10) {
      const activeNode: FlowNodeData = currentNode;
      iterations++;
      executedPath.push(activeNode.id);

      if (activeNode.type === 'message') {
        const buttons = activeNode.buttons || (activeNode.buttonLabel ? [{
          id: 'btn-legacy',
          label: activeNode.buttonLabel,
          actionType: activeNode.buttonUrl ? 'OPEN_URL' as const : 'TRIGGER_NODE' as const,
          url: activeNode.buttonUrl,
        }] : []);

        const compliance = await ComplianceGatekeeper.validate({
          accountId: context.accountId || 'a0000000-0000-0000-0000-000000000001',
          channel: context.channel,
          actionType: privateDMs.length === 0 ? 'COMMENT_PRIVATE_REPLY' : 'DIRECT_MESSAGE',
          recipientId: context.userHandle,
          commentCreatedAt: new Date().toISOString(),
          lastUserInteractionAt: new Date().toISOString(),
          metadata: {
            nodeId: activeNode.id,
            commentId: context.commentId || 'sim_comment_01',
          },
        });

        steps.push({
          nodeId: activeNode.id,
          action: 'DISPATCH_INSTAGRAM_PRIVATE_DM',
          messageText: activeNode.content,
          buttons,
          compliancePassed: compliance.allowed,
          complianceReason: compliance.reason,
        });

        if (compliance.allowed) {
          privateDMs.push({
            text: activeNode.content || '',
            buttons: buttons.map((b) => ({ label: b.label, url: b.url })),
          });
        }

        let nextEdge = context.clickedButtonId
          ? flow.edges.find((e) => e.from === activeNode.id && e.buttonId === context.clickedButtonId)
          : null;

        if (!nextEdge) {
          nextEdge = flow.edges.find((e) => e.from === activeNode.id);
        }

        currentNode = nextEdge ? flow.nodes.find((n) => n.id === nextEdge.to) || null : null;

      } else if (activeNode.type === 'public_reply') {
        // Evaluate Randomized Public Response Pool
        const replies = activeNode.publicReplies && activeNode.publicReplies.length > 0
          ? activeNode.publicReplies
          : [
              'Check your DMs! 💌',
              'Sent to your inbox! ✨',
              'Just dropped the link in your messages! 🛍️',
              'Details sent! Let us know if you need help with sizing 💕',
            ];

        if (context.alreadySentLink && activeNode.alreadySentReply) {
          chosenPublicReply = activeNode.alreadySentReply;
        } else {
          const res = selectFromResponsePool({ responses: replies, strategy: 'RANDOM_AVOID_REPEAT' });
          chosenPublicReply = res.text;
        }

        steps.push({
          nodeId: activeNode.id,
          action: 'POST_RANDOM_PUBLIC_COMMENT_REPLY',
          publicReplyChosen: chosenPublicReply,
          compliancePassed: true,
          complianceReason: 'Published randomized reply from anti-repetition pool',
        });

        const nextEdge = flow.edges.find((e) => e.from === activeNode.id);
        currentNode = nextEdge ? flow.nodes.find((n) => n.id === nextEdge.to) || null : null;

      } else if (activeNode.type === 'condition') {
        let isTrue = false;
        if (activeNode.conditionType === 'ALREADY_SENT_LINK') {
          isTrue = !!context.alreadySentLink;
        } else {
          isTrue = context.isFollower;
        }

        const branchType = isTrue ? 'true' : 'false';

        steps.push({
          nodeId: activeNode.id,
          action: activeNode.conditionType === 'ALREADY_SENT_LINK'
            ? 'CHECK_IF_LINK_ALREADY_SENT'
            : 'EVALUATE_FOLLOWER_CONDITION',
          conditionResult: isTrue,
          compliancePassed: true,
          complianceReason: isTrue ? 'Condition satisfied' : 'Fallback branch taken',
        });

        const branchEdge = flow.edges.find(
          (e) => e.from === activeNode.id && (e.branch === branchType || e.branch === undefined)
        );
        currentNode = branchEdge ? flow.nodes.find((n) => n.id === branchEdge.to) || null : null;
      }
    }

    return {
      success: true,
      executedPath,
      steps,
      finalOutput: {
        publicReply: chosenPublicReply || 'Sent you the details! Check your DMs 💌',
        privateDMs,
      },
    };
  }
}
