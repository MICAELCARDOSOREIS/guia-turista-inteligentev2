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
    <header className="header-topbar">
      <div className="header-brand">
        <div className="brand-highway-shield" aria-hidden="true">
          <small>BR</small>
          <strong>343</strong>
        </div>
        <div className="header-title-group">
          <span className="header-title">Guia do Turista Brasil</span>
          <span className="header-subtitle">Atlas Rodoviário, Altimetria & Telemetria ASGI</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={onToggleTheme}
          className="btn-outline"
          title="Alternar modo noturno ou carta solar"
          aria-label="Alternar Tema Claro/Escuro"
        >
          {theme === 'dark' ? '☀️ Carta Solar' : '🌙 Painel Noturno'}
        </button>

        {usuario?.is_visitante ? (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-warning" title="Sessão temporária com validade de 2 horas">
              Visitante • {formatado}
            </span>
            {googleSalvo && (
              <button
                onClick={onRestaurarGoogle}
                className="btn-outline"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
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
              className="btn-outline"
              title="Autenticar conta Google"
            >
              Entrar com Google
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-success">
              {usuario?.nome}
            </span>
            <button
              onClick={onMudarVisitante}
              className="btn-outline"
              title="Alternar para modo visitante preservando a sessão Google em segundo plano"
            >
              Modo Visitante
            </button>
            <button
              onClick={onLogout}
              className="btn-outline"
              style={{ color: 'var(--accent-danger)' }}
              title="Encerrar sessão"
            >
              Encerrar sessão
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
