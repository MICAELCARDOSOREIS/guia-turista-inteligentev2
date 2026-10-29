import { useState, useEffect } from 'react';

export function useSessionTimer(usuario) {
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState(7200);

  useEffect(() => {
    if (!usuario?.is_visitante) {
      setTempoRestanteSegundos(7200);
      return;
    }

    const interval = setInterval(() => {
      setTempoRestanteSegundos((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [usuario]);

  const horas = Math.floor(tempoRestanteSegundos / 3600);
  const minutos = Math.floor((tempoRestanteSegundos % 3600) / 60);
  const segundos = tempoRestanteSegundos % 60;
  const formatado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  return { tempoRestanteSegundos, formatado };
}
