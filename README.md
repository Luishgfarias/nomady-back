# Nomady — Diário de Viagem Social

Backend do Nomady, um blog estilo diário de viagem com pegada social e dinâmica rápida, construído com NestJS, PostgreSQL (Prisma) e MongoDB para chat em tempo real.

---

## 🚀 Tecnologias

- Node.js + NestJS  
- PostgreSQL + Prisma  
- MongoDB + Mongoose (chat)  
- JWT com refresh tokens  
- Socket.IO para chat em tempo real  
- TypeScript  
- Swagger (Documentação)  

---

## 📚 Funcionalidades

- Autenticação JWT + refresh token  
- CRUD completo de usuários e posts (texto, foto, localização)  
- Seguidores (follow/unfollow)  
- Likes únicos por usuário/post  
- Comentários (futuro)  
- Chat em tempo real (futuro) via Socket.IO + MongoDB  

---

## 📋 Rotas principais

### Autenticação (`/auth`)

- `POST /auth/register` — registrar usuário  
- `POST /auth/login` — login (access + refresh token)  
- `POST /auth/refresh` — renovar token  
- `POST /auth/logout` — logout  
- `GET /auth/me` — dados do usuário  

### Usuários (`/users`)

- `GET /users` — listar  
- `GET /users/:id` — detalhes  
- `PUT /users/:id` — atualizar  
- `DELETE /users/:id` — deletar  

### Posts (`/posts`)

- `POST /posts` — criar  
- `GET /posts` — listar  
- `GET /posts/:id` — detalhes  
- `PUT /posts/:id` — atualizar  
- `DELETE /posts/:id` — deletar  

### Seguidores (`/follows`)

- `POST /follows/:userId` — seguir  
- `DELETE /follows/:userId` — deixar de seguir  
- `GET /follows/followers/:id` — seguidores  
- `GET /follows/following/:id` — seguindo  

### Likes (`/posts/:postId/like`)

- `POST /posts/:postId/like` — curtir  
- `DELETE /posts/:postId/unlike` — descurtir  
- `GET /posts/:postId/likes` — listar curtidas  

### Comentários (futuro)

- `POST /posts/:postId/comments` — criar  
- `GET /posts/:postId/comments` — listar  
- `PUT /comments/:commentId` — editar  
- `DELETE /comments/:commentId` — deletar  

### Chat (futuro)

- Socket.IO + MongoDB com coleções `conversations` e `messages`  

---

## ⚙️ Configuração

1. Clone o repo  
2. Configure `.env` com PostgreSQL, MongoDB, JWT secrets  
3. `npm install`  
4. `npx prisma migrate deploy`  
5. `npm run start:dev`  

---

## 🗂 Estrutura

src/
├── auth/
├── users/
├── posts/
├── follows/
├── comments/ * Futuramente
├── chat/ * Futuramente
├── common/
└── main.ts

## 📖 Documentação da API (Swagger)

A API do **Nomady** estará documentada via **Swagger**, facilitando testes e entendimento das rotas.

### Acessando a documentação

Após rodar o projeto localmente, acesse:

http://localhost:3000/api-docs


> Nomady — Sua jornada, seu diário, seu mundo.