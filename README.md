# 🔥 Paga meu Churrasco

Plataforma de bolão online entre amigos para a Copa do Mundo e outros campeonatos esportivos.

## Stack

- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS v4** (mobile-first)
- **Prisma 5** + **SQLite** (banco local)
- **NextAuth.js v4** (autenticação com JWT)
- **bcryptjs** (hash de senhas)
- **Sonner** (notificações toast)
- **Lucide React** (ícones)

## Pré-requisitos

- Node.js 18+
- npm

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco de dados e rodar migrações
npx prisma migrate dev --name init

# 3. Popular com dados de teste
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Credenciais de teste

| Tipo       | E-mail                            | Senha    |
|------------|-----------------------------------|----------|
| **Admin**  | admin@pagameuchurrasco.com        | admin123 |
| **Usuário**| user@pagameuchurrasco.com         | user123  |

## Scripts disponíveis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run db:generate   # Regenerar Prisma Client
npm run db:migrate    # Rodar migrações
npm run db:seed       # Popular banco com dados de teste
npm run db:studio     # Abrir Prisma Studio (visualizar BD)
```

## Estrutura do projeto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth
│   │   ├── register/     # Cadastro de usuário
│   │   ├── teams/        # CRUD Seleções
│   │   ├── players/      # CRUD Jogadores
│   │   ├── groups/       # CRUD Grupos
│   │   ├── matches/      # CRUD Partidas
│   │   ├── stadiums/     # CRUD Estádios
│   │   └── badges/       # CRUD Conquistas
│   ├── admin/            # Painel administrativo
│   ├── dashboard/        # Área do usuário
│   ├── login/            # Tela de login
│   └── register/         # Tela de cadastro
├── components/
│   ├── ui/               # Componentes base (Button, Input, Card...)
│   ├── layout/           # Navbar, Sidebar, etc.
│   └── admin/            # Componentes admin
├── lib/
│   ├── auth.ts           # Configuração NextAuth
│   ├── prisma.ts         # Prisma Client singleton
│   └── utils.ts          # Utilitários
└── types/                # TypeScript types
prisma/
├── schema.prisma         # Schema do banco de dados
├── seed.ts               # Dados iniciais
└── migrations/           # Migrações SQL
```

## Rotas de acesso

| Rota              | Acesso         | Descrição                    |
|-------------------|----------------|------------------------------|
| `/`               | Público        | Landing page                 |
| `/login`          | Público        | Login                        |
| `/register`       | Público        | Cadastro                     |
| `/dashboard`      | Logado         | Dashboard do usuário         |
| `/admin`          | Admin          | Painel administrativo        |
| `/admin/teams`    | Admin          | CRUD Seleções                |
| `/admin/players`  | Admin          | CRUD Jogadores               |
| `/admin/groups`   | Admin          | CRUD Grupos                  |
| `/admin/matches`  | Admin          | CRUD Partidas                |
| `/admin/stadiums` | Admin          | CRUD Estádios                |
| `/admin/badges`   | Admin          | CRUD Conquistas              |

## Variáveis de ambiente

Arquivo `.env.local`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

## Fase 1 — O que está implementado

- [x] Landing page pública
- [x] Cadastro de usuário
- [x] Login / Logout
- [x] Proteção de rotas (middleware)
- [x] Dois papéis: User e Admin
- [x] Área do usuário com placeholders
- [x] Painel administrativo completo
- [x] CRUD de Seleções
- [x] CRUD de Jogadores
- [x] CRUD de Grupos
- [x] CRUD de Partidas
- [x] CRUD de Estádios
- [x] CRUD de Conquistas/Badges
- [x] Design mobile-first
- [x] Dados seed para testes

## Próximas fases

- [ ] Bolões entre amigos
- [ ] Sistema de palpites
- [ ] Pontuação e ranking
- [ ] Badges conquistadas pelo usuário
- [ ] Partida valendo dobro
- [ ] Notificações em tempo real
