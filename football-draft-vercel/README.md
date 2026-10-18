# Football Draft — Vercel

## Publicar

1. Cria um repositório novo no GitHub e carrega os ficheiros desta pasta (não o ZIP fechado).
2. Em https://vercel.com/new escolhe **Import Git Repository** e seleciona o repositório.
3. Framework: Next.js. Root Directory: `./`. Build Command: `npm run build` (predefinido).
4. Clica em **Deploy**. Abre o URL `*.vercel.app` apresentado pela Vercel.

## Executar localmente

Requer Node.js 20+. `npm install` e `npm run dev`.

## Limitações reais

- O Transfermarkt pode bloquear pedidos da Vercel; a API devolve erro sem inventar preço.
- O catálogo incorporado é demonstrativo, não são 1.000 jogadores com valores atualizados.
- As equipas ficam no `localStorage` de cada navegador, não existe sincronização entre dispositivos nem modo versus em tempo real.
- A importação de CSV é local ao navegador que importou.
- Para multiplayer real, será necessário adicionar autenticação e uma base de dados (ex.: Supabase).
- Respeita as condições de utilização e limites de acesso da fonte de dados.
