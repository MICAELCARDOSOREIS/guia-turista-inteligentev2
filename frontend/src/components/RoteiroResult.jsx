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
    resultado.essencia = resultado.outrosParagrafos.shift() || `${roteiro.destino} reúne patrimônio histórico, paisagens naturais e hospitalidade regional.`;
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
    <>
      {/* 4. BLOCO ESQUERDO INFERIOR (7 colunas): Roteiro Estruturado por Turnos (Sem cara de texto cru de IA) */}
      <div className="card bento-span-7" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.22rem', fontWeight: 700 }}>
              Roteiro de Campo — {roteiro.destino}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {secoes.essencia}
            </p>
          </div>
          {streamingGuia && (
            <span className="badge badge-warning">
              Atualizando roteiro...
            </span>
          )}
        </div>

        {/* Grade de 3 Colunas: Manhã / Tarde / Noite */}
        <div className="shift-cards-grid">
          <div className="shift-card">
            <div className="shift-card-header">
              <span className="font-mono shift-time">07h — 12h</span>
              <strong className="shift-title">Manhã</strong>
            </div>
            <p className="shift-body">
              {secoes.turnos.manha || 'Saída nas primeiras horas para aproveitar a luz matinal e temperaturas amenas nos pontos principais.'}
            </p>
          </div>

          <div className="shift-card">
            <div className="shift-card-header">
              <span className="font-mono shift-time">13h — 18h</span>
              <strong className="shift-title">Tarde</strong>
            </div>
            <p className="shift-body">
              {secoes.turnos.tarde || 'Percurso pelos mirantes e centros históricos com parada estratégica no pôr do sol.'}
            </p>
          </div>

          <div className="shift-card">
            <div className="shift-card-header">
              <span className="font-mono shift-time">19h — 23h</span>
              <strong className="shift-title">Noite</strong>
            </div>
            <p className="shift-body">
              {secoes.turnos.noite || 'Jantar regional e caminhada tranquila pelo polo gastronômico e calçadão.'}
            </p>
          </div>
        </div>

        {/* Rodapé Duplo do Roteiro: Mesa Regional & Recomendação Climática */}
        <div className="guide-footer-split">
          <div className="guide-note-box">
            <span className="guide-note-label">Mesa & Culinária Local</span>
            <p className="guide-note-text">
              {secoes.gastronomia || `Experimente ${gastronomia_sugerida?.join(', ') || 'os pratos típicos da região'}.`}
            </p>
          </div>

          <div className="guide-note-box">
            <span className="guide-note-label">
              Preparo para o Clima ({clima?.temperatura || 28}°C • {clima?.condicao || 'Estável'})
            </span>
            <p className="guide-note-text">
              {secoes.climaDica || 'Use roupas leves com proteção solar e mantenha hidratação constante ao longo da viagem.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5. BLOCO DIREITO INFERIOR (5 colunas): Passaporte de Visitas + Gastronomia em Grade */}
      <div className="card bento-span-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Passaporte de Atrativos
            </h3>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
              {visitadosSet.size}/{atrativos_sugeridos?.length || 0} visitados
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
            {atrativos_sugeridos?.map((atrativo) => {
              const visitado = visitadosSet.has(atrativo);
              return (
                <button
                  key={atrativo}
                  type="button"
                  onClick={() => onAlternarVisita(atrativo, !visitado)}
                  style={{
                    background: visitado ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                    border: `1px solid ${visitado ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    textAlign: 'left',
                    minHeight: '78px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: visitado ? 'var(--accent-secondary)' : 'var(--text-primary)',
                      lineHeight: 1.25,
                    }}
                  >
                    {atrativo}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      color: visitado ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    }}
                  >
                    {visitado ? '✓ VISITADO' : 'MARCAR VISITA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Pratos Típicos do Destino
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.45rem' }}>
              {gastronomia_sugerida.map((prato) => (
                <div
                  key={prato}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}
                >
                  {prato}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
