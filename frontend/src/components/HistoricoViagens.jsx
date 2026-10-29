import React from 'react';

export default function HistoricoViagens({
  viagens,
  roteiroAtual,
  onSelecionar,
  onExcluir,
}) {
  if (!viagens || viagens.length === 0) {
    return (
      <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Nenhuma viagem salva no histórico deste usuário.
        </span>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        📂 Minhas Viagens Salvas ({viagens.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
        {viagens.map((v) => {
          const selecionado = roteiroAtual?.id === v.id;
          return (
            <div
              key={v.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: selecionado ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: `1px solid ${selecionado ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
              }}
              onClick={() => onSelecionar(v)}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {v.origem?.split('-')[0]?.trim()} ➔ {v.destino?.split('-')[0]?.trim()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {v.rota?.distancia_km} km • R$ {v.custos?.custo_total?.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir(v.id);
                }}
                className="btn-outline"
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-danger)',
                  borderColor: 'transparent',
                }}
                title="Excluir viagem"
                aria-label={`Excluir viagem para ${v.destino}`}
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
