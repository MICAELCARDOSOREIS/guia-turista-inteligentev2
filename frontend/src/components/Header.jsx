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
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="var(--accent-primary)" />
          <path d="M50 20 L60 45 L85 45 L65 60 L72 85 L50 70 L28 85 L35 60 L15 45 L40 45 Z" fill="#ffffff" />
        </svg>
        <span>Guia do Turista Brasil</span>
        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>v2.0 ASGI</span>
      </div>

      <div className="header-actions">
        {/* Alternador de Tema */}
        <button
          onClick={onToggleTheme}
          className="btn-outline"
          title="Alternar Tema Claro/Escuro"
          aria-label="Alternar Tema Claro/Escuro"
        >
          {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
        </button>

        {/* Sessão do Usuário */}
        {usuario?.is_visitante ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-warning" title="Sessão Temporária de Visitante">
              Visitante ({formatado})
            </span>
            {googleSalvo && (
              <button
                onClick={onRestaurarGoogle}
                className="btn-outline"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                title={`Retomar conta ${googleSalvo.nome}`}
              >
                Voltar para {googleSalvo.nome.split(' ')[0]}
              </button>
            )}
            <button
              onClick={() => {
                // Simulação de login Google para apresentação
                const mockGoogle = {
                  user_id: 'google_1029384756',
                  nome: 'Micael Aluno',
                  email: 'micael@ufpi.edu.br',
                  is_visitante: false,
                };
                window.dispatchEvent(new CustomEvent('login_google_mock', { detail: mockGoogle }));
              }}
              className="btn-outline"
              title="Conectar com Google"
            >
              🔑 Google Sign-In
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              👤 {usuario?.nome}
            </span>
            <button
              onClick={onMudarVisitante}
              className="btn-outline"
              title="Trocar para modo visitante sem desconectar"
            >
              Usar como Visitante
            </button>
            <button
              onClick={onLogout}
              className="btn-outline"
              style={{ color: 'var(--accent-danger)' }}
              title="Encerrar sessão"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
