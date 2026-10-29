import React from 'react';

export default function HistoricoViagens({
  viagens,
  roteiroAtual,
  onSelecionar,
  onExcluir,
}) {
  if (!viagens || viagens.length === 0) {
    return (
      <div className="card" style={{ marginTop: '1.1rem', padding: '1.15rem' }}>
        <div className="font-display" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Diário de Bordo Vazio
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Trace sua primeira rota acima para salvar automaticamente no diário desta sessão.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem' }}>
        <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
          Diário de Bordo
        </h3>
        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {viagens.length} {viagens.length === 1 ? 'rota salva' : 'rotas salvas'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '290px', overflowY: 'auto' }}>
        {viagens.map((v) => {
          const selecionado = roteiroAtual?.id === v.id;
          return (
            <div
              key={v.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: selecionado ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: `1px solid ${selecionado ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
              }}
              onClick={() => onSelecionar(v)}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {v.origem?.split('-')[0]?.trim()} → {v.destino?.split('-')[0]?.trim()}
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
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
                  padding: '0.28rem 0.55rem',
                  fontSize: '0.74rem',
                  color: 'var(--accent-danger)',
                  borderColor: 'transparent',
                }}
                title="Remover viagem do histórico"
                aria-label={`Excluir viagem para ${v.destino}`}
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
