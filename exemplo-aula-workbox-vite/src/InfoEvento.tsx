import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import type { Evento } from "./evento.model";

const InfoEvento = () => {
  const { idEvento } = useParams();
  const [evento, setEvento] = useState<Evento>();

  useEffect(() => {
    fetch(`http://localhost:3000/eventos/${idEvento}`)
      .then((res) => res.json())
      .then((data) => setEvento(data));
  }, [idEvento]);

  return (
    <div>
      {evento?.id ? (
        <div>
          <h1>{evento.nome}</h1>
          <h2>{format(evento.data, "PPPP", { locale: ptBR })}</h2>
          <p>{evento.descricao}</p>
          <small>{evento.id}</small>
        </div>
      ) : (
        <h1>Não há evento com o ID informado</h1>
      )}
      <NavLink to="/">Voltar a página inicial</NavLink>
    </div>
  );
};

export default InfoEvento;
