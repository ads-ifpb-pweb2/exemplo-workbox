import { useEffect, useState } from "react";
import "./App.css";
import type { Evento } from "./evento.model";
import { NavLink } from "react-router";

function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3000/eventos`)
      .then((res) => res.json())
      .then((data) => setEventos(data));
  }, []);

  return (
    <>
      <h1>App de Eventos</h1>
      <ul>
        {eventos.map((evt) => (
          <li key={evt.id}>
            <NavLink to={`evento/${evt.id}`}>{evt.nome}</NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;

