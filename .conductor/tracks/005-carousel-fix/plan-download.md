# Plano: Download de Carrossel

Implementar funcionalidade de download de slides e melhorias de UX.

---

## Passos Atômicos

### Pre-requisitos
- [ ] Instalar `html2canvas`, `jszip`, `file-saver` e tipos ✅ (Comando já disparado)

### UX Improvements
- [ ] Modificar `MagicInterface.tsx` para setar `aspectRatio` para `5:6` quando `format` mudar para `carousel`

### Implementação do Download
- [ ] Criar utilitário `downloadCarousel.ts`
  - Função `generateCarouselImages(slides, config, theme)`
  - Renderizar componentes off-screen
  - Capturar com `html2canvas`
  - Criar ZIP
- [ ] Integrar no `MagicInterface.tsx`
  - Adicionar botão "Baixar Slides ZIP" na área de sucesso do carrossel
  - Conectar estado de loading

### Detalhes Técnicos
Para capturar os slides corretamente, vamos precisar renderizar o componente `LayoutCarousel` (ou apenas o conteúdo do slide) para cada item do array de slides em um container oculto, mas com as dimensões e estilos corretos.

**Abordagem Off-screen:**
1. Criar `div` container fixed `top-0 left-0 -z-50 opacity-0`
2. Renderizar o slide alvo
3. `html2canvas(element)`
4. Repetir para todos
5. `jszip.file(...)`
6. `zip.generateAsync(...)`
7. `saveAs(...)`
