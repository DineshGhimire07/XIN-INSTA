export type RecognizedIntent = 
  | 'PRODUCT_INQUIRY'
  | 'SIZING_INQUIRY'
  | 'AVAILABILITY_INQUIRY'
  | 'HUMAN_SUPPORT'
  | 'UNKNOWN';

interface IntentDefinition {
  intent: RecognizedIntent;
  keywords: string[];
}

const INTENT_DICTIONARY: IntentDefinition[] = [
  {
    intent: 'PRODUCT_INQUIRY',
    keywords: ['link', 'price', 'buy', 'cost', 'where', 'shop', 'order', 'kati', 'pathaidinu', 'how much'],
  },
  {
    intent: 'SIZING_INQUIRY',
    keywords: ['size', 'sizes', 'small', 'medium', 'large', 'plus size', 'fit', 'measurement', 'measurements'],
  },
  {
    intent: 'AVAILABILITY_INQUIRY',
    keywords: ['available', 'stock', 'in stock', 'out of stock', 'cha ki chaina', 'baki cha'],
  },
  {
    intent: 'HUMAN_SUPPORT',
    keywords: ['human', 'agent', 'support', 'wrong order', 'refund', 'complaint', 'exchange', 'talk to person', 'real person'],
  },
];

export interface IntentMatchResult {
  intent: RecognizedIntent;
  matchedKeyword?: string;
  confidence: number;
}

/**
 * Classifies inbound comment / message text into structured business intents
 */
export function matchIntent(rawText: string): IntentMatchResult {
  if (!rawText) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  const normalized = rawText.toLowerCase().trim();

  // Check human support first to prioritize safety handoff
  const supportDef = INTENT_DICTIONARY.find(d => d.intent === 'HUMAN_SUPPORT');
  if (supportDef) {
    for (const kw of supportDef.keywords) {
      if (normalized.includes(kw)) {
        return { intent: 'HUMAN_SUPPORT', matchedKeyword: kw, confidence: 0.99 };
      }
    }
  }

  for (const def of INTENT_DICTIONARY) {
    for (const kw of def.keywords) {
      if (normalized.includes(kw)) {
        return {
          intent: def.intent,
          matchedKeyword: kw,
          confidence: 0.95,
        };
      }
    }
  }

  return { intent: 'UNKNOWN', confidence: 0.2 };
}
