import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { calcularCustosApi } from '../services/api';
import BotoesControleViagem from './BotoesControleViagem';

export default function MapaRota({ roteiro, userId }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const polylineLayer = useRef(null);
  const markersLayer = useRef(null);

  const [sugestaoSelecionada, setSugestaoSelecionada] = useState('rota_1');
  const [sanfonaAberta, setSanfonaAberta] = useState(false);
  const [passageiros, setPassageiros] = useState(1);
  const [custosAtuais, setCustosAtuais] = useState(null);

  useEffect(() => {
    if (!roteiro?.custos) return;
    setCustosAtuais(roteiro.custos);
  }, [roteiro]);

  // Recalcula custos quando muda número de passageiros
  useEffect(() => {
    if (!roteiro) return;
    const atualizarCustos = async () => {
      try {
        const payload = {
          distancia_km: roteiro.rota.distancia_km,
          tipo_propulsao: roteiro.custos.tipo_propulsao,
          consumo_medio: roteiro.custos.consumo_nominal,
          preco_unidade: roteiro.custos.preco_unidade,
          uf_origem: roteiro.origem.split('-')[1]?.trim() || 'PI',
          uf_destino: roteiro.destino.split('-')[1]?.trim() || 'PI',
          num_passageiros: passageiros,
        };
        const res = await calcularCustosApi(payload, userId);
        setCustosAtuais(res.data);
      } catch (_) {}
    };
    atualizarCustos();
  }, [passageiros, roteiro, userId]);

  // Inicializa mapa Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current).setView([-4.0, -42.0], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      polylineLayer.current = L.layerGroup().addTo(map);
      markersLayer.current = L.layerGroup().addTo(map);
      leafletInstance.current = map;
    }

    const map = leafletInstance.current;
    polylineLayer.current.clearLayers();
    markersLayer.current.clearLayers();

    if (!roteiro?.rota?.coordinates) return;

    const coords = roteiro.rota.coordinates.map((c) => [c[1], c[0]]);

    // Desenha traçado da rodovia
    const polyline = L.polyline(coords, {
      color: '#0284c7',
      weight: 5,
      opacity: 0.85,
    }).addTo(polylineLayer.current);

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    // Marcadores de Origem e Destino
    if (coords.length > 0) {
      L.marker(coords[0])
        .bindPopup(`<b>Partida:</b> ${roteiro.origem}`)
        .addTo(markersLayer.current);

      L.marker(coords[coords.length - 1])
        .bindPopup(`<b>Destino:</b> ${roteiro.destino}`)
        .addTo(markersLayer.current);
    }

    // Marcadores de postos por autonomia
    if (roteiro.paradas_recarga) {
      roteiro.paradas_recarga.forEach((p) => {
        const iconeHtml = p.tipo.includes('Eletroposto') ? '⚡' : '⛽';
        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:var(--bg-secondary); border:2px solid var(--accent-warning); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:var(--shadow-md);">${iconeHtml}</div>`,
          iconSize: [28, 28],
        });

        L.marker([p.lat, p.lon], { icon: customIcon })
          .bindPopup(
            `<b>${p.nome}</b><br/>${p.tipo}<br/>Tempo estimado: ${p.tempo_estimado_min} min<br/>Margem reserva: ${p.reserva_restante_pct}%`
          )
          .addTo(markersLayer.current);
      });
    }
  }, [roteiro]);

  if (!roteiro) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          🗺️ Preencha os parâmetros e clique em <b>Planejar Roteiro</b> para renderizar o mapa interativo, altimetria e postos estratégicos.
        </p>
      </div>
    );
  }

  const { rota, altimetria, custos } = roteiro;
  const custosExibicao = custosAtuais || custos;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Badges de Destaque Métrico */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
          🛣️ {rota.distancia_km} km
        </span>
        <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
          ⏱️ {rota.duracao_formatada}
        </span>
        <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
          ⛽ {roteiro.paradas_recarga?.length || 0} Paradas Sugeridas
        </span>
        <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
          ⛰️ Desnível: {altimetria?.desnivel_liquido_m > 0 ? `+${altimetria.desnivel_liquido_m}m` : `${altimetria?.desnivel_liquido_m}m`}
        </span>
      </div>

      {/* Abas de Rotas Alternativas */}
      {rota.rotas_alternativas && (
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {rota.rotas_alternativas.map((alt) => (
            <button
              key={alt.id}
              type="button"
              className="btn-outline"
              style={{
                borderColor: sugestaoSelecionada === alt.id ? 'var(--accent-primary)' : 'var(--border-color)',
                background: sugestaoSelecionada === alt.id ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: sugestaoSelecionada === alt.id ? 700 : 400,
                fontSize: '0.85rem',
              }}
              onClick={() => setSugestaoSelecionada(alt.id)}
            >
              {alt.nome} ({alt.distancia_km} km • {alt.duracao_min} min)
            </button>
          ))}
        </div>
      )}

      {/* Container Leaflet */}
      <div ref={mapRef} className="map-container" />

      {/* Ações Rápidas: Maps, WhatsApp e GPX */}
      <BotoesControleViagem roteiro={roteiro} />

      {/* Sanfona de Topografia & Relevo */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setSanfonaAberta(!sanfonaAberta)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
          }}
        >
          <span>⛰️ Perfil Topográfico & Altimetria (Open-Elevation)</span>
          <span>{sanfonaAberta ? '▲ Recolher' : '▼ Expandir'}</span>
        </button>

        {sanfonaAberta && (
          <div style={{ padding: '1rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>Ganho de Subida:</small>
                <div style={{ fontWeight: 700, color: 'var(--accent-danger)' }}>+{altimetria?.ganho_elevacao_m} m</div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>Perda de Descida:</small>
                <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>-{altimetria?.perda_elevacao_m} m</div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>Altitude Máxima:</small>
                <div style={{ fontWeight: 700 }}>{altimetria?.altitude_maxima_m} m</div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>Penalização Consumo:</small>
                <div style={{ fontWeight: 700, color: 'var(--accent-warning)' }}>+{altimetria?.penalizacao_consumo_pct}%</div>
              </div>
            </div>

            {/* Mini gráfico visual de altimetria */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 70, gap: 4, background: 'var(--bg-secondary)', padding: '6px', borderRadius: 6 }}>
              {altimetria?.perfil?.map((p, idx) => {
                const max = altimetria.altitude_maxima_m || 300;
                const alturaBarra = Math.max((p.elevacao / max) * 100, 15);
                return (
                  <div
                    key={idx}
                    title={`Km ${p.km}: ${p.elevacao}m`}
                    style={{
                      flex: 1,
                      height: `${alturaBarra}%`,
                      background: 'var(--accent-primary)',
                      opacity: 0.8,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>Partida (0 km)</span>
              <span>Metade do Trajeto</span>
              <span>Chegada ({rota.distancia_km} km)</span>
            </div>
          </div>
        )}
      </div>

      {/* Painel de Custos & Rateio */}
      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>💰 Estimativa de Despesas & Rateio</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="passageirosInput" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Passageiros:
            </label>
            <select
              id="passageirosInput"
              className="form-select"
              style={{ width: 'auto', padding: '0.2rem 0.5rem' }}
              value={passageiros}
              onChange={(e) => setPassageiros(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'viajante' : 'viajantes'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
          <div>
            <small style={{ color: 'var(--text-secondary)' }}>Energia/Combustível:</small>
            <div style={{ fontWeight: 600 }}>R$ {custosExibicao?.custo_combustivel_ou_energia?.toFixed(2)}</div>
          </div>
          <div>
            <small style={{ color: 'var(--text-secondary)' }}>Pedágios Previstos:</small>
            <div style={{ fontWeight: 600 }}>R$ {custosExibicao?.custo_pedagios?.toFixed(2)}</div>
          </div>
          <div>
            <small style={{ color: 'var(--text-secondary)' }}>Custo Total:</small>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
              R$ {custosExibicao?.custo_total?.toFixed(2)}
            </div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: 4 }}>
            <small style={{ color: 'var(--text-secondary)' }}>Cota Individual ({passageiros}x):</small>
            <div style={{ fontWeight: 800, color: 'var(--accent-secondary)', fontSize: '1.15rem' }}>
              R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
