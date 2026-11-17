# Background Sync — Frontend (React + Vite + Workbox)

Formulário de receitas e despesas que funciona offline. Quando não há conexão, o `POST`
é enfileirado na IndexedDB pelo Workbox Background Sync e reenviado automaticamente pelo
Service Worker quando a conexão volta.

Depende do backend [`exemplo-aula-workbox-background-sync-backend`](../exemplo-aula-workbox-background-sync-backend),
que deve estar rodando em `http://localhost:8080`.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (exigido pelo Vite 8)
- npm
- Backend rodando (veja o README do backend)

## Como rodar

### 1. Suba o backend

```bash
cd exemplo-aula-workbox-background-sync-backend
./mvnw spring-boot:run
```

### 2. Instale as dependências e rode o frontend

Em outro terminal:

```bash
cd exemplo-aula-workbox-background-sync
npm install
npm run dev
```

Acesse `http://localhost:5173`. O Service Worker é registrado também em desenvolvimento
(`devOptions.enabled: true` no `vite.config.ts`).

### Build de produção e preview

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173`. Use o preview para testar o Service Worker como em produção.

> O backend só aceita requisições (CORS) das portas `5173` e `4173`. Se o Vite subir em outra
> porta (por exemplo, porque a 5173 já está em uso), libere a porta no `WebConfig.java` do backend
> ou encerre o processo que a está ocupando.

## Testando o Background Sync

Use Chrome ou Edge (o Firefox e o Safari não suportam a Background Sync API; nesses navegadores
o Workbox tenta reenviar a fila quando o Service Worker é reiniciado).

1. Com o backend rodando, acesse a aplicação
2. DevTools → **Application → Service Workers**: confirme que o SW está ativo
3. Cadastre uma transação: o `POST` aparece na aba **Network** com status `201`
4. Na aba **Network**, selecione **Offline**
5. Cadastre outra transação: ela aparece na lista com o badge "Pendente"
6. Em **Application → IndexedDB → workbox-background-sync → requests**, veja a requisição enfileirada
7. Volte para **No throttling** (online): o SW recebe o evento `sync`, reenvia o `POST` e avisa a página
8. A transação deixa de ser "Pendente" e passa a vir do backend

Dica: em **Application → Service Workers** é possível disparar o sync manualmente no campo
**Sync** com a tag `workbox-background-sync:transacoes-queue`.

## Arquivos principais

| Arquivo | Papel |
|---|---|
| `src/sw.ts` | Service Worker: precache + rota `POST /api/transacoes` com `NetworkOnly` e `Queue` |
| `src/pending.ts` | Lê da IndexedDB as requisições ainda não sincronizadas |
| `src/App.tsx` | Formulário e lista de transações |
| `vite.config.ts` | Configuração do `vite-plugin-pwa` (`injectManifest`) |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em `http://localhost:5173` |
| `npm run build` | Checagem de tipos (`tsc -b`) e build em `dist/` |
| `npm run preview` | Serve o `dist/` em `http://localhost:4173` |
| `npm run lint` | ESLint |
