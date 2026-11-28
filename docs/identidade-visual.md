# Identidade visual
O Figma é apenas referência visual; nada é importado diretamente dele. A única peça de marca usada como arquivo é a logo, enviada pelo Davi. Fonte dos valores: prints do Figma (Cores, Tipografia, Elementos gráficos). Valores HEX lidos dos pixels dos prints. Implementação em `frontend/src/styles/tokens.css`.

## Cores (Light / Dark)
| Token | Light | Dark |
|---|---|---|
| Roxo principal | #8746eb | #a577f3 |
| Lilás secundário | #a87af3 | #c1a1fd |
| Fundo | #ffffff | #171520 |
| Superfícies | #f5f3fa | #242130 |
| Texto principal | #262338 | #f4f0fa |
| Texto secundário | #777487 | #aaa3b8 |
| Bordas | #e6e1ef | #393445 |
| Sucesso | #39b881 | #51d299 |
| Azul | #5180f4 | #6fa3f8 |
| Verde | #39b881 | #51d299 |
| Laranja | #eda125 | #f4c135 |
| Vermelho | #e64d49 | #f07674 |

## Tipografia: Inter
Bold: títulos. Medium: subtítulos. Regular: textos e descrições. Semibold: botões. 

## Elementos gráficos
Barras de progresso, cards arredondados, linhas/conexões para trilhas, ícones minimalistas, formas geométricas sutis em lilás.

## PENDENTE (não constava nos prints, valores provisórios)
Tamanhos de fonte, espaçamentos, raios de borda e sombras. Confirmar no Figma e ajustar em `tokens.css`. As formas geométricas decorativas de fundo ainda não foram implementadas.

## Logo
Arquivos em `frontend/public/brand/`: `foco-logo.png` (tema claro), `foco-logo-dark.png` (letras claras para o tema escuro) e `foco-symbol.png` (só o símbolo, usado no favicon). Fundo transparente, gerados a partir do PNG original enviado. Uso: componente `<foco-logo [height]="40" />`, que alterna a versão conforme o tema. Se houver SVG ou PNG em alta resolução, substituir esses arquivos mantendo os nomes.
