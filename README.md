# Exemplos de PWA com Workbox

Este repositório contém projetos de exemplo que demonstram como adicionar suporte a PWA (Progressive Web App) e cache offline usando **Workbox**, cada um com uma abordagem diferente de integração.

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

### 3. `exemplo-aula-workbox-background-sync` + `exemplo-aula-workbox-background-sync-backend` — Background Sync com Workbox

Exemplo full-stack que demonstra o **Workbox Background Sync**: um formulário de cadastro de receitas e despesas que funciona offline. Requisições feitas sem conexão são enfileiradas na **IndexedDB** e reenviadas automaticamente pelo Service Worker quando a conexão é restabelecida.

#### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| PWA / Service Worker | `vite-plugin-pwa` + Workbox (`Queue`, `NetworkOnly`) |
| Backend | Spring Boot 4 + Spring Data JPA + H2 (embarcado) |

#### Arquitetura do Service Worker

O SW usa `Queue` do `workbox-background-sync` com um `onSync` customizado:

- **Online:** `POST /api/transacoes` passa direto para o backend (`NetworkOnly`)
- **Offline:** o plugin `fetchDidFail` enfileira a requisição na IndexedDB (`workbox-background-sync` / store `requests`)
- **Volta online:** o browser dispara o evento `sync` → SW reenvia cada requisição → notifica a página via `postMessage({ type: 'TRANSACOES_SINCRONIZADAS' })`

A página lê as entradas pendentes diretamente da IndexedDB (`src/pending.ts`) e as exibe na lista com um badge "Pendente".

#### Rodando o backend

```bash
cd exemplo-aula-workbox-background-sync-backend
./mvnw spring-boot:run
```

API disponível em `http://localhost:8080`.  
Console H2 disponível em `http://localhost:8080/h2-console`.

#### Rodando o frontend

```bash
cd exemplo-aula-workbox-background-sync
npm install
npm run dev      # desenvolvimento (SW ativo via devOptions)
```

Aplicação disponível em `http://localhost:5173`.

#### Build e preview

```bash
npm run build
npm run preview  # http://localhost:4173
```

#### Testando o Background Sync

1. Acesse `http://localhost:5173` com o backend rodando
2. Abra DevTools → **Application → Service Workers** e confirme que o SW está ativo
3. Adicione uma transação — o `POST` deve aparecer no Network com status `201`
4. Em DevTools → **Network**, marque **Offline**
5. Adicione outra transação — a UI mostra o badge "Pendente" e o item aparece listrado
6. Inspecione **Application → IndexedDB → workbox-background-sync → requests** para ver a entrada enfileirada
7. Desmarque **Offline** — o SW recebe o evento `sync`, reenvia o `POST` e notifica a página
8. A transação sai de "Pendente" e entra na lista confirmada

---

## Estratégias de cache

| Recurso | Estratégia | CLI | Vite Plugin | Background Sync |
|---|---|---|---|---|
| Navegação (páginas) | NetworkFirst / CacheFirst | NetworkFirst | CacheFirst | Precache |
| Requisições GET ao backend | NetworkFirst / CacheFirst | NetworkFirst | CacheFirst | — |
| Requisições POST ao backend | — | — | — | NetworkOnly + Queue |
| Imagens | CacheFirst | — | CacheFirst | — |

---

## Diferenças entre as abordagens

| | Workbox CLI | vite-plugin-pwa | Background Sync |
|---|---|---|---|
| Integração | Pós-build, comando separado | Nativa no build do Vite | Nativa no build do Vite |
| Dev com SW ativo | Não | Sim | Sim |
| Configuração | `workbox-config.js` | `vite.config.ts` | `vite.config.ts` + `sw.ts` customizado |
| Offline para leituras | Sim (cache) | Sim (cache) | Sim (precache) |
| Offline para escritas | Não | Não | Sim (Background Sync) |
| Complexidade | Baixa | Baixa | Média |
