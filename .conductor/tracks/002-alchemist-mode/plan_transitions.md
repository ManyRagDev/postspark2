# Plano: Transições Suaves de Mídia

Refinar o comportamento do BackgroundManager para manter o preview do post estável.

## Passos Atômicos
- [ ] Adicionar estado `imageSourceTab` no `BackgroundManager` [ ]
- [ ] Remover logic de reset de `selectedImage` em `handleTabClick` [ ]
- [ ] Atualizar condições de renderização das abas (Uplad/AI/Gallery) para usar `imageSourceTab` [ ]
- [ ] Validar persistência no preview do post [ ]
- [ ] Validar limpeza local do painel temporário [ ]
