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
    <div className="analytics-row">
      {/* Coluna Esquerda: Programação por Turnos estilo App de Viagem (Wanderlog) */}
      <div className="surface-box" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>
              Programação Sugerida em {roteiro.destino}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {secoes.essencia}
            </p>
          </div>
          {streamingGuia && (
            <span className="saas-brand-badge">Sincronizando SSE…</span>
          )}
        </div>

        <div className="timeline-list">
          <div className="timeline-item">
            <span className="timeline-badge">07h – 12h</span>
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.15rem' }}>Manhã</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {secoes.turnos.manha || 'Saída nas primeiras horas para aproveitar temperaturas amenas nos pontos principais.'}
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <span className="timeline-badge">13h – 18h</span>
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.15rem' }}>Tarde</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {secoes.turnos.tarde || 'Percurso pelos mirantes e centro histórico com parada estratégica no fim da tarde.'}
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <span className="timeline-badge">19h – 23h</span>
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.15rem' }}>Noite</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {secoes.turnos.noite || 'Jantar regional e passeio noturno pelos polos culturais da cidade.'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.85rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'block', marginBottom: '0.2rem' }}>
              Onde & O Que Comer
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {secoes.gastronomia || `Experimente ${gastronomia_sugerida?.join(', ') || 'os pratos típicos locais'}.`}
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'block', marginBottom: '0.2rem' }}>
              Recomendação Climática ({clima?.temperatura || 28}°C)
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {secoes.climaDica || 'Use roupas leves com proteção solar e mantenha hidratação durante o trajeto.'}
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Checklist Interativo de Lugares & Gastronomia */}
      <div className="surface-box" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>Pontos Turísticos</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Marque os locais visitados durante a estadia
              </p>
            </div>
            <span className="saas-brand-badge font-mono">
              {visitadosSet.size}/{atrativos_sugeridos?.length || 0} visitados
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {atrativos_sugeridos?.map((atrativo) => {
              const visitado = visitadosSet.has(atrativo);
              return (
                <div key={atrativo} className={`place-item ${visitado ? 'visited' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `1.5px solid ${visitado ? 'var(--brand-primary)' : 'var(--border-focus)'}`,
                        background: visitado ? 'var(--brand-primary)' : 'transparent',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      {visitado ? '✓' : ''}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {atrativo}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ height: 28, padding: '0 0.65rem', fontSize: '0.74rem' }}
                    onClick={() => onAlternarVisita(atrativo, !visitado)}
                  >
                    {visitado ? 'Desmarcar' : 'Check-in'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Pratos Típicos do Destino
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {gastronomia_sugerida.map((prato) => (
                <span
                  key={prato}
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
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
