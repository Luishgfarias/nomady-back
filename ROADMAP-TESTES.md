# 🧪 ROADMAP DE TESTES - NOMADY BACK

---

## 📊 STATUS ATUAL

| Tipo | Progresso | Status |
|------|-----------|--------|
| **Unitários Completos** | 11/11 arquivos | 🟢 Completo |
| **E2E** | 1/4 arquivos | 🔴 Baixa |

---

## ✅ O QUE JÁ EXISTE

### 🎯 Testes Unitários Completos
- `src/auth/auth.service.spec.ts` ✅
- `src/auth/auth.controller.spec.ts` ✅
- `src/posts/posts.service.spec.ts` ✅
- `src/posts/posts.controller.spec.ts` ✅
- `src/likes/likes.service.spec.ts` ✅
- `src/users/users.service.spec.ts` ✅
- `src/users/users.controller.spec.ts` ✅
- `src/common/guards/authenticate.guard.spec.ts` ✅
- `src/common/interceptors/error-handling.interceptor.spec.ts` ✅
- `src/follow/follow.controller.spec.ts` ✅
- `src/follow/follow.service.spec.ts` ✅

### 🧪 Testes E2E
- `test/app.e2e-spec.ts` ✅ (health check básico)

### 📋 Testes E2E Recomendados (não implementados)
- `test/auth.e2e-spec.ts` - Auth Flow
- `test/posts.e2e-spec.ts` - Posts Flow
- `test/users.e2e-spec.ts` - Users Flow

---

## 🚀 O QUE IMPLEMENTAR

### 🎯 PRIORIDADE ALTA

#### Testes E2E Essenciais
- [ ] **Auth Flow**: `POST /auth/register` → `POST /auth/login` → `GET /auth/me`
- [ ] **Posts Flow**: `POST /posts` → `GET /posts` → `POST /posts/:id/like`
- [ ] **Users Flow**: `GET /users/search` → `GET /users/:id` → `PUT /users`


### 🎯 PRÓXIMO PASSO

- [ ] Implementar testes E2E essenciais


### 🎯 PRIORIDADE BAIXA

#### Testes E2E de Edge Cases
- [ ] Auth Edge Cases - dados inválidos, tokens expirados
- [ ] Posts Edge Cases - recursos inexistentes, permissões
- [ ] Users Edge Cases - dados inválidos, conflitos

#### Testes de Upload de Imagens (S3 AWS)
- [ ] Users - upload de foto de perfil
- [ ] Posts - upload de imagem do post
- [ ] Edge Cases - arquivo muito grande, tipo inválido, falha no upload

