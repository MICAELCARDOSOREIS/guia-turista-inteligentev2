import React from 'react';

export default function HistoricoViagens({
  viagens,
  roteiroAtual,
  onSelecionar,
  onExcluir,
}) {
  if (!viagens || viagens.length === 0) {
    return (
      <div className="sidebar-section">
        <div className="section-heading" style={{ marginBottom: '0.35rem' }}>
          <span>Histórico da Sessão</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Nenhuma rota registrada nesta sessão.
        </p>
      </div>
    );
  }

  return (
    <div className="sidebar-section">
      <div className="section-heading">
        <span>Histórico da Sessão</span>
        <span className="font-mono">{viagens.length}</span>
      </div>

      <table className="ledger-table">
        <tbody>
          {viagens.map((v) => {
            const selecionado = roteiroAtual?.id === v.id;
            return (
              <tr
                key={v.id}
                onClick={() => onSelecionar(v)}
                style={{
                  cursor: 'pointer',
                  background: selecionado ? 'var(--bg-active)' : 'transparent',
                }}
              >
                <td style={{ padding: '0.5rem 0.35rem' }}>
                  <div style={{ fontWeight: selecionado ? 700 : 500, fontSize: '0.84rem' }}>
                    {v.origem?.split('-')[0]?.trim()} → {v.destino?.split('-')[0]?.trim()}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {v.rota?.distancia_km} km • R$ {v.custos?.custo_total?.toFixed(0)}
                  </div>
                </td>
                <td style={{ padding: '0.5rem 0.35rem', width: 32 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcluir(v.id);
                    }}
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      padding: '0.1rem 0.35rem',
                    }}
                    title="Remover rota"
                    aria-label={`Excluir viagem para ${v.destino}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
