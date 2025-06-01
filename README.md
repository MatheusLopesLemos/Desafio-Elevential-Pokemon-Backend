# Pokémon API Backend

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-4.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-4DB33D?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Zod](https://img.shields.io/badge/Zod-3.x-ff69b4?style=flat)](https://zod.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat)](https://axios-http.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-purple?style=flat&logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-ff69b4?style=flat&logo=prettier)](https://prettier.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

API RESTful para gerenciamento de dados de Pokémon e Tipos, incluindo integração com mídia (imagens, gifs), validação robusta de dados e estrutura escalável para projetos.

---

## O que é e como funciona

Esta API permite:

- **Gerenciar Pokémons**: cadastro, listagem, atualização, exclusão e busca por tipo ou código.
- **Gerenciar Tipos**: cadastro, listagem, atualização e exclusão de tipos de Pokémon.
- **Validação de Dados**: utilizando o Zod para garantir integridade dos dados enviados para a API.
- **Mídia Dinâmica**: integração para buscar imagens, miniaturas e gifs dos Pokémon.
- **Banco de Dados Relacional**: Prisma ORM com MongoDB.

---

## Funcionalidades

- 📋 CRUD completo para Pokémons
- 🌈 CRUD completo para Tipos
- 🔎 Busca de Pokémon por código (`codigo`)
- 🎯 Filtro de Pokémon por tipo (principal ou secundário)
- 🖼️ Adição de imagens e gifs aos dados dos Pokémons
- 🛡️ Validação de entrada robusta com Zod
- 🚀 Código organizado e modular, seguindo boas práticas

---

## Tecnologias Utilizadas

- **Node.js**: Plataforma de execução
- **Express**: Framework web
- **Prisma ORM**: Abstração de banco de dados
- **MongoDB**: Banco de dados não-relacional
- **Zod**: Validação de esquemas
- **Axios**: Requisições HTTP para mídia externa
- **ESLint**: Padronização de código
- **Prettier**: Formatação de código
- **Dotenv**: Variáveis de ambiente

---

## Endpoints da API

### Pokémons

| Método | Endpoint                   | Descrição                                     |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/pokemons`                | Lista todos os Pokémons                       |
| GET    | `/pokemons/:codigo`        | Busca Pokémon por código                      |
| GET    | `/pokemons/filtrar?tipo=X` | Filtra Pokémons por tipo principal/secundário |
| POST   | `/pokemons`                | Cria um novo Pokémon                          |
| PUT    | `/pokemons/:codigo`        | Atualiza um Pokémon                           |
| DELETE | `/pokemons/:codigo`        | Deleta um Pokémon                             |

### Tipos

| Método | Endpoint         | Descrição                       |
| ------ | ---------------- | ------------------------------- |
| GET    | `/tipos`         | Lista todos os tipos de Pokémon |
| GET    | `/tipos/:codigo` | Busca tipo por código           |
| POST   | `/tipos`         | Cria um novo tipo               |
| PUT    | `/tipos/:codigo` | Atualiza um tipo                |
| DELETE | `/tipos/:codigo` | Deleta um tipo                  |

---

## Estrutura do Projeto

```
src/
├── config/
├── controllers/
│   ├── pokemonControllers.js
│   └── tipoControllers.js
├── routes/
│   ├── pokemonRoutes.js
│   ├── tipoRoutes.js
│   └── router.js
├── schemas/
│   ├── pokemonSchema.js
│   └── tipoSchema.js
├── services/
│   ├── pokeApiService.js
│   └── index.js
prisma/
├── schema.prisma
├── generated/
.env
.eslintrc.cjs
.prettierrc.cjs
.prettierignore
.gitignore
LICENSE
package.json
package-lock.json
README.md
```

---

## Instalação e Uso

Clone o repositório:

```bash
git clone https://github.com/SeuUsuario/SeuRepositorio-Pokemon-API.git
cd SeuRepositorio-Pokemon-API
```

Instale as dependências:

```bash
npm install
```

Configure o banco e variáveis de ambiente:

```env
DATABASE_URL="mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/meubanco"
```

Execute as migrações do Prisma:

```bash
npx prisma generate
```

Inicie o servidor:

```bash
npm run dev
```

A API estará disponível em: `http://localhost:3000`

---

## 🔍 Melhorias Futuras

- Docker para facilitar deployment

---

## Licença

Este projeto está licenciado sob a Licença MIT.  
Consulte o arquivo [LICENSE](./LICENSE) para mais informações.
