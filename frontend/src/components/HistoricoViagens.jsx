import React from 'react';

export default function HistoricoViagens({
  viagens,
  roteiroAtual,
  onSelecionar,
  onExcluir,
}) {
  if (!viagens || viagens.length === 0) {
    return (
      <div
        style={{
          padding: '0.9rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          border: '1px dashed var(--border-focus)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Suas viagens salvas aparecerão aqui para acesso rápido.
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Viagens Recentes
        </span>
        <span className="saas-brand-badge font-mono">{viagens.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {viagens.map((v) => {
          const selecionado = roteiroAtual?.id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => onSelecionar(v)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: selecionado ? 'var(--brand-light)' : 'var(--bg-subtle)',
                border: `1px solid ${selecionado ? 'var(--brand-border)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {v.origem?.split('-')[0]?.trim()} → {v.destino?.split('-')[0]?.trim()}
                </div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {v.rota?.distancia_km} km • R$ {v.custos?.custo_total?.toFixed(0)}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir(v.id);
                }}
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  padding: '0.1rem 0.35rem',
                }}
                title="Excluir viagem"
                aria-label={`Excluir viagem para ${v.destino}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
