# Exemplos de PWA com Workbox

Este repositório contém dois projetos de exemplo que demonstram como adicionar suporte a PWA (Progressive Web App) e cache offline usando **Workbox**, cada um com uma abordagem diferente de integração.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

---

## Projetos

### 1. `exemplo-aula-workbox-cli` — Workbox via CLI

Usa o pacote `workbox-cli` para gerar o Service Worker **após** o build do Vite, com configuração definida em `workbox-config.js`.

#### Instalação

```bash
cd exemplo-aula-workbox-cli
npm install
```

#### Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`.

> O Service Worker **não** é ativado em modo de desenvolvimento. Para testá-lo, execute o build.

#### Build de produção

```bash
npm run build
```

O script executa em sequência:
1. Compilação TypeScript (`tsc -b`)
2. Build do Vite (`vite build`)
3. Geração do Service Worker via Workbox CLI (`workbox generateSW workbox-config.js`)

O Service Worker gerado (`sw.js`) é salvo em `dist/`.

#### Preview do build

```bash
npm run preview
```

Serve o conteúdo de `dist/` em `http://localhost:4173` com o Service Worker ativo.

---

### 2. `exemplo-aula-workbox-vite` — Workbox via plugin do Vite (`vite-plugin-pwa`)

Usa o plugin `vite-plugin-pwa` para integrar o Workbox diretamente no processo de build do Vite. O Service Worker é gerado automaticamente junto com o build, e em modo de desenvolvimento ele também é habilitado.

#### Instalação

```bash
cd exemplo-aula-workbox-vite
npm install
```

#### Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`.

O Service Worker é ativado em desenvolvimento (configurado com `devOptions.enabled: true` no `vite.config.ts`).

#### Build de produção

```bash
npm run build
```

O script executa em sequência:
1. Compilação TypeScript (`tsc -b`)
2. Build do Vite com geração automática do Service Worker pelo plugin

O Service Worker gerado (`sw.js`) é salvo em `dist/`.

#### Preview do build

```bash
npm run preview
```

Serve o conteúdo de `dist/` em `http://localhost:4173` com o Service Worker ativo.

---

## Estratégias de cache configuradas

Ambos os projetos configuram caching para uma API local em `http://localhost:3000`. Para testar o comportamento offline, essa API deve estar rodando antes de acessar a aplicação pela primeira vez.

| Recurso | Estratégia | Projeto CLI | Projeto Vite Plugin |
|---|---|---|---|
| Navegação (páginas) | NetworkFirst / CacheFirst | NetworkFirst | CacheFirst |
| Requisições ao backend (`localhost:3000`) | NetworkFirst / CacheFirst | NetworkFirst | CacheFirst |
| Imagens | CacheFirst | — | CacheFirst |

---

## Diferenças entre as abordagens

| | Workbox CLI | vite-plugin-pwa |
|---|---|---|
| Integração | Pós-build, comando separado | Nativa no build do Vite |
| Dev com SW ativo | Não | Sim |
| Configuração | `workbox-config.js` | `vite.config.ts` |
| Flexibilidade | Alta (controle total do SW) | Moderada (abstrai detalhes) |
