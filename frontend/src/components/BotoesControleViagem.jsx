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
    const texto = `Roteiro de Viagem — Guia do Turista Brasil\nDe: ${roteiro.origem}\nPara: ${roteiro.destino}\nDistância: ${roteiro.rota?.distancia_km} km (${roteiro.rota?.duracao_formatada})\nCusto Estimado: R$ ${roteiro.custos?.custo_total?.toFixed(2)}\nClima: ${roteiro.clima?.temperatura}°C (${roteiro.clima?.condicao})`;
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      <button type="button" onClick={handleAbrirGoogleMaps} className="btn-utility">
        Google Maps
      </button>
      <button type="button" onClick={handleCompartilharWhatsApp} className="btn-utility">
        WhatsApp
      </button>
      <button type="button" onClick={handleDownloadGPX} className="btn-utility">
        Exportar GPX 1.1
      </button>
    </div>
  );
}
