/**
 * Plan Configuration and Feature Access Control
 */

export type UserPlan = 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';

export interface PlanConfig {
  name: string;
  price: number;
  monthlySparks: number;
  engines: string[];
  formats: string[];
  features: string[];
  watermarkType: 'obstructive' | 'subtle';
  downloadQuality: 'low' | 'high';
}

export const PLAN_CONFIGS: Record<UserPlan, PlanConfig> = {
  FREE: {
    name: 'Grátis',
    price: 0,
    monthlySparks: 50, // One-time only
    engines: ['smart_match'],
    formats: ['1:1'],
    features: ['basic_generation'],
    watermarkType: 'obstructive',
    downloadQuality: 'low',
  },
  LITE: {
    name: 'Lite',
    price: 19,
    monthlySparks: 300,
    engines: ['smart_match', 'pollinations'],
    formats: ['1:1', '4:5', '9:16', '16:9'],
    features: ['basic_generation', 'pollinations', 'all_formats', 'clean_preview'],
    watermarkType: 'subtle',
    downloadQuality: 'high',
  },
  PRO: {
    name: 'Pro',
    price: 79,
    monthlySparks: 1500,
    engines: ['smart_match', 'pollinations', 'nano_banana'],
    formats: ['1:1', '4:5', '9:16', '16:9', 'carousel'],
    features: ['basic_generation', 'pollinations', 'nano_banana', 'all_formats', 'carousel', 'seo_2026', 'clean_preview'],
    watermarkType: 'subtle',
    downloadQuality: 'high',
  },
  AGENCY: {
    name: 'Agency',
    price: 249,
    monthlySparks: 5000,
    engines: ['smart_match', 'pollinations', 'nano_banana'],
    formats: ['1:1', '4:5', '9:16', '16:9', 'carousel'],
    features: ['basic_generation', 'pollinations', 'nano_banana', 'all_formats', 'carousel', 'seo_2026', 'brand_kits', 'clean_preview'],
    watermarkType: 'subtle',
    downloadQuality: 'high',
  },
  DEV: {
    name: 'Developer',
    price: 0,
    monthlySparks: 999999, // Unlimited for dev
    engines: ['smart_match', 'pollinations', 'nano_banana'],
    formats: ['1:1', '4:5', '9:16', '16:9', 'carousel'],
    features: ['basic_generation', 'pollinations', 'nano_banana', 'all_formats', 'carousel', 'seo_2026', 'brand_kits', 'clean_preview'],
    watermarkType: 'subtle',
    downloadQuality: 'high',
  },
};

/**
 * Check if a plan can use a specific feature
 */
export function canUseFeature(plan: UserPlan, feature: string): boolean {
  const config = PLAN_CONFIGS[plan];
  return config.features.includes(feature);
}

/**
 * Check if a plan can use a specific engine
 */
export function canUseEngine(plan: UserPlan, engine: string): boolean {
  const config = PLAN_CONFIGS[plan];
  return config.engines.includes(engine);
}

/**
 * Check if a plan can use a specific format
 */
export function canUseFormat(plan: UserPlan, format: string): boolean {
  const config = PLAN_CONFIGS[plan];
  return config.formats.includes(format);
}

/**
 * Check if plan supports high-quality downloads
 */
export function hasHighQualityDownload(plan: UserPlan): boolean {
  return PLAN_CONFIGS[plan].downloadQuality === 'high';
}

/**
 * Get watermark type for plan
 */
export function getWatermarkType(plan: UserPlan): 'obstructive' | 'subtle' {
  return PLAN_CONFIGS[plan].watermarkType;
}

/**
 * Get monthly spark refill amount for plan
 * Returns null for FREE plan (no refill)
 */
export function getMonthlySparks(plan: UserPlan): number | null {
  if (plan === 'FREE') return null;
  return PLAN_CONFIGS[plan].monthlySparks;
}

/**
 * Get upgrade suggestion when user tries to use unavailable feature
 */
export function getUpgradeSuggestion(
  currentPlan: UserPlan,
  desiredFeature: string
): { plan: UserPlan; reason: string } | null {
  // Find the cheapest plan that has this feature
  const plans: UserPlan[] = ['LITE', 'PRO', 'AGENCY'];
  
  for (const plan of plans) {
    if (canUseFeature(plan, desiredFeature) || canUseEngine(plan, desiredFeature)) {
      return {
        plan,
        reason: `O plano ${PLAN_CONFIGS[plan].name} inclui ${desiredFeature}`,
      };
    }
  }
  
  return null;
}

/**
 * Flash sale config for users trying to use high-cost features
 */
export const FLASH_SALE_CONFIG = {
  sparkPackAmount: 200,
  sparkPackPrice: 9, // USD
  description: 'Pack de 200 Sparks',
};
