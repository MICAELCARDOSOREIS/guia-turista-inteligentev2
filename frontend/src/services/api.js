/**
 * Cliente HTTP assíncrono para consumo da API REST e leitor de fluxos SSE via Fetch API.
 */

import { API_BASE_URL } from '../config';

/**
 * Dispara requisição REST medindo latência e capturando cabeçalhos de telemetria.
 */
async function request(endpoint, options = {}, userId = 'guest_anonimo') {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...(options.headers || {}),
  };

  const inicio = performance.now();
  const response = await fetch(url, { ...options, headers });
  const duracaoFrontMs = Math.round(performance.now() - inicio);

  const processTimeHeader = response.headers.get('X-Process-Time') || '0ms';
  const requestId = response.headers.get('X-Request-ID') || '';

  if (!response.ok) {
    let erroDetalhe = 'Erro ao processar requisição';
    try {
      const errJson = await response.json();
      erroDetalhe = errJson.detail || erroDetalhe;
    } catch (_) {
      erroDetalhe = response.statusText || erroDetalhe;
    }
    const error = new Error(erroDetalhe);
    error.status = response.status;
    error.duracaoFrontMs = duracaoFrontMs;
    error.processTimeHeader = processTimeHeader;
    throw error;
  }

  const data = await response.json();
  return {
    data,
    meta: {
      duracaoFrontMs,
      processTimeHeader,
      requestId,
      status: response.status,
    },
  };
}

export async function planejarViagemApi(payload, userId) {
  return request('/roteiros/planejar', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, userId);
}

export async function obterMapaRotaApi(payload, userId) {
  return request('/roteiros/mapa-rota', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, userId);
}

export async function calcularCustosApi(payload, userId) {
  return request('/roteiros/custos', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, userId);
}

export async function obterMinhasViagensApi(userId) {
  return request('/roteiros/minhas-viagens', { method: 'GET' }, userId);
}

export async function excluirViagemApi(roteiroId, userId) {
  return request(`/roteiros/${roteiroId}`, { method: 'DELETE' }, userId);
}

export async function marcarVisitaApi(roteiroId, atrativo, visitado, userId) {
  return request(`/roteiros/${roteiroId}/visitas`, {
    method: 'PATCH',
    body: JSON.stringify({ atrativo, visitado }),
  }, userId);
}

export async function obterTelemetriaApi() {
  const url = `${API_BASE_URL}/telemetria`;
  const res = await fetch(url);
  return res.json();
}

/**
 * Consome fluxo em tempo real de Server-Sent Events (SSE) via ReadableStream.
 */
export async function consumirStreamGuiaSSE(payload, onChunk, onDone, onError) {
  const url = `${API_BASE_URL}/roteiros/stream-guia`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Falha no streaming SSE: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const linhas = buffer.split('\n\n');
      buffer = linhas.pop() || '';

      for (const linha of linhas) {
        if (linha.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(linha.substring(6));
            if (parsed.chunk) {
              onChunk(parsed.chunk);
            }
            if (parsed.done) {
              onDone();
              return;
            }
          } catch (_) {
            // fragmento parcial
          }
        }
      }
    }
    onDone();
  } catch (err) {
    if (onError) onError(err);
  }
}
