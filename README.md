# Paga meu Churrasco

Plataforma de bolão recreativo entre amigos para palpites esportivos. Sem dinheiro real — quem perder paga o churrasco!

## Stack

- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS v4** (mobile-first)
- **Prisma 5** + **PostgreSQL** (Railway)
- **NextAuth.js v4** (autenticação com JWT)
- **bcryptjs** (hash de senhas)
- **Sonner** (notificações toast)
- **Lucide React** (ícones)
- **Vitest** (testes unitários)

## Pré-requisitos

- Node.js 18+
- npm

## Setup rápido

```bash
# 1. Instalar dependências
npm install
```

Crie o arquivo `.env` na raiz com a URL pública do seu banco PostgreSQL (Railway):

```
DATABASE_URL="postgresql://postgres:SENHA@host.proxy.rlwy.net:PORTA/railway"
```

```bash
# 2. Rodar migrações no banco
npx prisma migrate dev --name init

# 3. Popular com dados de teste
npm run db:seed

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Credenciais de teste - obsoleto

| Tipo         | E-mail                      | Senha    |
| ------------ | --------------------------- | -------- |
| **Admin**    | admin@pagameuchurrasco.com  | admin123 |
| **Usuário**  | user@pagameuchurrasco.com   | user123  |
| **Usuário2** | craque@pagameuchurrasco.com | user456  |

## Scripts disponíveis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run test          # Rodar testes unitários
npm run test:watch    # Testes em modo watch
npm run db:generate   # Regenerar Prisma Client
npm run db:migrate    # Rodar migrações
npm run db:seed       # Popular banco com dados de teste
npm run db:studio     # Abrir Prisma Studio (visualizar BD)
```

## Como usar o sistema de bolões

### Criar um bolão

1. Faça login em `/login`
2. Acesse `/dashboard/pools/new`
3. Defina nome e descrição
4. Um código de convite de 6 letras será gerado automaticamente
5. Compartilhe o código com seus amigos

### Entrar em um bolão

1. Acesse `/dashboard/pools/join`
2. Insira o código de convite recebido
3. Pronto — você está no bolão!

### Fazer palpites

1. Acesse o bolão em `/dashboard/pools`
2. Clique em **Palpites**
3. Insira os placares previstos para cada partida
4. Clique em **Salvar palpite**
5. Para marcar uma partida como **vale o dobro** (1 por rodada), clique no ícone ⚡

### Regras de pontuação

| Acerto                      | Pontos |
| --------------------------- | ------ |
| Acertou o vencedor          | +3     |
| Acertou a diferença de gols | +2     |
| Acertou o total de gols     | +2     |
| Acertou o placar exato      | +10    |
| **Partida valendo dobro**   | ×2     |

**Exemplo — Placar exato:** Palpite 2×0, Resultado 2×0 → 3+2+2+10 = **17 pontos**

**Exemplo — Com dobro:** 17 pontos × 2 = **34 pontos**

### Ranking

Os participantes são ordenados por:

1. Total de pontos
2. Placares exatos
3. Resultados corretos
4. Melhor sequência
5. Data de entrada (mais antigo à frente em empate)

## Como recalcular pontuação (Admin)

1. Faça login com a conta admin
2. Acesse `/admin/pools`
3. Clique no bolão desejado
4. Clique em **Recalcular Pontuação**

Ou, ao atualizar o status de uma partida para **Finished** com o placar preenchido, o cálculo roda automaticamente.

## Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth
│   │   ├── register/       # Cadastro de usuário
│   │   ├── teams/          # CRUD Seleções
│   │   ├── players/        # CRUD Jogadores
│   │   ├── groups/         # CRUD Grupos
│   │   ├── rounds/         # CRUD Rodadas
│   │   ├── matches/        # CRUD Partidas
│   │   ├── stadiums/       # CRUD Estádios
│   │   ├── badges/         # CRUD Conquistas
│   │   ├── pools/          # Bolões (criar, entrar, palpites, ranking)
│   │   └── admin/          # Endpoints admin (bolões, recalcular)
│   ├── admin/
│   │   ├── pools/          # Gerenciar bolões
│   │   └── rounds/         # Gerenciar rodadas
│   └── dashboard/
│       └── pools/          # Bolões do usuário, palpites, ranking, badges
├── services/
│   ├── scoring/            # Lógica de pontuação
│   └── badges/             # Lógica de conquistas
├── components/
│   ├── ui/                 # Componentes base
│   ├── layout/             # Navbar, Sidebar
│   └── admin/              # Componentes admin
├── lib/
│   ├── auth.ts             # NextAuth
│   ├── prisma.ts           # Prisma Client
│   ├── utils.ts            # Utilitários
│   └── inviteCode.ts       # Gerador de código de convite
└── types/                  # TypeScript types
prisma/
├── schema.prisma           # Schema do banco de dados
├── seed.ts                 # Dados iniciais
└── migrations/             # Migrações SQL
src/__tests__/
└── scoringService.test.ts  # Testes unitários do sistema de pontuação
```

## Rotas de acesso

### Usuário

| Rota                                 | Descrição            |
| ------------------------------------ | -------------------- |
| `/dashboard`                         | Dashboard com resumo |
| `/dashboard/pools`                   | Meus bolões          |
| `/dashboard/pools/new`               | Criar bolão          |
| `/dashboard/pools/join`              | Entrar com código    |
| `/dashboard/pools/[id]`              | Detalhes do bolão    |
| `/dashboard/pools/[id]/predictions`  | Palpites             |
| `/dashboard/pools/[id]/ranking`      | Ranking              |
| `/dashboard/pools/[id]/badges`       | Conquistas           |
| `/dashboard/pools/[id]/participants` | Participantes        |

### Admin

| Rota              | Descrição        |
| ----------------- | ---------------- |
| `/admin`          | Dashboard admin  |
| `/admin/teams`    | CRUD Seleções    |
| `/admin/players`  | CRUD Jogadores   |
| `/admin/groups`   | CRUD Grupos      |
| `/admin/rounds`   | CRUD Rodadas     |
| `/admin/matches`  | CRUD Partidas    |
| `/admin/stadiums` | CRUD Estádios    |
| `/admin/badges`   | CRUD Conquistas  |
| `/admin/pools`    | Gerenciar bolões |

## Variáveis de ambiente

Arquivo `.env` (lido pelo Prisma CLI):

```
DATABASE_URL="postgresql://postgres:SENHA@host.proxy.rlwy.net:PORTA/railway"
```

Arquivo `.env.local` (lido pelo Next.js em dev):

```
DATABASE_URL="postgresql://postgres:SENHA@host.proxy.rlwy.net:PORTA/railway"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

> O Prisma lê apenas `.env`. O Next.js em desenvolvimento lê `.env.local`. Mantenha os dois com a mesma `DATABASE_URL`.

## Deploy na Vercel

### Pré-requisitos

- Banco PostgreSQL provisionado no [Railway](https://railway.app) (ou outro provider)
- Repositório no GitHub conectado à Vercel

### Passo a passo

**1. Conectar o repositório**

No painel da Vercel, clique em **Add New → Project** e importe o repositório do GitHub.

**2. Configurar variáveis de ambiente**

Na tela de configuração (ou em **Settings → Environment Variables**), adicione:

| Variável          | Valor                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`    | URL pública do Railway (ex: `postgresql://postgres:SENHA@host.proxy.rlwy.net:PORTA/railway`) |
| `NEXTAUTH_SECRET` | String aleatória segura (gere com `openssl rand -base64 32`)                                 |
| `NEXTAUTH_URL`    | URL do seu domínio na Vercel (ex: `https://meu-app.vercel.app`)                              |

> Não use a URL interna `postgres.railway.internal` — ela só funciona dentro da rede privada do Railway. Use sempre a URL pública.

**3. Configurar o comando de build**

A Vercel detecta Next.js automaticamente. Verifique em **Settings → General → Build & Development Settings** que o build command é:

```
npx prisma generate && next build
```

Isso garante que o Prisma Client seja regenerado antes de cada build.

**4. Fazer deploy**

Clique em **Deploy**. A Vercel vai:

1. Instalar dependências (`npm install`)
2. Gerar o Prisma Client (`prisma generate`)
3. Fazer o build do Next.js (`next build`)

**5. Rodar migrações (primeira vez)**

As migrações **não rodam automaticamente** no deploy. Rode uma vez localmente apontando para o banco de produção:

```bash
# Garanta que .env tem a DATABASE_URL de produção
npx prisma migrate deploy
```

Ou use `npx prisma db push` para aplicar o schema sem histórico de migrations.

**6. Popular dados iniciais (opcional)**

```bash
npm run db:seed
```

### Deploys futuros

Para novas migrations após mudanças no schema:

```bash
# Em desenvolvimento
npx prisma migrate dev --name nome_da_migration

# Aplicar em produção (antes do deploy)
npx prisma migrate deploy
```

## O que está implementado

### Base

- [x] Landing page pública
- [x] Cadastro e login
- [x] Proteção de rotas (middleware)
- [x] Dois papéis: User e Admin
- [x] Painel administrativo com CRUD completo
- [x] Design mobile-first

### Sistema de Bolões (Fase 2)

- [x] Criar bolão com código de convite único
- [x] Entrar em bolão por código
- [x] Ver bolões em que participa
- [x] Fazer palpites nas partidas disponíveis
- [x] Editar palpites até o início da partida
- [x] Bloqueio automático quando partida começa
- [x] Escolher 1 partida por rodada para valer o dobro
- [x] Cálculo automático de pontuação quando partida é finalizada
- [x] Recalcular pontuação (admin)
- [x] Ranking do bolão
- [x] Histórico de pontuação por partida com explicação
- [x] 10 badges/conquistas automáticas
- [x] Dashboard do usuário com dados reais
- [x] Rodadas para organizar partidas
- [x] Campo de rodada no admin de partidas
- [x] Admin pode ver todos os bolões e participantes
- [x] Testes unitários do sistema de pontuação (13 testes)
