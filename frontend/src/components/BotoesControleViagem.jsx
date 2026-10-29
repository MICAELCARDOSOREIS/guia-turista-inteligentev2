import React from 'react';
import { API_BASE_URL } from '../config';

export default function BotoesControleViagem({ roteiro }) {
  if (!roteiro) return null;

  const handleAbrirGoogleMaps = () => {
    const origemEnc = encodeURIComponent(roteiro.origem);
    const destinoEnc = encodeURIComponent(roteiro.destino);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origemEnc}&destination=${destinoEnc}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCompartilharWhatsApp = () => {
    const texto = `Roteiro de Viagem — Guia do Turista\nDe: ${roteiro.origem}\nPara: ${roteiro.destino}\nDistância: ${roteiro.rota?.distancia_km} km (${roteiro.rota?.duracao_formatada})\nCusto Estimado: R$ ${roteiro.custos?.custo_total?.toFixed(2)}\nClima: ${roteiro.clima?.temperatura}°C (${roteiro.clima?.condicao})`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadGPX = () => {
    const url = `${API_BASE_URL}/roteiros/exportar/gpx?origem=${encodeURIComponent(roteiro.origem)}&destino=${encodeURIComponent(roteiro.destino)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerario-${roteiro.origem}-para-${roteiro.destino}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <button
        type="button"
        onClick={handleAbrirGoogleMaps}
        className="btn-ghost"
        style={{ height: 28, padding: '0 0.6rem', fontSize: '0.74rem' }}
      >
        Google Maps
      </button>
      <button
        type="button"
        onClick={handleCompartilharWhatsApp}
        className="btn-ghost"
        style={{ height: 28, padding: '0 0.6rem', fontSize: '0.74rem' }}
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={handleDownloadGPX}
        className="btn-ghost"
        style={{ height: 28, padding: '0 0.6rem', fontSize: '0.74rem', color: 'var(--brand-primary)', borderColor: 'var(--brand-border)' }}
      >
        GPX 1.1
      </button>
    </div>
  );
}
