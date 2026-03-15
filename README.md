# GatewayAPI

API RESTful em **AdonisJS 5** para gerenciamento de pagamentos multi-gateway com fallback por prioridade, cálculo de valor da compra no backend com base em produtos/quantidades, autenticação da aplicação e rotas privadas protegidas.

## Requisitos

- Node.js 18+ (recomendado Node.js 20)
- npm 9+
- MySQL 8+
- Docker e Docker Compose (opcional, recomendado)

## Tecnologias

- AdonisJS 5
- Lucid ORM
- MySQL
- adonis-autoswagger

## Funcionalidades

- Compra pública informando produto(s) e quantidade
  - valor calculado no backend
- Integração com dois gateways externos com autenticação
- Fallback de cobrança por prioridade de gateway
  - se o Gateway 1 falhar, tenta automaticamente o Gateway 2
  - só retorna erro quando todos os gateways ativos falham
- Persistência de clientes, produtos, transações e itens da transação
- Login da aplicação com JWT Bearer
- Rotas privadas com middleware de autenticação e autorização por role
- Reembolso de compra via gateway original
- Docker Compose com aplicação, MySQL e mock dos gateways

## Estrutura de dados

Tabelas principais:

- `users`
- `gateways`
- `clients`
- `products`
- `transactions`
- `transaction_products`

## Variáveis de ambiente

Use o arquivo `.env` para execução local ou `.env.docker` para Docker.

Fallback automático:

- Se `.env` não existir, a API sobe com valores base em código (host, porta, app key, sessão, drive, conexão mysql e credenciais padrão de gateways).
- Se `.env.docker` não existir, o `docker-compose` continua funcionando, pois os valores já estão definidos no próprio `docker-compose.yml`.

Campos relevantes:

- `DB_CONNECTION`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`
- `GATEWAY_1_BASE_URL`, `GATEWAY_2_BASE_URL`
- `GATEWAY_1_LOGIN_EMAIL`, `GATEWAY_1_LOGIN_TOKEN`
- `GATEWAY_2_AUTH_TOKEN`, `GATEWAY_2_AUTH_SECRET`

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Configure o `.env` com MySQL.

3. Rode migrações:

```bash
node ace migration:run
```

4. Aplique migrações e seeders (padrão):

```bash
npm run setup
```

Se quiser popular somente os dados iniciais completos:

```bash
node ace db:seed --files database/seeders/TestDataSeeder.ts
```

5. Inicie a API:

```bash
npm run dev
```

API em `http://localhost:3333`  
Swagger em `http://localhost:3333/docs`

## Como rodar com Docker Compose

1. Suba os serviços:

```bash
docker-compose up --build
```

ou

```bash
docker compose up --build
```

2. Endpoints:

- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`
- Gateway Mock 1: `http://localhost:3001`
- Gateway Mock 2: `http://localhost:3002`

3. Para parar:

```bash
docker-compose down
```

Observação:

- No Docker, os seeders rodam por padrão no startup (`node ace db:seed`), então os dados base são sempre aplicados automaticamente.

## Troubleshooting rápido

Se ao criar compra aparecer erro como `Falha de autenticação no Gateway 1`, normalmente é URL do gateway incorreta no banco para o ambiente atual.

- Local: use `GATEWAY_1_BASE_URL=http://localhost:3001` e `GATEWAY_2_BASE_URL=http://localhost:3002`
- Docker: use `GATEWAY_1_BASE_URL=http://gateways-mock:3001` e `GATEWAY_2_BASE_URL=http://gateways-mock:3002`

Depois rode novamente os seeders para atualizar os gateways:

```bash
node ace db:seed --files database/seeders/GatewaySeeder.ts
```

## Usuário padrão (seeder)

- Email: `admin@gatewayapi.local`
- Senha: `12345678`
- Role: `ADMIN`

Exemplo de login:

```json
{
  "email": "admin@gatewayapi.local",
  "password": "12345678"
}
```

Seeder de dados iniciais:

- `database/seeders/TestDataSeeder.ts`
- Popula automaticamente: `users`, `gateways`, `products`, `clients`, `transactions`, `transaction_products`

## Autenticação

Faça login e use o token retornado:

```http
Authorization: Bearer <token>
```

Observação:

- O token de autenticação é JWT (HS256), assinado com `JWT_SECRET` e validade em segundos definida por `JWT_EXPIRES_IN_SECONDS`.

### Como usar o token no Swagger

1. Execute `POST /auth/login` com:

```json
{
  "email": "admin@gatewayapi.local",
  "password": "12345678"
}
```

2. Copie o valor de `object.token` retornado na resposta.
3. Acesse `http://localhost:3333/docs`.
4. Clique no botão **Authorize** (cadeado, no topo direito).
5. Cole o token no campo de autenticação.
6. Confirme em **Authorize** e depois **Close**.

Pronto: as rotas privadas já poderão ser testadas pelo Swagger com o token JWT.

Observações:

- O Swagger já está configurado para manter a autorização salva entre atualizações da página (`persistAuthorization`).
- O estado de abrir/fechar endpoints também é salvo no navegador (localStorage), então o histórico visual dos métodos é preservado.

## Rotas

| Método | Endpoint | Função | Acesso |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Realiza login e retorna JWT | Público |
| `POST` | `/payments/purchase` | Processa compra com o usuário autenticado e fallback entre gateways | Qualquer usuário autenticado |
| `GET` | `/gateways` | Lista gateways cadastrados | `ADMIN` |
| `PATCH` | `/gateways/:id/active` | Ativa/desativa gateway | `ADMIN` |
| `PATCH` | `/gateways/:id/priority` | Altera prioridade do gateway | `ADMIN` |
| `GET` | `/users` | Lista usuários | `ADMIN`, `MANAGER` |
| `GET` | `/users/:id` | Detalha usuário por ID | `ADMIN`, `MANAGER` |
| `POST` | `/users` | Cria usuário sem role explícita | `ADMIN`, `MANAGER` |
| `POST` | `/admin/users` | Cria usuário com role explícita | `ADMIN` |
| `GET` | `/admin/roles` | Lista roles disponíveis no sistema | `ADMIN` |
| `PUT` | `/users/:id` | Atualiza a própria conta | Somente o próprio usuário autenticado |
| `DELETE` | `/users/:id` | Remove conta (própria conta ou qualquer conta se ADMIN) | Próprio usuário ou `ADMIN` |
| `GET` | `/products` | Lista produtos | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET` | `/products/:id` | Detalha produto por ID | `ADMIN`, `MANAGER`, `FINANCE` |
| `POST` | `/products` | Cria produto | `ADMIN`, `MANAGER`, `FINANCE` |
| `PUT` | `/products/:id` | Atualiza produto | `ADMIN`, `MANAGER`, `FINANCE` |
| `DELETE` | `/products/:id` | Remove produto | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET` | `/clients` | Lista clientes | Qualquer usuário autenticado |
| `GET` | `/clients/:id` | Detalha cliente com compras | Qualquer usuário autenticado |
| `GET` | `/transactions` | Lista compras | Qualquer usuário autenticado |
| `GET` | `/transactions/:id` | Detalha compra por ID | Qualquer usuário autenticado |
| `POST` | `/transactions/:id/refund` | Realiza reembolso de compra | `ADMIN`, `FINANCE` |

Lógica de perfis aplicada:

- `ADMIN`: acesso total.
- `MANAGER`: gerencia usuários e produtos.
- `FINANCE`: gerencia produtos e realiza reembolso.
- `USER`: acessa o restante que não foi citado (ex.: listagens/detalhes de clientes e compras).

## Regras principais da compra

- Recebe produtos e quantidades no payload
- Usa o usuário autenticado para identificar o comprador (nome/e-mail)
- Calcula o total internamente
- Busca gateways ativos por prioridade
- Tenta cobrança no primeiro gateway
- Em caso de erro, tenta o próximo
- Se algum gateway aprovar, retorna sucesso sem expor erro dos anteriores

Comportamento esperado do fallback:

- Se o Gateway 1 falhar, a API tenta automaticamente o Gateway 2.
- A API só retorna erro quando todos os gateways ativos falharem.
- Quando todos falham, a mensagem retornada é genérica: `Não foi possível processar o pagamento em nenhum gateway`.
- No reembolso, a API também tenta em sequência pelos gateways disponíveis até obter sucesso; se todos falharem, retorna erro.

## Observações

- Os valores monetários são armazenados em centavos (`amount` inteiro).
- O endpoint de compra já está preparado para múltiplos itens.
