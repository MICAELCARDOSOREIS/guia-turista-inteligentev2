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
      addToast(`Bem-vindo(a), ${e.detail.nome}!`, 'success');
    };
    window.addEventListener('login_google_mock', handleGoogleMock);
    return () => window.removeEventListener('login_google_mock', handleGoogleMock);
  }, [loginGoogleSucesso, addToast]);

  return (
    <ErrorBoundary>
      <div className="app-layout">
        <Header
          usuario={usuario}
          googleSalvo={googleSalvo}
          theme={theme}
          onToggleTheme={toggleTheme}
          onMudarVisitante={() => {
            mudarParaModoVisitante();
            addToast('Sessão alterada para Visitante Temporário (TTL 2h).', 'info');
          }}
          onRestaurarGoogle={() => {
            restaurarUsuarioGoogle();
            addToast('Conta Google restaurada com sucesso!', 'success');
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
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ⚠️ Conexão offline detectada. O sistema operará em modo de contingência local.
          </div>
        )}

        <main className="container app-main">
          {/* Painel Lateral Fixo (Cockpit de Comando) */}
          <aside className="cockpit-sidebar">
            <RoteiroForm onSubmit={planejarViagem} carregando={carregando} />
            <HistoricoViagens
              viagens={viagensSalvas}
              roteiroAtual={roteiroAtual}
              onSelecionar={(v) => {
                setRoteiroAtual(v);
                addToast(`Roteiro carregado: ${v.destino}`, 'info');
              }}
              onExcluir={excluirViagem}
            />
          </aside>

          {/* Mosaico Bento Grid (Sem empilhamento vertical em lista) */}
          <section className="bento-workspace">
            <MapaRota
              roteiro={roteiroAtual}
              userId={usuario?.user_id}
              telemetria={telemetria}
            />
            <RoteiroResult
              roteiro={roteiroAtual}
              textoGuiaStream={textoGuiaStream}
              streamingGuia={streamingGuia}
              onAlternarVisita={alternarVisitaAtrativo}
            />
            <TelemetriaCard telemetria={telemetria} />
          </section>
        </main>

        <Footer />
        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
}
