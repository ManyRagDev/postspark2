/**
 * Spark Cost Configuration
 * Defines the cost structure for all generation types
 */

export type GenerationType = 'STATIC_POST' | 'POLLINATIONS' | 'NANO_BANANA' | 'CAROUSEL';

export interface SparkCost {
  first: number;      // Cost for initial generation
  regen: number;      // Cost for regeneration
  freeRegen: boolean; // Whether first regeneration is free
}

export const SPARK_COSTS: Record<GenerationType, SparkCost> = {
  STATIC_POST: {
    first: 10,
    regen: 2,
    freeRegen: false,
  },
  POLLINATIONS: {
    first: 25,
    regen: 0, // First regeneration is free
    freeRegen: true,
  },
  NANO_BANANA: {
    first: 80,
    regen: 10,
    freeRegen: false,
  },
  CAROUSEL: {
    first: 100,
    regen: 20,
    freeRegen: false,
  },
} as const;

export const REGENERATION_TYPES = {
  BASIC: 'basic',
  POLLINATIONS: 'pollinations',
} as const;

export type RegenerationType = typeof REGENERATION_TYPES[keyof typeof REGENERATION_TYPES];

/**
 * Get the cost for a generation action
 */
export function getGenerationCost(
  type: GenerationType,
  isRegeneration: boolean,
  hasUsedFreeRegen: boolean = false
): number {
  const cost = SPARK_COSTS[type];
  
  if (!isRegeneration) {
    return cost.first;
  }
  
  // If regeneration is free and hasn't been used yet
  if (cost.freeRegen && !hasUsedFreeRegen) {
    return 0;
  }
  
  return cost.regen;
}

/**
 * Get human-readable description for generation type
 */
export function getGenerationTypeLabel(type: GenerationType): string {
  const labels: Record<GenerationType, string> = {
    STATIC_POST: 'Post Estático',
    POLLINATIONS: 'Imagem Express',
    NANO_BANANA: 'Design de Luxo',
    CAROUSEL: 'Carrossel IA',
  };
  return labels[type];
}

/**
 * Get regeneration cost description
 */
export function getRegenerationCostLabel(type: GenerationType, hasUsedFreeRegen: boolean = false): string {
  const cost = SPARK_COSTS[type];
  
  if (cost.freeRegen && !hasUsedFreeRegen) {
    return 'Grátis (1ª vez)';
  }
  
  if (cost.regen === 0) {
    return 'Esgotado';
  }
  
  return `${cost.regen} ⚡`;
}
