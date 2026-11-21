# PropSell

Estrutura:
- index.html  -> a app (igual ao artefacto, com uma camada que liga a IA ao backend)
- netlify/functions/ai.mjs -> backend da IA (a chave nunca vai para o navegador)
- netlify.toml

Publicar (precisa de Node instalado):
  npm i -g netlify-cli
  netlify login
  netlify deploy --prod --dir=.

Ou: pôr esta pasta num repositório do GitHub e importá-lo em app.netlify.com.
A IA usa o Netlify AI Gateway (sem chave). Modelo por defeito: claude-sonnet-5
(muda com a variável de ambiente AI_MODEL).
