# Empadas Borges — loja online

Projeto estático para publicação no GitHub Pages. A loja permite escolher Empadas ou Pão de queijo, montar o carrinho, revisar e enviar o pedido para o WhatsApp.

## Publicar/atualizar no GitHub Pages

1. Abra o repositório `EMPADASBORGES` no GitHub.
2. Substitua os arquivos da publicação pelos arquivos desta pasta, **mantendo a pasta `assets`** (inclusive os novos `icone-app-*.png`).
3. Faça o commit das alterações.
4. Aguarde alguns minutos e atualize o site. O aplicativo (PWA) agora busca a versão mais nova do site sempre que há internet; ao mudar arquivos de imagem, aumente o número em `CACHE` no `sw.js` (hoje `v12`).

## Antes de publicar

- Em `index.html`, troque `https://SEU-USUARIO.github.io/EMPADASBORGES/` (tags `og:url` e `og:image`) pelo endereço real do site. Isso faz o link aparecer com imagem quando compartilhado no WhatsApp.
- Em `script.js`, no objeto `LOJA`, preencha endereço, link do mapa e horário de funcionamento. Se preencher `abre` e `fecha`, o pedido só aceita retirada nesse intervalo.

## Configuração (início do `script.js`)

- Preços e sabores: objeto `EMPADAS` e constante `PAO_PRECO`. **Os preços exibidos no site vêm daqui** — não é preciso alterar o HTML.
- `WHATSAPP_PEDIDOS`: número que recebe os pedidos, formato internacional sem sinais (`5521971065848`).
- `PIX_CHAVE`: chave PIX copiada pelo botão "Copiar chave" (celular no formato `+5521971065848`).

## Regras do cardápio (valores atuais)

- Empada grande: R$ 4,00 por unidade.
- Empada pequena: R$ 1,00 por unidade.
- Pão de queijo: R$ 0,75 por unidade.
- Porções de pão de queijo: 5, 10, 15 ou 20 unidades; o preço é calculado pela quantidade.

## Comportamento do pedido

- O carrinho, o nome e o telefone ficam salvos no navegador (o carrinho expira em 12 horas) e podem ser limpos pelo botão "Limpar pedido".
- O horário de retirada precisa estar no futuro; o horário não vem preenchido.
- Pagamento: Pix, dinheiro, cartão (na retirada) ou combinar pelo WhatsApp. A pergunta de troco só aparece para dinheiro e o valor precisa cobrir o total.
- Antes de abrir o WhatsApp, o cliente vê um resumo para conferir.

## Aplicativo (PWA)

O site possui `manifest.json` (com ícones comuns e *maskable*) e `sw.js` para instalação em dispositivos compatíveis, após publicação em HTTPS.

## Contato e PIX

- WhatsApp para pedidos: (21) 97106-5848.
- Chave PIX (telefone): (21) 97106-5848.
- Instagram: @empadasborges.
