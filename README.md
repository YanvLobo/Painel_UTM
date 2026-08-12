# Painel UTM

Painel para saber **de qual campanha veio cada compra** da loja Shopify
(utm_source, utm_medium, utm_campaign, utm_term, utm_content) e **quando**
ela aconteceu.

Stack: Next.js (App Router) + Postgres (Prisma) + Auth.js (login por
email/senha) + Recharts.

## Como funciona

1. Um snippet leve no tema da loja lê os parâmetros `utm_*` da URL na
   primeira visita, salva em cookie (30 dias) e grava esses valores como
   *cart attributes* — o Shopify propaga isso para `note_attributes` do
   pedido automaticamente.
2. Quando um pedido é criado, o Shopify chama o webhook `orders/create` do
   painel, que valida a assinatura e grava o pedido + atribuição UTM no
   Postgres.
3. O `/dashboard` (protegido por login) lê o Postgres e mostra receita por
   fonte, receita ao longo do tempo e a lista de pedidos com as colunas de
   UTM.

## 1. Banco de dados (Neon)

1. Crie uma conta gratuita em https://neon.tech e um projeto novo.
2. Copie a *connection string* (formato
   `postgresql://user:password@host/dbname?sslmode=require`).
3. Cole em `DATABASE_URL` no seu `.env` (veja `.env.example`).
4. Rode `npm run db:push` para criar as tabelas no banco.

## 2. Criar seu usuário de login

```bash
npm run create-user -- seuemail@exemplo.com "sua-senha-forte"
```

Rode de novo com a mesma sintaxe se quiser trocar a senha depois.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 — vai redirecionar para `/login`.

## 4. Criar o Custom App no Shopify (para o webhook)

1. No Admin da loja: **Configurações → Apps e canais de vendas → Desenvolver
   apps**.
2. Clique em **Criar um app**, dê um nome (ex: "Painel UTM").
3. Em **Configuração**, na aba Admin API, adicione o escopo `read_orders`.
4. Clique em **Instalar app** e copie o **Admin API access token** (não é
   usado pelo webhook em si, mas guarde para uso futuro/API).
5. Vá em **Configurações → Notificações**, role até **Webhooks**, e crie um
   webhook:
   - Evento: `Order creation`
   - Formato: `JSON`
   - URL: `https://SEU-DOMINIO/api/webhooks/shopify/orders-create`
6. Copie o **Signing secret** mostrado ao criar o webhook e cole em
   `SHOPIFY_WEBHOOK_SECRET` no `.env` (e nas env vars da Vercel).

## 5. Instalar o snippet de captura de UTM no tema

1. No Admin: **Loja online → Temas → ⋮ → Editar código**.
2. Abra `layout/theme.liquid`.
3. Cole o conteúdo de [`theme-snippet/utm-capture.js`](theme-snippet/utm-capture.js)
   dentro de uma tag `<script>` logo antes de `</head>`:

```html
<script>
  // conteúdo de theme-snippet/utm-capture.js aqui
</script>
```

4. Salve. A partir daí, qualquer visita com `?utm_source=...` na URL passa a
   ser atribuída ao pedido, caso ele seja concluído.

## 6. Deploy (Vercel)

1. Suba o projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Configure as env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL`, `SHOPIFY_WEBHOOK_SECRET`) no projeto da Vercel.
   - Gere `NEXTAUTH_SECRET` com `openssl rand -base64 32`.
   - `NEXTAUTH_URL` deve ser a URL final de produção (ex:
     `https://painel-utm.vercel.app`).
4. Deploy. Depois, volte no passo 4 acima e aponte o webhook do Shopify para
   o domínio de produção.

## Comandos úteis

```bash
npm run db:push       # sincroniza o schema Prisma com o Postgres
npm run db:studio     # abre o Prisma Studio para inspecionar os dados
npm run create-user   # cria/atualiza um usuário de login
```

## Estrutura

- `prisma/schema.prisma` — modelo de dados (Order, UtmAttribution, Auth)
- `app/api/webhooks/shopify/orders-create/route.ts` — recebe e grava os pedidos
- `lib/utm-extract.ts` — extrai UTM do payload do pedido (cart attrs, com
  fallback para `landing_site`)
- `app/dashboard/` — página do painel e seus componentes
- `theme-snippet/utm-capture.js` — script a colar no tema Shopify
