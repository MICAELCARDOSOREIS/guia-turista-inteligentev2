import React from 'react';

export default function Toast({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notificações">
      {toasts.map((t) => {
        const bgCor =
          t.tipo === 'success'
            ? 'var(--accent-secondary)'
            : t.tipo === 'error'
            ? 'var(--accent-danger)'
            : t.tipo === 'warning'
            ? 'var(--accent-warning)'
            : 'var(--accent-primary)';

        return (
          <div
            key={t.id}
            className="toast"
            style={{ borderLeft: `4px solid ${bgCor}` }}
          >
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{t.mensagem}</span>
            <button
              onClick={() => onRemove(t.id)}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
                padding: '0 4px',
              }}
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
