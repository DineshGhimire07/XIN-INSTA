import { OutboundResult } from '@/types';
import { ProductCardPayload } from './instagram.adapter';

export class FacebookAdapter {
  private apiVersion: string;

  constructor() {
    this.apiVersion = process.env.META_GRAPH_API_VERSION || 'v19.0';
  }

  /**
   * Sends a private message to a Facebook Page post commenter
   */
  public async sendCommentPrivateReply(
    accessToken: string,
    commentId: string,
    product: ProductCardPayload
  ): Promise<OutboundResult> {
    const url = `https://graph.facebook.com/${this.apiVersion}/me/messages?access_token=${encodeURIComponent(accessToken)}`;

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
          isRetryable: [4, 17, 32].includes(json.error?.code),
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
        isRetryable: true,
      };
    }
  }

  /**
   * Posts a public comment reply under a Facebook Page post
   */
  public async sendPublicCommentReply(
    accessToken: string,
    commentId: string,
    message: string
  ): Promise<OutboundResult> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${commentId}/comments?access_token=${encodeURIComponent(accessToken)}`;

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
}
