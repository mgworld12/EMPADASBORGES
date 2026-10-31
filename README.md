# Empadas Borges — loja online

Projeto estático para publicação no GitHub Pages. A loja permite escolher Empadas ou Pão de queijo, montar o carrinho e enviar o pedido para o WhatsApp.

## Publicar/atualizar no GitHub Pages

1. Abra o repositório `EMPADASBORGES` no GitHub.
2. Substitua os arquivos da publicação pelos arquivos desta pasta, mantendo a pasta `assets`.
3. Faça o commit das alterações.
4. Aguarde alguns minutos e atualize o site. Se o celular mostrar a versão antiga, feche e abra novamente o navegador; o cache do aplicativo foi atualizado para a versão 2.

## Regras do cardápio

- Empada grande: R$ 4,50 por unidade.
- Empada pequena: R$ 1,00 por unidade.
- Pão de queijo: R$ 0,75 por unidade.
- Porções de pão de queijo: 5, 10, 15 ou 20 unidades; o preço é calculado pela quantidade.

Os sabores e preços são configurados no início de `script.js`, no objeto `EMPADAS` e na constante `PAO_PRECO`.

## WhatsApp

O número de destino dos pedidos é configurado em `WHATSAPP_PEDIDOS`, no início de `script.js`, no formato internacional sem sinais: `5521971065848`.

## Aplicativo (PWA)

O site possui `manifest.json` e `sw.js` para instalação em dispositivos compatíveis, após publicação em HTTPS.


## Contato e PIX

- WhatsApp para pedidos: (21) 97106-5848.
- Chave PIX (telefone): (21) 97106-5848.
- Instagram: @empadasborges.
