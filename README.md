# Plataforma de Apreensões do Canil (3º BPM)

MVP da Fase 1 (ver `blueprint-plataforma-canil-3bpm.md`): cadastros base, registro de apreensão
em campo (PWA offline-first) e painel web de validação/indicadores.

## Produção

- **App/painel:** https://canil-3bpm-web.vercel.app
- **API:** https://canil-3bpm-api.onrender.com/api

Hospedagem 100% sem custo, uso interno do pelotão — não depende de nenhuma máquina local ligada:

| Camada               | Onde roda                  |
| -------------------- | --------------------------- |
| Frontend (Next.js)   | Vercel (free tier)           |
| Backend (NestJS)     | Render (free tier)           |
| Banco (Postgres+PostGIS) | Supabase (free tier)     |
| Storage de fotos     | Supabase Storage (free tier) |

Deploy automático a cada push na branch `main` (Vercel e Render conectados ao GitHub
`NexusLabSystems/canil-3bpm`).

> **Cold start:** o tier free do Render hiberna o backend após ~15 min sem requisições. A
> primeira chamada depois disso demora ~30–50s pra "acordar" — normal, não é bug.

## Estrutura

- `backend/` — API NestJS + Prisma (PostgreSQL).
- `web/` — Next.js (App Router). Mesma aplicação serve o app de campo do condutor (PWA) e o
  painel do comandante/admin, separados por rota e por perfil de login.

## Desenvolvimento local

As instruções abaixo são pra rodar/alterar o projeto na sua máquina. Para produção, ver a
seção acima — Vercel/Render já fazem deploy automático a cada push.

### Pré-requisitos

- Node.js 20+ (testado com Node 24).
- Um projeto Supabase (Postgres + Storage), free tier — uso interno do pelotão, sem custo.

## Infraestrutura (Supabase)

Banco de dados e armazenamento de fotos rodam no Supabase, não localmente. Em
`backend/.env`, configure:

- `DATABASE_URL` — connection string do Postgres, modo **Session pooler** (porta 5432, sem
  `?pgbouncer=true`). O modo direto (`db.<ref>.supabase.co`) é IPv6-only e pode não resolver
  em algumas redes; o session pooler funciona em qualquer rede.
- `MINIO_ENDPOINT` / `MINIO_BUCKET` / `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` — credenciais S3
  do Supabase Storage (Project Settings → Storage → S3 Connection). Bucket precisa ser público.
- `STORAGE_PUBLIC_URL` — base da URL pública de leitura (`https://<ref>.storage.supabase.co/storage/v1/object/public`),
  diferente do endpoint S3 (que exige assinatura).
- Extensão PostGIS habilitada no projeto (Database → Extensions) — usada mais adiante para os
  mapas de calor da Fase 2.

## Backend

```
cd backend
npm install
npx prisma migrate deploy   # aplica as migrations no Supabase
npm run db:seed              # cria lookups padrão + usuário admin (admin/admin123)
npm run start:dev            # API em http://localhost:3000/api
```

## Web (PWA + painel)

```
cd web
npm install
npm run dev   # ajuste a porta com -p se o backend já usar a 3000
```

`web/.env.local` define `NEXT_PUBLIC_API_URL` apontando para a API do backend.

## Deploy

- **Backend (Render):** `render.yaml` na raiz define o serviço como Blueprint. No dashboard do
  Render, conectar o repo e preencher as variáveis secretas (`DATABASE_URL`, `JWT_SECRET`,
  `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`,
  `STORAGE_PUBLIC_URL`) com os mesmos valores do `backend/.env`.
- **Frontend (Vercel):** importar o repo, Root Directory = `web`, variável de ambiente
  `NEXT_PUBLIC_API_URL=https://canil-3bpm-api.onrender.com/api`.
- Push na `main` redeploya os dois automaticamente.

## O que já funciona (Fase 1)

- Login com perfis condutor / comandante / admin.
- Tela de campo do condutor: captura GPS e horário automaticamente, seleciona tipo de apreensão
  por botões grandes, preenche campos específicos por tipo, tira foto pela câmera e salva —
  funciona offline (apreensão e foto ficam em fila local no IndexedDB e sincronizam
  automaticamente, incluindo o upload da foto, quando a rede volta).
- Histórico do condutor com status de sincronização e fotos anexadas.
- Painel do comando: dashboard básico (totais por tipo, ranking por cão), caixa de validação
  (aprovar/devolver apreensões pendentes) e cadastros (cães, condutores, binômios, listas de
  apoio) — criação/edição restrita ao perfil admin, visualização liberada para o comandante.
- Modelo de dados completo da seção 4 do blueprint, com histórico preservado de binômios.

## Pendências conhecidas

- **Segurança BYOD (seção 7 do blueprint)**: criptografia do banco local, biometria/PIN próprios
  do app, revogação remota de sessão e certificate pinning ainda não foram implementados. O app
  hoje guarda o JWT em `localStorage` e a fila offline em IndexedDB, sem criptografia adicional.
- **Log de auditoria**: ainda não implementado (quem acessou, registrou, editou ou excluiu o quê
  e quando) — próximo passo de segurança, já que o uso é interno e controlado por credenciais.
- **URLs de fotos públicas**: o bucket do Supabase Storage está com leitura anônima liberada (ok
  para uso interno). Se algum dia envolver dados mais sensíveis, considerar URLs pré-assinadas
  com expiração.

Painel (https://canil-3bpm-web.vercel.app/painel/dashboard): logue como comandante / comandante123 — vai ver dashboard com KPIs, evolução mensal, rankings, mapa de calor populado e caixa de validação com itens pendentes de verdade.
Cadastros: 5 cães (status variados — ativo, em treinamento, afastado), 5 condutores, 5 binômios. O ícone de cruz na lista de cães mostra vacina vencida em alguns.
App de campo: pode logar com qualquer um dos condutores de teste — marcossilva, julianacosta, rafaellima, brunoalves — senha teste123 — pra ver o histórico deles também.
