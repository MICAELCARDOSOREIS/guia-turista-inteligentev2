import { useState, useEffect, useCallback } from 'react';
import {
  planejarViagemApi,
  obterMinhasViagensApi,
  excluirViagemApi,
  marcarVisitaApi,
  consumirStreamGuiaSSE,
} from '../services/api';

export function useViagem(userId, addToast) {
  const [roteiroAtual, setRoteiroAtual] = useState(null);
  const [viagensSalvas, setViagensSalvas] = useState([]);
  const [telemetria, setTelemetria] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [streamingGuia, setStreamingGuia] = useState(false);
  const [textoGuiaStream, setTextoGuiaStream] = useState('');

  const carregarViagens = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await obterMinhasViagensApi(userId);
      setViagensSalvas(res.data || []);
    } catch (_) {}
  }, [userId]);

  useEffect(() => {
    carregarViagens();
  }, [carregarViagens]);

  const planejarViagem = async (parametros) => {
    setCarregando(true);
    setTextoGuiaStream('');
    try {
      const { data, meta } = await planejarViagemApi(parametros, userId);
      setRoteiroAtual(data);
      setTelemetria({
        latenciaApi: meta.processTimeHeader,
        latenciaFront: `${meta.duracaoFrontMs}ms`,
        requestId: meta.requestId,
        usuarioAtivo: userId,
      });

      addToast('Roteiro planejado com sucesso!', 'success');
      carregarViagens();

      // Inicia streaming do guia detalhado via SSE
      setStreamingGuia(true);
      await consumirStreamGuiaSSE(
        {
          destino: data.destino,
          dias_estadia: parametros.dias_estadia,
          estilo_viagem: parametros.estilo_viagem,
          clima_info: data.clima,
          atrativos: data.atrativos_sugeridos,
          gastronomia: data.gastronomia_sugerida,
        },
        (chunk) => {
          setTextoGuiaStream((prev) => prev + chunk);
        },
        () => {
          setStreamingGuia(false);
        },
        (err) => {
          setStreamingGuia(false);
        }
      );
    } catch (err) {
      if (err.status === 409) {
        addToast('Requisição duplicada em andamento. Aguarde...', 'warning');
      } else if (err.status === 422) {
        addToast(`Dados inválidos: ${err.message}`, 'error');
      } else {
        addToast(`Erro: ${err.message}`, 'error');
      }
    } finally {
      setCarregando(false);
    }
  };

  const excluirViagem = async (roteiroId) => {
    try {
      await excluirViagemApi(roteiroId, userId);
      setViagensSalvas((prev) => prev.filter((v) => v.id !== roteiroId));
      if (roteiroAtual?.id === roteiroId) {
        setRoteiroAtual(null);
      }
      addToast('Viagem excluída do histórico.', 'info');
    } catch (err) {
      addToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };

  const alternarVisitaAtrativo = async (atrativo, visitado) => {
    if (!roteiroAtual) return;
    try {
      await marcarVisitaApi(roteiroAtual.id, atrativo, visitado, userId);
      setRoteiroAtual((prev) => {
        const visitados = new Set(prev.atrativos_visitados || []);
        if (visitado) visitados.add(atrativo);
        else visitados.delete(atrativo);
        return { ...prev, atrativos_visitados: Array.from(visitados) };
      });
    } catch (_) {}
  };

  return {
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
    recarregarViagens: carregarViagens,
  };
}
