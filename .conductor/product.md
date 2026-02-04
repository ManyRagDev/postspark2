# PostSpark 2.0 - Parceiro Criativo Digital

## Visão do Produto
PostSpark é uma ferramenta SaaS que elimina a "paralisia do design" para gestores de tráfego e criadores de conteúdo. Não é um editor de imagens tradicional - é um **Parceiro Criativo Digital** que transforma ideias em posts prontos para publicação com mínimo esforço.

**Proposta de Valor**: Digite sua ideia → Sistema detecta a intenção → IA gera copy otimizado → Motor de design cria o visual → Download em 1 clique.

## Filosofia Core
1. **Intenção > Perfeição**: Um post feio que vende é melhor que um post lindo que ignora a dor do cliente
2. **Mágica Invisível**: O usuário não vê "ferramentas", vê "resultados"
3. **Zero Ansiedade**: A interface deve acalmar, guiar e empoderar
4. **Nós escolhemos por ele**: Sistema toma decisões de design, usuário apenas aprova ou ajusta a "vibe"
5. **IA como Copiloto**: Gemini 2.0 Flash adapta tom e estilo automaticamente por estado

---

## O Core: Inteligência Ambiental

O sistema reage em tempo real ao texto do usuário, detectando estados emocionais/intencionais através de um algoritmo de pesos com keywords primárias (6pts), secundárias (2pts) e exclusões:

| Estado | Emoji | Gatilhos Primários | Layout | Características Visuais |
|--------|-------|-------------------|--------|------------------------|
| **Neutro** | 🟰 | (fallback quando nenhum detectado) | Centered | Design balanceado, cores neutras |
| **Motivacional** | ✨ | acredite, conquiste, nunca desista, força, superação | Headline | Fundo escuro, texto com glow dourado, vinheta |
| **Informativo** | 💡 | dica, saiba, fato, pesquisa, estatística | Card | Visual limpo/tech, alto contraste, ícones |
| **Promocional** | 🔥 | promoção, desconto, oferta, grátis, últimas vagas | Hierarchy | Cores quentes/urgentes, CTA pulsante, urgência |
| **Pessoal** | 💭 | minha história, senti, jornada, vulnerabilidade | Split | Tons pastéis, textura suave, fonte humanizada |
| **Educacional** | 📚 | aprenda, tutorial, passo a passo, como fazer | Carousel | Cores sóbrias, slides sequenciais, progressão |
| **Polêmico** | ⚡ | erro fatal, pare agora, verdade, mentira, absurdo | Headline | Alto contraste vermelho/preto, UI "afiada" |

### Algoritmo de Detecção
```
1. Normaliza texto (lowercase, remove acentos)
2. Pontua keywords: primárias=6pts, secundárias=2pts
3. Aplica exclusões (nega estado se palavra presente)
4. Bônus +30% se 3+ matches
5. Calcula confiança (0-100%)
6. Fallback para "neutro" se nenhum claro vencedor
```

---

## Funcionalidades Implementadas

### 1. **Ambient Intelligence System**
- Detecção automática de estado em tempo real (debounce 150ms)
- 7 estados distintos com temas visuais completos
- Override manual via seletor de estado
- Confidence score visível no badge

### 2. **AI Content Generation (Gemini 2.0 Flash)**
- Prompts especializados por estado (tom, estilo, vocabulário)
- Formatos: **Static** (imagem única) ou **Carousel** (5-6 slides)
- Geração de headline, body, caption e hashtags
- Fallback gracioso quando API indisponível

### 3. **Intention Zone Analysis**
- Análise de complexidade via grid 3x3
- Detecção de luminância (claro/escuro)
- Identificação de "safe areas" para texto
- Posicionamento inteligente baseado no estado

### 4. **Layout Engine (20 Princípios de Design)**
- 6 layouts distintos: Centered, Hierarchy, Split, Card, Headline, Carousel
- Escala dinâmica de fonte por comprimento de texto
- Detecção de "impact words" (NUNCA, AGORA, GRÁTIS → fonte maior)
- Contraste automático (texto claro em fundo escuro e vice-versa)
- Overlays adaptativos (gradiente ou vinheta) com opacidade calculada

### 5. **Background Management**
- **Gallery**: Backgrounds curados por categoria
- **Upload**: Imagens do usuário
- **AI Generation**: Integração com Gemini Imagen (planejado)
- Controles de posição X/Y e opacidade

### 6. **Export System**
- Download PNG para posts estáticos
- Download ZIP para carrosséis (todas as slides)
- Cópia de caption + hashtags para clipboard
- Dimensões otimizadas: 1:1, 5:6, 9:16

### 7. **Glass-morphism UI**
- Interface com efeito frosted glass
- Gradientes radiais por estado
- Animacoes suaves (Framer Motion)
- Sombras dinamicas baseadas na cor accent

### 8. **Controle Total (Edicao Pos-Geracao)**
Sistema de ajuste fino que aparece apos gerar o post, com 4 modulos:

| Modulo | Controles | Aplicacao |
|--------|-----------|-----------|
| **Imagem** | Zoom, Brilho, Contraste, Saturacao, Blur, Overlay | Filtros CSS em tempo real |
| **Design** | 10 paletas de cores + cores customizadas | Troca de tema visual |
| **Layout** | Grid 9 posicoes, Alinhamento, Padding | Posicionamento do texto |
| **Texto** | Edicao de headline/body, Escala de fonte | Ajuste fino do conteudo |

**10 Paletas Disponiveis**:
- Noite Quente, Oceano, Verde Vibrante, Por do Sol, Modo Noite
- Floresta, Carmesim, Indigo, Pessego, Cibernetico

**Filosofia**: Mantem a "magia" automatica como default, mas entrega controle total quando necessario.

---

## Personas

### Principal: João
**Gestor de tráfego** que tem ótimas ideias mas trava na execução visual. Sabe o que quer dizer, mas não sabe escolher cores, fontes ou layouts. PostSpark elimina essa fricção.

### Secundária: Maria
**Criadora de conteúdo** que posta diariamente e precisa de velocidade. Não quer perder 30min no Canva para cada post. PostSpark entrega posts prontos em segundos.

### Terciária: Pedro
**Empreendedor solo** que faz tudo sozinho. Não tem budget para designer. PostSpark é seu "designer de bolso" disponível 24/7.

---

## Métricas de Sucesso
- **Time to First Post**: < 60 segundos do input até download
- **Detecção Correta**: > 85% de acurácia no estado detectado
- **Taxa de Aprovação**: > 70% dos posts gerados são usados sem edição
- **NPS**: > 50 (promotores superam detratores)
