import { GoogleGenAI } from '@google/genai';
import type { AmbientState } from '@/types/ambient';

// Initialize Gemini client with unified Google API key
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

export interface GeneratedContent {
    headline: string;
    body: string;
    caption: string;
    hashtags: string[];
    slides?: string[]; // For carousel format
}

export interface ContentGenerationOptions {
    text: string;
    state: AmbientState;
    format: 'static' | 'carousel';
}

// Prompts especializados por estado (baseados no manifesto)
const STATE_PROMPTS: Record<AmbientState, string> = {
    neutral: `Você é um copywriter especialista em posts para redes sociais.
    Crie um texto impactante e engajador baseado na ideia do usuário.
    O texto deve ser claro, direto e criar conexão emocional.`,

    motivational: `Você é um especialista em conteúdo motivacional ÉPICO.
    Crie frases de impacto que façam o leitor sentir que pode conquistar qualquer coisa.
    Use repetição emocional, palavras de poder como "VOCÊ", "AGORA", "NUNCA".
    O texto deve ser centralizado e gigante mentalmente - cada palavra conta.
    Tom: Inspirador, empoderador, transformador.`,

    informative: `Você é um especialista em conteúdo educativo e informativo.
    Transforme a ideia em um post organizado e fácil de consumir.
    Use estrutura clara: hook + informação + takeaway.
    Tom: Profissional, confiável, didático.
    Inclua um fato interessante ou estatística quando relevante.`,

    promotional: `Você é um copywriter especialista em vendas diretas.
    Crie um texto com URGÊNCIA e escassez.
    Destaque: benefício principal, preço/desconto, chamada para ação.
    Use números e percentuais quando possível.
    Tom: Urgente, exclusivo, irresistível.
    O CTA deve ser impossível de ignorar.`,

    personal: `Você é um storyteller especialista em conexão humana.
    Transforme a ideia em uma narrativa pessoal que gera identificação.
    Use primeira pessoa, vulnerabilidade autêntica.
    Estrutura: Gancho emocional → Jornada → Aprendizado.
    Tom: Íntimo, autêntico, inspirador pelo exemplo.`,

    educational: `Você é um professor especialista em micro-conteúdo educacional.
    Crie um tutorial ou passo-a-passo claro e acionável.
    Estrutura para carrossel: Capa → Problema → Passos → CTA.
    Use numeração e tópicos para facilitar o escaneamento.
    Tom: Didático, paciente, encorajador.`,

    controversial: `Você é um especialista em hooks provocativos e polêmicos.
    Crie um texto que faça o leitor PARAR e questionar.
    Use contraste, verdades desconfortáveis, e inversão de expectativas.
    O hook deve ser impossível de ignorar.
    Tom: Direto, corajoso, sem meias palavras.
    IMPORTANTE: Seja polêmico mas responsável - nunca ofensivo.`,
};

export async function generateContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const { text, state, format } = options;

    if (!process.env.GOOGLE_API_KEY) {
        // Fallback quando não há API key
        return {
            headline: text.length > 50 ? text.substring(0, 50) + '...' : text,
            body: text,
            caption: text,
            hashtags: ['#postspark', '#conteudo'],
        };
    }

    const statePrompt = STATE_PROMPTS[state] || STATE_PROMPTS.neutral;

    const formatInstructions = format === 'carousel'
        ? `Formato: CARROSSEL (5-6 slides)
       IMPORTANTE: Cada slide deve ter NO MÁXIMO 20-40 palavras. Seja EXTREMAMENTE conciso.
       Detalhes e explicações vão na legenda (caption), NÃO nos slides.
       
       Estrutura obrigatória:
       - Slide 1: Capa com hook poderoso (frase de impacto)
       - Slides 2-4: Conteúdo principal (1 ideia por slide, texto curto)
       - Slide 5: CTA forte e direto
       
       OBRIGATÓRIO: Retorne um array "slides" no JSON com EXATAMENTE o texto de cada slide.
       NÃO inclua "Slide 1:", "Slide 2:" etc no texto da caption. Apenas o conteúdo limpo.
       A legenda (caption) deve ser SEPARADA e contém explicações detalhadas, sem menção individual de slides.`
        : `Formato: POST ESTÁTICO
       Retorne headline (frase principal impactante) e body (texto complementar).`;

    const systemPrompt = `${statePrompt}

${formatInstructions}

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS JSON válido, sem markdown, sem comentários
2. Para carrossel: "slides" DEVE ser um array de strings ["texto slide 1", "texto slide 2", ...]
3. A "caption" é a legenda do post (até 2200 caracteres) - SEPARADA dos slides
4. Use quebras de linha DUPLAS (\\n\\n) literais entre parágrafos da legenda
5. Inclua "hashtags" como array de 5-10 hashtags relevantes
6. Use português brasileiro natural e atual
7. Seja CONCISO nos slides, detalhado na legenda

Estrutura JSON esperada para CARROSSEL:
{
  "headline": "Título do carrossel",
  "body": "Resumo curto",
  "slides": ["Texto do slide 1", "Texto do slide 2", "Texto do slide 3", "Texto do slide 4", "Texto do slide 5"],
  "caption": "Legenda completa com emojis e quebras de linha...",
  "hashtags": ["#tag1", "#tag2"]
}

Estrutura JSON esperada para POST ESTÁTICO:
{
  "headline": "Frase principal",
  "body": "Texto complementar",
  "caption": "Legenda completa...",
  "hashtags": ["#tag1", "#tag2"]
}`;

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `Ideia do usuário: "${text}"` }],
                },
            ],
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.8,
                maxOutputTokens: 1024,
            },
        });

        const responseText = response.text || '';
        // console.log('Gemini Response Raw:', responseText); // Debug response

        // Helper to sanitize JSON string
        const cleanRawJson = (raw: string): string => {
            // Extract JSON object
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) return raw;

            let json = match[0];
            let result = '';
            let inString = false;
            let escaped = false;

            for (let i = 0; i < json.length; i++) {
                const char = json[i];

                if (escaped) {
                    result += char;
                    escaped = false;
                    continue;
                }

                if (char === '\\') {
                    escaped = true;
                    result += char;
                    continue;
                }

                if (char === '"') {
                    inString = !inString;
                    result += char;
                    continue;
                }

                if (inString) {
                    if (char === '\n') {
                        result += '\\n';
                        continue;
                    }
                    if (char === '\r') {
                        continue; // Remove returns
                    }
                    if (char === '\t') {
                        result += '\\t';
                        continue;
                    }
                }

                result += char;
            }
            return result;
        };

        // Parse JSON response
        const cleanedJson = cleanRawJson(responseText);
        // console.log('[GEMINI] Cleaned JSON:', cleanedJson.substring(0, 500));

        try {
            const parsed = JSON.parse(cleanedJson);
            // console.log('[GEMINI] Parsed object:', {
            //     hasHeadline: !!parsed.headline,
            //     hasSlides: !!parsed.slides,
            //     slidesLength: parsed.slides?.length,
            //     slidesType: typeof parsed.slides,
            //     isSlidesArray: Array.isArray(parsed.slides)
            // });
            return {
                headline: parsed.headline || text,
                body: parsed.body || '',
                caption: parsed.caption || text,
                hashtags: parsed.hashtags || ['#postspark'],
                slides: parsed.slides,
            };
        } catch (parseError) {
            // console.error('JSON Parse Error causing fallback:', parseError);
            // One last try with loose regex if strict parsing fails
            // (fallback exists in catch block below)
            throw parseError;
        }

        throw new Error('Invalid JSON response format from Gemini');
    } catch (error: any) {
        // console.error('Gemini API Details:', {
        //     message: error.message,
        //     status: error.status,
        //     details: error.response ? JSON.stringify(error.response) : 'No details'
        // });
        // Fallback - IMPORTANTE: Incluir slides vazio para manter consistência
        // console.log('[GEMINI] Fallback retornado - sem slides');
        return {
            headline: text.length > 50 ? text.substring(0, 50) + '...' : text,
            body: text,
            caption: text,
            hashtags: ['#postspark'],
            slides: undefined,
        };
    }
}
