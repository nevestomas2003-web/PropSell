# PropSell

Protótipo da PropSell (UC Análise de Requisitos 26/27). Os ecrãs seguem os mockups E01 a E12 do SRS.

## Estrutura (tem de ser esta, a pasta inteira)

```
index.html                   a app
netlify.toml                 configuração do Netlify
netlify/functions/ai.mjs     backend da IA (a chave nunca vai para o navegador)
```

## Publicar

Não basta enviar o `index.html`: sem a pasta `netlify/functions`, a IA devolve erro 404.

- **GitHub (recomendado):** pôr a pasta num repositório e importá-lo em app.netlify.com.
- **Linha de comandos** (precisa de Node):
  ```
  npm i -g netlify-cli
  netlify login
  netlify deploy --prod --dir=.
  ```
- **Arrastar e largar:** só com a pasta inteira (incluindo `netlify/functions`) e com o site criado a partir de um repositório ou da CLI; o arrastar simples de ficheiros não publica funções.

## Verificar que a IA está ligada

1. Abrir `https://O-TEU-SITE.netlify.app/api/ai` no navegador: deve aparecer `{"ok":true,"ia_configurada":true}`.
   - Página não encontrada: a função não foi publicada.
   - `ia_configurada: false`: falta a chave (ver abaixo).
2. Na app: Definições → «Testar ligação à IA».

## Chave e modelo

A IA usa o Netlify AI Gateway, que injeta `ANTHROPIC_API_KEY` e `ANTHROPIC_BASE_URL`. Para usar a tua chave, define `ANTHROPIC_API_KEY` nas variáveis do site. O modelo por defeito é `claude-sonnet-5` (muda com `AI_MODEL`).

Nota: o endereço `/api/ai` não tem autenticação nem limite por utilizador. Antes de partilhar o link, define um limite de gastos no Netlify.
