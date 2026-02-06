/**
 * Prompt similarity calculation for anti-abuse protection
 * Detects when users try to bypass regeneration limits by making minimal changes
 */

// Common stop words to ignore in similarity calculation
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'to', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'um', 'uma', 'o', 'os', 'a', 'as', 'e', 'ou', 'mas',
  'em', 'no', 'na', 'nos', 'nas', 'de', 'do', 'da', 'dos', 'das', 'para', 'com', 'por', 'sem',
  'sobre', 'entre', 'até', 'desde', ' durante', 'após', 'antes', 'acima', 'abaixo', 'dentro',
  'fora', 'atrás', 'frente', 'lado', 'meio', 'cima', 'baixo', 'esse', 'essa', 'isso', 'aquele',
  'aquela', 'aquilo', 'este', 'esta', 'isto', 'mesmo', 'próprio', 'tal', 'qual', 'qualquer',
  'todo', 'toda', 'todos', 'todas', 'nenhum', 'nenhuma', 'algum', 'alguma', 'alguns', 'algumas',
  'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas', 'tanto', 'tanta',
  'tantos', 'tantas', 'varios', 'varias', 'outro', 'outra', 'outros', 'outras', 'quem', 'que',
  'qual', 'quais', 'cujo', 'cuja', 'cujos', 'cujas', 'quanto', 'quanta', 'quantos', 'quantas',
]);

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    // Remove punctuation but keep spaces between words
    .replace(/[^\w\s]/g, ' ')
    // Split into words
    .split(/\s+/)
    // Filter out empty strings and stop words
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate Jaccard similarity between two sets
 * Returns a value between 0 (completely different) and 1 (identical)
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 1; // Both empty = identical
  
  return intersection.size / union.size;
}

/**
 * Calculate similarity between two prompts
 * @returns Number between 0 and 1, where 1 = identical, 0 = completely different
 */
export function calculatePromptSimilarity(promptA: string, promptB: string): number {
  const wordsA = new Set(normalizeText(promptA));
  const wordsB = new Set(normalizeText(promptB));
  
  return jaccardSimilarity(wordsA, wordsB);
}

/**
 * Calculate hash for a prompt
 * This is a one-way hash for storage/comparison
 */
export function hashPrompt(prompt: string): string {
  // Simple hash function for browser compatibility
  let hash = 0;
  const normalized = prompt.toLowerCase().trim();
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Check if a prompt change is "drastic" (>50% different words)
 * @returns true if prompts are drastically different (should charge full price)
 */
export function isPromptDrasticallyDifferent(promptA: string, promptB: string): boolean {
  const similarity = calculatePromptSimilarity(promptA, promptB);
  return similarity < 0.5; // Less than 50% similar = drastic change
}

/**
 * Check if prompts are similar enough to allow regeneration
 * @returns true if similar enough (allow regeneration pricing)
 */
export function isSimilarPrompt(promptA: string, promptB: string): boolean {
  const similarity = calculatePromptSimilarity(promptA, promptB);
  return similarity >= 0.5; // At least 50% similar = allow regeneration
}

/**
 * Get detailed comparison info for debugging/logging
 */
export function getPromptComparisonInfo(
  originalPrompt: string,
  newPrompt: string
): {
  similarity: number;
  isDrasticallyDifferent: boolean;
  originalWords: string[];
  newWords: string[];
  commonWords: string[];
  uniqueWords: string[];
} {
  const wordsA = normalizeText(originalPrompt);
  const wordsB = normalizeText(newPrompt);
  
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  
  const commonWords = [...setA].filter(x => setB.has(x));
  const uniqueWords = [...new Set([...wordsA, ...wordsB])].filter(
    x => !commonWords.includes(x)
  );
  
  const similarity = calculatePromptSimilarity(originalPrompt, newPrompt);
  
  return {
    similarity,
    isDrasticallyDifferent: similarity < 0.5,
    originalWords: [...setA],
    newWords: [...setB],
    commonWords,
    uniqueWords,
  };
}
