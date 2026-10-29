import React from 'react';

function limparTextoRaw(str) {
  if (!str) return '';
  return str
    .replace(/\*\*/g, '')
    .replace(/^[🏛️🗓️🍲☀️🧭📍•\-\s]+/u, '')
    .trim();
}

function extrairSecoesGuia(textoBruto, roteiro) {
  const texto = (textoBruto || '').trim();
  const resultado = {
    essencia: '',
    turnos: {
      manha: '',
      tarde: '',
      noite: '',
    },
    gastronomia: '',
    climaDica: '',
    outrosParagrafos: [],
  };

  if (!texto) return resultado;

  const linhas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  for (const linha of linhas) {
    const limpa = linha.replace(/\*\*/g, '');

    if (/identidade|atmosfera|ess[êe]ncia/i.test(limpa)) {
      const partes = limpa.split(':');
      resultado.essencia = limparTextoRaw(partes.slice(1).join(':') || limpa);
    } else if (/manh[ãa]\s*:/i.test(limpa)) {
      const partes = limpa.split(/manh[ãa]\s*:/i);
      resultado.turnos.manha = limparTextoRaw(partes[1] || limpa);
    } else if (/tarde\s*:/i.test(limpa)) {
      const partes = limpa.split(/tarde\s*:/i);
      resultado.turnos.tarde = limparTextoRaw(partes[1] || limpa);
    } else if (/noite\s*:/i.test(limpa)) {
      const partes = limpa.split(/noite\s*:/i);
      resultado.turnos.noite = limparTextoRaw(partes[1] || limpa);
    } else if (/gastron[ôo]mic|gastronomia|sabores|culin[áa]ria/i.test(limpa)) {
      const partes = limpa.split(':');
      resultado.gastronomia = limparTextoRaw(partes.slice(1).join(':') || limpa);
    } else if (/orienta[çc][õo]es|clima|vestu[áa]rio/i.test(limpa)) {
      const partes = limpa.split(':');
      resultado.climaDica = limparTextoRaw(partes.slice(1).join(':') || limpa);
    } else if (!/roteiro sugerido/i.test(limpa)) {
      resultado.outrosParagrafos.push(limparTextoRaw(limpa));
    }
  }

  if (!resultado.essencia && roteiro?.destino) {
    resultado.essencia =
      resultado.outrosParagrafos.shift() ||
      `${roteiro.destino} reúne patrimônio histórico, paisagens naturais e gastronomia regional.`;
  }

  return resultado;
}

export default function RoteiroResult({
  roteiro,
  textoGuiaStream,
  streamingGuia,
  onAlternarVisita,
}) {
  if (!roteiro) return null;

  const { atrativos_sugeridos, gastronomia_sugerida, atrativos_visitados, guia, clima } = roteiro;
  const visitadosSet = new Set(atrativos_visitados || []);
  const textoExibicao = textoGuiaStream || guia;
  const secoes = extrairSecoesGuia(textoExibicao, roteiro);

  return (
    <div className="canvas-split-bottom">
      {/* Coluna Esquerda: Cronograma Editorial em Tabela de Horários (Zero 3-Column Feature Grid) */}
      <div className="itinerary-pane">
        <div className="section-heading">
          <span>Caderno de Campo — {roteiro.destino}</span>
          {streamingGuia && <span className="status-tag">Recebendo transmissão SSE…</span>}
        </div>

        <p style={{ fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '0.85rem', maxWidth: '65ch' }}>
          {secoes.essencia}
        </p>

        <table className="timetable">
          <tbody>
            <tr>
              <td className="timetable-hour">07:00 — 12:00</td>
              <td>
                <span className="timetable-shift">Manhã</span>
                <p className="timetable-desc">
                  {secoes.turnos.manha || 'Saída nas primeiras horas para aproveitar temperaturas amenas nos pontos principais.'}
                </p>
              </td>
            </tr>
            <tr>
              <td className="timetable-hour">13:00 — 18:00</td>
              <td>
                <span className="timetable-shift">Tarde</span>
                <p className="timetable-desc">
                  {secoes.turnos.tarde || 'Percurso pelos mirantes e centro histórico com parada no fim de tarde.'}
                </p>
              </td>
            </tr>
            <tr>
              <td className="timetable-hour">19:00 — 23:00</td>
              <td>
                <span className="timetable-shift">Noite</span>
                <p className="timetable-desc">
                  {secoes.turnos.noite || 'Jantar regional e caminhada pelos polos culturais da cidade.'}
                </p>
              </td>
            </tr>
            <tr>
              <td className="timetable-hour">Gastronomia</td>
              <td>
                <p className="timetable-desc" style={{ color: 'var(--text-primary)' }}>
                  {secoes.gastronomia || `Experimente ${gastronomia_sugerida?.join(', ') || 'os pratos típicos locais'}.`}
                </p>
              </td>
            </tr>
            <tr>
              <td className="timetable-hour">Recomendações</td>
              <td>
                <p className="timetable-desc">
                  {secoes.climaDica || `Com ${clima?.temperatura || 28}°C (${clima?.condicao || 'estável'}), priorize roupas leves e hidratação.`}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Coluna Direita: Registro de Visitas e Pratos Locais */}
      <div className="checklist-pane">
        <div className="section-heading">
          <span>Locais de Visitação</span>
          <span className="font-mono">
            {visitadosSet.size}/{atrativos_sugeridos?.length || 0} concluídos
          </span>
        </div>

        <div>
          {atrativos_sugeridos?.map((atrativo) => {
            const visitado = visitadosSet.has(atrativo);
            return (
              <div key={atrativo} className="checklist-row">
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: visitado ? 600 : 400,
                    textDecoration: visitado ? 'line-through' : 'none',
                    color: visitado ? 'var(--text-secondary)' : 'var(--text-primary)',
                  }}
                >
                  {atrativo}
                </span>
                <button
                  type="button"
                  className="btn-utility font-mono"
                  style={{
                    minHeight: 28,
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    background: visitado ? 'var(--accent-primary)' : 'var(--bg-canvas)',
                    color: visitado ? 'var(--accent-primary-fg)' : 'var(--text-primary)',
                    borderColor: visitado ? 'var(--accent-primary)' : 'var(--line-strong)',
                  }}
                  onClick={() => onAlternarVisita(atrativo, !visitado)}
                >
                  {visitado ? 'Visitado' : 'Marcar'}
                </button>
              </div>
            );
          })}
        </div>

        {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
          <div style={{ marginTop: '1.35rem' }}>
            <div className="section-heading" style={{ marginBottom: '0.5rem' }}>
              <span>Especialidades Locais</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {gastronomia_sugerida.map((prato) => (
                <span key={prato} className="status-tag" style={{ color: 'var(--text-primary)' }}>
                  {prato}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
