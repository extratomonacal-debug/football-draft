# Football Draft — branco e roxo

Site Next.js para Vercel. Pesquisa jogadores no Transfermarkt durante a escrita (`/api/search`) e valida o preço do perfil antes de cada contratação (`/api/player`). Os resultados podem falhar caso o Transfermarkt bloqueie consultas. Não existe API oficial garantida.

## Publicar
1. Extrai este ZIP.
2. Substitui os ficheiros do repositório GitHub existente por estes (na raiz, incluindo `app/` e `package.json`).
3. Faz commit. A Vercel deverá iniciar um novo deploy automaticamente.

## Local
`npm install` e `npm run dev`.

## Notas
- Guarda drafts e preços confirmados no localStorage do navegador; não sincroniza entre utilizadores.
- Cache de preços confirmados: 15 minutos no browser; cache de pesquisa: até 10 minutos no servidor/CDN.
- Só desconta após confirmação do valor; se falhar, não contrata.
- A posição e o clube dependem dos dados que o Transfermarkt expõe na pesquisa.
- Valores de mercado não são preços reais de transferência.
