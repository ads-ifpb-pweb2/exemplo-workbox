# Background Sync — Backend (Spring Boot)

API REST de transações (receitas e despesas) usada pelo frontend
[`exemplo-aula-workbox-background-sync`](../exemplo-aula-workbox-background-sync).

## Pré-requisitos

- Java 17 ou superior (`java -version`)
- Não é necessário instalar o Maven: o projeto inclui o Maven Wrapper (`mvnw`)

## Como rodar

```bash
cd exemplo-aula-workbox-background-sync-backend
./mvnw spring-boot:run
```

No Windows:

```bat
mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`.

> Na primeira execução o wrapper baixa o Maven e as dependências, o que pode levar alguns minutos.

### Gerando e executando o JAR

```bash
./mvnw clean package
java -jar target/background-sync-backend-0.0.1-SNAPSHOT.jar
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/transacoes` | Lista todas as transações |
| `POST` | `/api/transacoes` | Cria uma transação (retorna `201 Created`) |

Exemplo de criação:

```bash
curl -X POST http://localhost:8080/api/transacoes \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Salário","valor":3500.00,"tipo":"RECEITA","data":"2026-11-16"}'
```

Campos validados: `descricao` (obrigatória), `valor` (> 0), `tipo` e `data` (obrigatórios).
Requisições inválidas retornam `400 Bad Request` com a lista de erros.

## Banco de dados (H2 em memória)

O banco é recriado a cada inicialização (`ddl-auto=create-drop`), então os dados se perdem ao reiniciar.

Console H2: `http://localhost:8080/h2-console`

| Campo | Valor |
|---|---|
| JDBC URL | `jdbc:h2:mem:transacoesdb` |
| Usuário | `sa` |
| Senha | *(vazia)* |

## CORS

Somente as origens do frontend estão liberadas (ver `WebConfig.java`):

- `http://localhost:5173` — `npm run dev`
- `http://localhost:4173` — `npm run preview`

Se o frontend rodar em outra porta, adicione-a em `WebConfig.java`.
