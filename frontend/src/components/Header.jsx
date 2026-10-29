import React from 'react';
import { useSessionTimer } from '../hooks/useSessionTimer';

export default function Header({
  usuario,
  googleSalvo,
  theme,
  onToggleTheme,
  onMudarVisitante,
  onRestaurarGoogle,
  onLogout,
}) {
  const { formatado } = useSessionTimer(usuario);

  return (
    <header className="saas-navbar">
      <div className="saas-brand">
        <div className="saas-logo-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        </div>
        <div>
          <span className="saas-brand-title">Guia do Turista</span>
        </div>
        <span className="saas-brand-badge">Rotas & Telemetria</span>
      </div>

      <div className="saas-nav-right">
        <button
          onClick={onToggleTheme}
          className="btn-ghost"
          title="Alternar tema claro ou escuro"
          aria-label="Alternar Tema Claro/Escuro"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            )}
          </svg>
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>

        {usuario?.is_visitante ? (
          <>
            <span
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-amber-bg)',
                color: 'var(--accent-amber)',
                fontWeight: 600,
              }}
              title="Sessão temporária com validade de 2 horas"
            >
              Visitante • {formatado}
            </span>
            {googleSalvo && (
              <button
                onClick={onRestaurarGoogle}
                className="btn-ghost"
                style={{ color: 'var(--brand-primary)', borderColor: 'var(--brand-border)' }}
              >
                Retomar {googleSalvo.nome.split(' ')[0]}
              </button>
            )}
            <button
              onClick={() => {
                const mockGoogle = {
                  user_id: 'google_1029384756',
                  nome: 'Maria Clara Martins',
                  email: 'mariaclara@ufpi.edu.br',
                  is_visitante: false,
                };
                window.dispatchEvent(new CustomEvent('login_google_mock', { detail: mockGoogle }));
              }}
              className="btn-ghost"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Entrar com Google</span>
            </button>
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--brand-light)',
                color: 'var(--brand-primary)',
              }}
            >
              {usuario?.nome}
            </span>
            <button onClick={onMudarVisitante} className="btn-ghost">
              Modo Visitante
            </button>
            <button
              onClick={onLogout}
              className="btn-ghost"
              style={{ color: 'var(--accent-danger)' }}
            >
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
}
