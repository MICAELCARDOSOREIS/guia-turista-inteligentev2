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
    const texto = `🗺️ *Roteiro de Viagem — Guia do Turista Brasil*\n🚗 De: ${roteiro.origem}\n📍 Para: ${roteiro.destino}\n🛣️ Distância: ${roteiro.rota?.distancia_km} km (${roteiro.rota?.duracao_formatada})\n💰 Custo Estimado: R$ ${roteiro.custos?.custo_total?.toFixed(2)}\n☀️ Clima: ${roteiro.clima?.temperatura}°C (${roteiro.clima?.condicao})\n\nGerado via Guia do Turista Inteligente v2!`;
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={handleAbrirGoogleMaps}
        className="btn-outline"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
      >
        🗺️ Abrir no Maps
      </button>

      <button
        type="button"
        onClick={handleCompartilharWhatsApp}
        className="btn-outline"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          color: '#22c55e',
          borderColor: '#22c55e',
        }}
      >
        💬 WhatsApp
      </button>

      <button
        type="button"
        onClick={handleDownloadGPX}
        className="btn-outline"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          color: 'var(--accent-primary)',
          borderColor: 'var(--accent-primary)',
        }}
      >
        📥 Baixar GPX 1.1
      </button>
    </div>
  );
}
