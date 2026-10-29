import React, { useEffect } from 'react';
import Header from './components/Header';
import RoteiroForm from './components/RoteiroForm';
import MapaRota from './components/MapaRota';
import RoteiroResult from './components/RoteiroResult';
import TelemetriaCard from './components/TelemetriaCard';
import HistoricoViagens from './components/HistoricoViagens';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import Footer from './components/Footer';

import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useToasts } from './hooks/useToasts';
import { useViagem } from './hooks/useViagem';
import { useNetworkStatus } from './hooks/useNetworkStatus';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToasts();
  const isOnline = useNetworkStatus();

  const {
    usuario,
    googleSalvo,
    loginGoogleSucesso,
    mudarParaModoVisitante,
    restaurarUsuarioGoogle,
    logoutCompleto,
  } = useAuth();

  const {
    roteiroAtual,
    setRoteiroAtual,
    viagensSalvas,
    telemetria,
    carregando,
    streamingGuia,
    textoGuiaStream,
    planejarViagem,
    excluirViagem,
    alternarVisitaAtrativo,
  } = useViagem(usuario?.user_id, addToast);

  useEffect(() => {
    const handleGoogleMock = (e) => {
      loginGoogleSucesso(e.detail);
      addToast(`Sessão iniciada como ${e.detail.nome}`, 'success');
    };
    window.addEventListener('login_google_mock', handleGoogleMock);
    return () => window.removeEventListener('login_google_mock', handleGoogleMock);
  }, [loginGoogleSucesso, addToast]);

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Header
          usuario={usuario}
          googleSalvo={googleSalvo}
          theme={theme}
          onToggleTheme={toggleTheme}
          onMudarVisitante={() => {
            mudarParaModoVisitante();
            addToast('Modo visitante temporário ativado (2h).', 'info');
          }}
          onRestaurarGoogle={() => {
            restaurarUsuarioGoogle();
            addToast('Conta Google restaurada.', 'success');
          }}
          onLogout={() => {
            logoutCompleto();
            addToast('Sessão encerrada.', 'info');
          }}
        />

        {!isOnline && (
          <div
            style={{
              background: 'var(--accent-danger)',
              color: '#ffffff',
              textAlign: 'center',
              padding: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            Modo offline ativo — operando com dados de contingência local.
          </div>
        )}

        <main className="saas-workspace">
          {/* Painel Lateral Fixo estilo App SaaS */}
          <aside className="planner-sidebar">
            <RoteiroForm onSubmit={planejarViagem} carregando={carregando} />
            <HistoricoViagens
              viagens={viagensSalvas}
              roteiroAtual={roteiroAtual}
              onSelecionar={(v) => {
                setRoteiroAtual(v);
                addToast(`Roteiro aberto: ${v.destino}`, 'info');
              }}
              onExcluir={excluirViagem}
            />
          </aside>

          {/* Palco Principal: Mapa Interativo + Analytics + Roteiro */}
          <section className="main-stage">
            <MapaRota roteiro={roteiroAtual} userId={usuario?.user_id} />
            <RoteiroResult
              roteiro={roteiroAtual}
              textoGuiaStream={textoGuiaStream}
              streamingGuia={streamingGuia}
              onAlternarVisita={alternarVisitaAtrativo}
            />
            <TelemetriaCard telemetria={telemetria} />
            <Footer />
          </section>
        </main>

        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
}
