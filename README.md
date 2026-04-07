<p align="center">
  <img src="frontend/src/assets/logo_deadlock_white.png" alt="Deadlock Logo" width="120" />
  <p align="center">Uma rede social focada na tecnologia — Onde o Stack Overflow encontra o Reddit.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

---

## 📖 Visão Geral

**Deadlock** é uma rede social focada no nicho de tecnologia, projetada como um híbrido entre **Stack Overflow** e **Reddit**.

Da mesma forma que o Stack Overflow, a plataforma é centrada em Q&A e compartilhamento de conhecimento técnico através de fóruns estruturados. Do Reddit, herda o motor de engajamento da comunidade, com um sistema de **Upvotes/Downvotes** que dá voz aos usuários para curar o conteúdo mais relevante.

O objetivo é entregar uma plataforma robusta, rápida e funcional para **desenvolvedores, profissionais de tecnologia e entusiastas**.

---

## 🛠️ Stack Técnica

### Backend

| Tecnologia                                                                                                      | Versão / Detalhes        |
| --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)          | v20+                     |
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)             | v10                      |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | v5.4+                    |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)             | v7 (ORM)                 |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | v15                      |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)                | v7 Alpine (Cache & Jobs) |
| ![Swagger](https://img.shields.io/badge/Scalar_OpenAPI-6BA539?style=flat-square&logo=swagger&logoColor=white)   | Docs em `/docs`          |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)             | Docker Compose           |

### Frontend

| Tecnologia                                                                                                                  | Versão / Detalhes         |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)                            | v19                       |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)                               | v8                        |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)             | v5.9+                     |
| ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)          | v4                        |
| ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)     | v5                        |
| ![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white) | Editor de código embutido |

---

## 🏗️ Arquitetura e Decisões Técnicas

O backend do Deadlock foi construído com foco em **escalabilidade**, **manutenibilidade** e **segurança de tipagem**. Abaixo estão as decisões arquiteturais mais relevantes:

### Arquitetura Modular (DDD)

O backend segue uma separação clara de domínios em quatro módulos principais:

```
src/modules/
├── auth/           # Autenticação (JWT, OAuth2, Guards, Strategies)
├── content/        # Domínio de conteúdo (Posts, Comments, Languages)
├── engagement/     # Facade para Views e Votes (Facade Pattern)
└── user/           # Gerenciamento de perfis e usuários
```

O `EngagementModule` é um destaque: ele atua como uma **fachada (Facade Pattern)** que encapsula e expõe os submódulos `ViewsModule` e `VotesModule`. Isso isola a complexidade do sistema de reputação e rastreamento do restante da aplicação.

### Absolute Type Safety

O TypeScript é utilizado de forma rigorosa, evitando ao máximo o uso de `any`. A integração entre os tipos gerados pelo Prisma (`Prisma.GetPayload`) e as Entities/DTOs da aplicação é feita via **Intersection Types**, garantindo que o contrato de dados entre o banco e a API seja validado em tempo de compilação.

### Transformações Dinâmicas (DTOs)

O `class-transformer` e `class-validator` são utilizados de forma avançada para a serialização de respostas. Relações complexas do banco de dados são achatadas em DTOs limpos — por exemplo, campos como `scoreVotes` e `myVote` são computados e expostos diretamente na resposta JSON, otimizando o consumo no Frontend e eliminando processamento desnecessário no client-side.

Um `SanitizePipe` global garante que todo input do usuário seja sanitizado antes de chegar aos handlers, protegendo contra XSS e injection.

### Infraestrutura Cloud-Native

Toda a infraestrutura de backend (API, PostgreSQL e Redis) roda via **Docker Compose**. O entrypoint do container aguarda a disponibilidade do banco, executa `prisma generate` e `prisma migrate deploy` automaticamente antes de iniciar a aplicação — garantindo um setup zero-config.

---

## ✨ Funcionalidades

### 📝 Sistema de Posts e Comentários

Criação de conteúdo técnico com suporte a árvore de discussão (comentários aninhados com replies). O frontend disponibiliza o **Monaco Editor** (o mesmo editor do VS Code) para formatação de snippets de código diretamente no corpo do post. Posts podem ser filtrados por linguagens de programação.

### 👤 Sistema de Usuários

Autenticação completa com **JWT** (access + refresh tokens via HttpOnly cookies) e autorização granular via Guards. Suporte a login via credenciais ou por provedores OAuth2 (**Google** e **GitHub**), com estratégias de autenticação adaptáveis (Passport.js). Perfis de usuário incluem nível de senioridade e foto de perfil.

### ⬆️ Sistema de Reputação (Upvote/Downvote)

Motor de engajamento estilo Reddit. O sistema implementa uma **máquina de estados** para garantir a integridade dos votos — impedindo múltiplos votos do mesmo usuário no mesmo post ou comentário (constraint `@@unique([postId, userId])` no banco). O cálculo do `scoreVotes` é feito em **tempo real**, isolado em transações do banco de dados para garantir consistência.

### 👁️ Rastreamento de Visualizações (Views)

Sistema inteligente de contagem de views que distingue **usuários logados de visitantes anônimos** (via fingerprinting/cookies). O Redis é utilizado como camada de performance para registro de views em tempo real, com **Cron Jobs** (`@nestjs/schedule`) responsáveis por persistir os dados no PostgreSQL periodicamente.

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/seu-usuario/deadlock.git
cd deadlock
```

### Passo 2 — Configurar variáveis de ambiente

#### Backend

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp backend/.env.docker-example backend/.env.docker
```

Edite o arquivo `backend/.env.docker` com os valores desejados. Exemplo:

```env
# Conexão do Prisma (aponta para o container do banco)
DATABASE_URL="postgresql://deadlock_user:sua_senha_segura@db:5432/deadlock_db"

# Credenciais do container PostgreSQL
POSTGRES_USER=deadlock_user
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_DB=deadlock_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=sua_chave_acesso
JWT_REFRESH_SECRET=sua_chave_refresh
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# OAuth (opcional para dev local)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Porta
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173/
```

> **Nota:** O `DATABASE_URL` deve apontar para o hostname `db` (nome do serviço no Docker Compose), não para `localhost`.

#### Frontend

```bash
cp frontend/.env-example frontend/.env
```

```env
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
VITE_GITHUB_CLIENT_ID=seu_github_client_id

VITE_API_URL=http://localhost:3000

(outras variáveis de ambiente estão no arquivo .env-example)
```

### Passo 3 — Subir a infraestrutura via Docker

```bash
cd backend
docker compose up --build -d
```

Este comando irá:

1. Buildar a imagem da aplicação NestJS
2. Subir containers do **PostgreSQL 15** e **Redis 7**
3. Executar automaticamente `prisma generate` e `prisma migrate deploy` via entrypoint
4. Iniciar o servidor da API

### Passo 4 — Executar o Frontend localmente

> ⚠️ O frontend **ainda não foi dockerizado**, por isso deve ser executado localmente.

```bash
cd frontend
npm install
npm run dev
```

### Passo 5 — Acessar a aplicação

| Serviço                | URL                                                      |
| ---------------------- | -------------------------------------------------------- |
| 🖥️ Frontend            | [http://localhost:5173](http://localhost:5173)           |
| ⚙️ API Backend         | [http://localhost:3000](http://localhost:3000)           |
| 📚 Documentação da API | [http://localhost:3000/docs](http://localhost:3000/docs) |

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para manter a qualidade e rastreabilidade do projeto, siga estas diretrizes:

### Commits

Utilize **commits semânticos** seguindo a convenção [Conventional Commits](https://www.conventionalcommits.org/) e preferencialmente escritos em Inglês:

```
feat: adds notification system
fix: corrects score calculation in duplicate votes
docs: updates README with installation guide
refactor: extracts views logic to dedicated module
```

### Pull Requests

Ao abrir um PR, inclua no mínimo:

1. **O que foi feito** — Descrição clara das alterações
2. **Por que foi feito** — Contexto e motivação da mudança
3. **Como testar** — Passos para validar a funcionalidade

### Testes

O backend utiliza **Jest** como framework de testes. Execute a suite com:

```bash
cd backend
npm run test          # Executa os testes unitários
```

---

## 📄 Licença

Licença a ser definida. Este projeto ainda não possui uma licença formal — uma será adicionada em breve.

---

<p align="center">
  Feito com ☕ e código por uma equipe que acredita que boas discussões técnicas merecem uma plataforma à altura.
</p>
