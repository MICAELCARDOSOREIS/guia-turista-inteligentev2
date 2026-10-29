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
    <header className="topbar">
      <div className="topbar-brand">
        <span className="highway-code">BR-343</span>
        <span className="topbar-title">Guia do Turista Brasil</span>
        <span className="topbar-meta">Caderno Cartográfico e Planejamento Rodoviário</span>
      </div>

      <div className="topbar-controls">
        <button
          onClick={onToggleTheme}
          className="btn-utility"
          title="Alternar iluminação da superfície"
          aria-label="Alternar Tema Claro/Escuro"
        >
          {theme === 'dark' ? 'Superfície Clara' : 'Superfície Escura'}
        </button>

        {usuario?.is_visitante ? (
          <>
            <span className="status-tag" title="Sessão temporária com validade de 2 horas">
              Visitante • {formatado}
            </span>
            {googleSalvo && (
              <button
                onClick={onRestaurarGoogle}
                className="btn-utility"
                title={`Retomar conta ${googleSalvo.nome}`}
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
              className="btn-utility"
            >
              Entrar com Google
            </button>
          </>
        ) : (
          <>
            <span className="status-tag">
              {usuario?.nome}
            </span>
            <button onClick={onMudarVisitante} className="btn-utility">
              Modo Visitante
            </button>
            <button
              onClick={onLogout}
              className="btn-utility"
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
