import { SelectionStrategy } from '@/types';

export interface SelectResponseParams {
  responses: string[];
  strategy?: SelectionStrategy;
  lastChosenIndex?: number;
}

export interface SelectResponseResult {
  text: string;
  selectedIndex: number;
}

/**
 * Selects a reply string from a response pool avoiding immediate repetition
 */
export function selectFromResponsePool(params: SelectResponseParams): SelectResponseResult {
  const { responses, strategy = 'RANDOM_AVOID_REPEAT', lastChosenIndex = -1 } = params;

  if (!responses || responses.length === 0) {
    return { text: 'Sent you the details! Check your DMs 💌', selectedIndex: 0 };
  }

  if (responses.length === 1) {
    return { text: responses[0], selectedIndex: 0 };
  }

  if (strategy === 'RANDOM_AVOID_REPEAT') {
    // Generate valid candidates excluding the last picked index
    const candidates = responses
      .map((text, idx) => ({ text, idx }))
      .filter(item => item.idx !== lastChosenIndex);

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return { text: chosen.text, selectedIndex: chosen.idx };
  }

  // Fallback: standard random
  const idx = Math.floor(Math.random() * responses.length);
  return { text: responses[idx], selectedIndex: idx };
}
