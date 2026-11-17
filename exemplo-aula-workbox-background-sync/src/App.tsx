import { useEffect, useState, type SubmitEventHandler } from "react";
import { getPendingTransacoes, type PendingTransacao } from "./pending";
import type { TipoTransacao, Transacao } from "./transacao.model";

const API_URL = "http://localhost:8080/api/transacoes";

const inputClasses =
  "px-3.5 py-2.5 border border-[var(--border)] rounded-lg text-base bg-[var(--bg)] text-[var(--text-h)] transition-[border-color] duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-bg)]";

const itemBaseClasses =
  "grid grid-cols-[1fr_auto_auto_auto] max-sm:grid-cols-[1fr_auto] items-center gap-3 py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] border-l-4";

function App() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pendentes, setPendentes] = useState<PendingTransacao[]>([]);

  // Formulário
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("RECEITA");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<string | null>(null);

  // Status da conexão
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchTransacoes = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((lista: Transacao[]) => setTransacoes(lista))
      .catch(() => {});
  };

  const refreshPendentes = () => {
    getPendingTransacoes().then(setPendentes);
  };

  // Detecta online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus("Você voltou a ficar online. Transações pendentes serão sincronizadas.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus("Você está offline. Transações serão salvas e sincronizadas quando voltar.");
    };
    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Escuta mensagens do Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TRANSACOES_SINCRONIZADAS") {
        setStatus("Transações pendentes foram sincronizadas com o servidor!");
        fetchTransacoes();
        refreshPendentes();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleMessage);
  }, []);

  // Carrega dados ao montar
  useEffect(() => {
    fetchTransacoes();
    refreshPendentes();
  }, []);

  const handleSubmit = async (e: SubmitEventHandler<HTMLFormElement>) => {
    e.preventDefault();
    const novaTransacao: Transacao = {
      descricao,
      valor: Number.parseFloat(valor),
      tipo,
      data,
    };
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaTransacao),
      });
      if (response.ok) {
        const salva = (await response.json()) as Transacao;
        setTransacoes((prev) => [...prev, salva]);
        setStatus("Transação salva com sucesso!");
        setDescricao("");
        setValor("");
      }
    } catch {
      // SW enfileira na IndexedDB via BackgroundSync
      setStatus("Offline: transação enfileirada para sincronização automática.");
      setDescricao("");
      setValor("");
      // Aguarda o SW gravar na IndexedDB antes de ler
      setTimeout(refreshPendentes, 300);
    }
  };

  const totalItens = transacoes.length + pendentes.length;

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto text-left">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="m-0 text-[28px] tracking-[-0.5px]">Receitas e Despesas</h1>
        <span
          className={`text-[13px] font-semibold px-3 py-1 rounded-full tracking-[0.5px] uppercase ${
            isOnline
              ? "bg-green-500/15 text-green-600 border border-green-500/40"
              : "bg-red-500/15 text-red-600 border border-red-500/40"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </header>

      {status && (
        <div
          className="px-4 py-3 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg text-sm mb-6 text-[var(--text-h)]"
          role="alert"
        >
          {status}
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-lg mb-5 pb-2 border-b border-[var(--border)] flex items-center gap-2.5">Nova Transação</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="descricao" className="text-sm font-semibold text-[var(--text-h)]">
              Descrição
            </label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              placeholder="Ex: Salário, Aluguel..."
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="valor" className="text-sm font-semibold text-[var(--text-h)]">
              Valor (R$)
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              placeholder="0,00"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo" className="text-sm font-semibold text-[var(--text-h)]">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoTransacao)}
              className={inputClasses}
            >
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="data" className="text-sm font-semibold text-[var(--text-h)]">
              Data
            </label>
            <input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--accent)] text-white border-0 rounded-lg text-base font-semibold cursor-pointer transition-opacity duration-200 self-start hover:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[3px]"
          >
            Adicionar Transação
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="text-lg mb-5 pb-2 border-b border-[var(--border)] flex items-center gap-2.5">
          Transações
          {pendentes.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-amber-700 border border-yellow-500/40">
              {pendentes.length} pendente{pendentes.length > 1 ? "s" : ""}
            </span>
          )}
        </h2>
        {totalItens === 0 ? (
          <p className="text-[var(--text)] italic text-[15px]">Nenhuma transação registrada ainda.</p>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
            {pendentes.map((t) => (
              <li
                key={`pending-${t._pendingId}`}
                className={`${itemBaseClasses} border-l-amber-600 opacity-75 [background:repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(234,179,8,0.04)_6px,rgba(234,179,8,0.04)_12px)]`}
              >
                <span className="font-medium text-[var(--text-h)]">{t.descricao}</span>
                <span className="text-[13px] text-[var(--text)] max-sm:hidden">{t.data}</span>
                <span className={`font-bold text-[15px] ${t.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}`}>
                  {t.tipo === "RECEITA" ? "+" : "-"}{" "}
                  {t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded tracking-[0.5px] uppercase bg-yellow-500/15 text-amber-700">
                  Pendente
                </span>
              </li>
            ))}
            {transacoes.map((t) => (
              <li
                key={t.id}
                className={`${itemBaseClasses} ${t.tipo === "RECEITA" ? "border-l-green-600" : "border-l-red-600"}`}
              >
                <span className="font-medium text-[var(--text-h)]">{t.descricao}</span>
                <span className="text-[13px] text-[var(--text)] max-sm:hidden">{t.data}</span>
                <span className={`font-bold text-[15px] ${t.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}`}>
                  {t.tipo === "RECEITA" ? "+" : "-"}{" "}
                  {t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded tracking-[0.5px] uppercase max-sm:hidden ${
                    t.tipo === "RECEITA" ? "bg-green-600/12 text-green-600" : "bg-red-600/12 text-red-600"
                  }`}
                >
                  {t.tipo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
