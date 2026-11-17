export type TipoTransacao = "RECEITA" | "DESPESA";

export interface Transacao {
  id?: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  data: string;
}
