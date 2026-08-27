import { OutboundResult } from '@/types';

export interface ProductCardPayload {
  title: string;
  subtitle: string;
  imageUrl?: string;
  productUrl: string;
  buttonText?: string;
}

export class InstagramAdapter {
  private apiVersion: string;

  constructor() {
    this.apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';
  }

  private getBaseUrl(accessToken: string): string {
    if (accessToken.startsWith('IGAA') || accessToken.startsWith('IG')) {
      return `https://graph.instagram.com/${this.apiVersion}`;
    }
    return `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Dispatches a private reply to an Instagram comment using the official Meta endpoint
   */
  public async sendCommentPrivateReply(
    accessToken: string,
    commentId: string,
    product: ProductCardPayload
  ): Promise<OutboundResult> {
    const base = this.getBaseUrl(accessToken);
    const url = `${base}/me/messages?access_token=${encodeURIComponent(accessToken)}`;

    const body = {
      recipient: {
        comment_id: commentId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: product.title,
                subtitle: product.subtitle,
                image_url: product.imageUrl,
                buttons: [
                  {
                    type: 'web_url',
                    url: product.productUrl,
                    title: product.buttonText || 'VIEW PRICE',
                  },
                ],
              },
            ],
          },
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          errorCode: json.error?.code,
          errorMessage: json.error?.message,
        };
      }

      return {
        success: true,
        platformMessageId: json.message_id,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Network request failed',
      };
    }
  }

  /**
   * Posts a public comment reply under an Instagram post or Reel
   */
  public async sendPublicCommentReply(
    accessToken: string,
    commentId: string,
    message: string
  ): Promise<OutboundResult> {
    const base = this.getBaseUrl(accessToken);
    const url = `${base}/${commentId}/replies?access_token=${encodeURIComponent(accessToken)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          errorCode: json.error?.code,
          errorMessage: json.error?.message,
        };
      }

      return {
        success: true,
        platformMessageId: json.id,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Network request failed',
      };
    }
  }

  /**
   * Sends a standard direct message within the 24-hour window
   */
  public async sendDirectMessage(
    accessToken: string,
    recipientId: string,
    text: string
  ): Promise<OutboundResult> {
    const base = this.getBaseUrl(accessToken);
    const url = `${base}/me/messages?access_token=${encodeURIComponent(accessToken)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          errorCode: json.error?.code,
          errorMessage: json.error?.message,
        };
      }

      return {
        success: true,
        platformMessageId: json.message_id,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Network request failed',
      };
    }
  }

  /**
   * Sends a rich generic template card with buttons directly to a user's DM
   */
  public async sendGenericCardDirectMessage(
    accessToken: string,
    recipientId: string,
    card: ProductCardPayload
  ): Promise<OutboundResult> {
    const base = this.getBaseUrl(accessToken);
    const url = `${base}/me/messages?access_token=${encodeURIComponent(accessToken)}`;

    const body = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: card.title,
                subtitle: card.subtitle,
                image_url: card.imageUrl,
                buttons: [
                  {
                    type: 'web_url',
                    url: card.productUrl,
                    title: card.buttonText || 'VIEW PRICE',
                  },
                ],
              },
            ],
          },
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          errorCode: json.error?.code,
          errorMessage: json.error?.message,
        };
      }

      return {
        success: true,
        platformMessageId: json.message_id,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Network request failed',
      };
    }
  }

  /**
   * Registers Instagram Ice Breakers / Conversation Starters
   */
  public async setConversationStarters(
    accessToken: string,
    questions: Array<{ question: string; payload: string }>
  ): Promise<OutboundResult> {
    const base = this.getBaseUrl(accessToken);
    const url = `${base}/me/messenger_profile?access_token=${encodeURIComponent(accessToken)}`;

    const body = {
      ice_breakers: questions.map((q) => ({
        question: q.question,
        payload: q.payload,
      })),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          errorCode: json.error?.code,
          errorMessage: json.error?.message,
        };
      }

      return {
        success: true,
        platformMessageId: json.result,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Network request failed',
      };
    }
  }
}
