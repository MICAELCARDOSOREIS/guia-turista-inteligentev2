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
  const [passageiros, setPassageiros] = useState(2);
  const [custosAtuais, setCustosAtuais] = useState(null);

  useEffect(() => {
    if (!roteiro?.custos) return;
    setCustosAtuais(roteiro.custos);
  }, [roteiro]);

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

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView([-4.0, -42.0], 7);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
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

    const polyline = L.polyline(coords, {
      color: '#0F766E',
      weight: 5,
      opacity: 0.9,
    }).addTo(polylineLayer.current);

    map.fitBounds(polyline.getBounds(), { padding: [45, 45] });

    if (coords.length > 0) {
      L.marker(coords[0])
        .bindPopup(`<b>Origem:</b> ${roteiro.origem}`)
        .addTo(markersLayer.current);

      L.marker(coords[coords.length - 1])
        .bindPopup(`<b>Destino:</b> ${roteiro.destino}`)
        .addTo(markersLayer.current);
    }

    if (roteiro.paradas_recarga) {
      roteiro.paradas_recarga.forEach((p) => {
        const rotulo = p.tipo.includes('Eletroposto') ? 'EV' : 'P';
        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#0F766E; border:2px solid #ffffff; color:#ffffff; border-radius:999px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-weight:700; font-size:11px; box-shadow:0 2px 6px rgba(0,0,0,0.25);">${rotulo}</div>`,
          iconSize: [28, 28],
        });

        L.marker([p.lat, p.lon], { icon: customIcon })
          .bindPopup(
            `<b>${p.nome}</b><br/>${p.tipo}<br/>Parada estimada: ${p.tempo_estimado_min} min<br/>Reserva: ${p.reserva_restante_pct}%`
          )
          .addTo(markersLayer.current);
      });
    }
  }, [roteiro]);

  const { rota, altimetria, custos, clima } = roteiro || {};
  const custosExibicao = custosAtuais || custos;

  return (
    <>
      {/* 1. KPIs Executivos da Viagem (Se houver rota ativa) */}
      {roteiro && (
        <div className="kpi-grid">
          <div className="kpi-tile">
            <span className="kpi-label">Distância Total</span>
            <span className="kpi-number font-mono">{rota.distancia_km} km</span>
            <span className="kpi-sub">Malha rodoviária OSRM</span>
          </div>

          <div className="kpi-tile">
            <span className="kpi-label">Tempo de Percurso</span>
            <span className="kpi-number font-mono">{rota.duracao_formatada}</span>
            <span className="kpi-sub">
              {roteiro.paradas_recarga?.length || 0} {roteiro.paradas_recarga?.length === 1 ? 'parada sugerida' : 'paradas sugeridas'}
            </span>
          </div>

          <div className="kpi-tile">
            <span className="kpi-label">Custo por Pessoa ({passageiros}x)</span>
            <span className="kpi-number font-mono" style={{ color: 'var(--brand-primary)' }}>
              R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
            </span>
            <span className="kpi-sub font-mono">Total: R$ {custosExibicao?.custo_total?.toFixed(2)}</span>
          </div>

          <div className="kpi-tile">
            <span className="kpi-label">Clima em {roteiro.destino.split('-')[0].trim()}</span>
            <span className="kpi-number font-mono">
              {clima ? `${clima.temperatura}°C` : '--'}
            </span>
            <span className="kpi-sub">{clima?.condicao || 'Open-Meteo'}</span>
          </div>
        </div>
      )}

      {/* 2. Mapa Sempre Visível com Barra HUD Flutuante (Estilo Apple Maps / Airbnb) */}
      <div className="map-stage-wrapper">
        <div className="map-floating-hud">
          <div className="map-hud-pill">
            {roteiro ? (
              <>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  {roteiro.origem} → {roteiro.destino}
                </span>
                {rota?.rotas_alternativas && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {rota.rotas_alternativas.map((alt) => {
                      const ativa = sugestaoSelecionada === alt.id;
                      return (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => setSugestaoSelecionada(alt.id)}
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            background: ativa ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                            color: ativa ? '#ffffff' : 'var(--text-secondary)',
                          }}
                        >
                          {alt.nome}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Mapa Interativo pronto — configure sua rota no painel ao lado
              </span>
            )}
          </div>

          {roteiro && (
            <div className="map-hud-pill" style={{ padding: '0.35rem 0.5rem' }}>
              <BotoesControleViagem roteiro={roteiro} />
            </div>
          )}
        </div>

        <div ref={mapRef} className="map-canvas-Interactive" />
      </div>

      {/* 3. Painéis Analíticos Lado a Lado: Altimetria + Orçamento Detalhado */}
      {roteiro && (
        <div className="analytics-row">
          {/* Painel de Relevo & Altimetria */}
          <div className="surface-box" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Perfil Altimétrico da Rodovia</h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Subida: +{altimetria?.ganho_elevacao_m}m • Descida: -{altimetria?.perda_elevacao_m}m • Topo: {altimetria?.altitude_maxima_m}m
                </p>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'var(--accent-amber-bg)',
                  color: 'var(--accent-amber)',
                }}
              >
                +{altimetria?.penalizacao_consumo_pct}% consumo
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 64, gap: 4, background: 'var(--bg-subtle)', padding: '10px 8px 4px', borderRadius: '8px' }}>
                {altimetria?.perfil?.map((p, idx) => {
                  const max = altimetria.altitude_maxima_m || 300;
                  const alturaBarra = Math.max((p.elevacao / max) * 100, 14);
                  return (
                    <div
                      key={idx}
                      title={`Km ${p.km}: ${p.elevacao}m`}
                      style={{
                        flex: 1,
                        height: `${alturaBarra}%`,
                        background: 'var(--brand-primary)',
                        borderRadius: '3px 3px 0 0',
                        opacity: 0.85,
                      }}
                    />
                  );
                })}
              </div>
              <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>Partida (0 km)</span>
                <span>Amostragem Open-Elevation</span>
                <span>Chegada ({rota.distancia_km} km)</span>
              </div>
            </div>
          </div>

          {/* Painel de Rateio e Custos */}
          <div className="surface-box" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Divisão de Custos da Viagem</h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Cálculo ajustado pela topografia e pedágios
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label htmlFor="passageirosInput" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Viajantes:
                </label>
                <select
                  id="passageirosInput"
                  className="field-select font-mono"
                  style={{ width: 'auto', height: 30, padding: '0 0.5rem', fontSize: '0.8rem' }}
                  value={passageiros}
                  onChange={(e) => setPassageiros(parseInt(e.target.value, 10))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Abastecimento</span>
                <strong className="font-mono" style={{ fontSize: '0.95rem' }}>
                  R$ {custosExibicao?.custo_combustivel_ou_energia?.toFixed(2)}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Pedágios</span>
                <strong className="font-mono" style={{ fontSize: '0.95rem' }}>
                  R$ {custosExibicao?.custo_pedagios?.toFixed(2)}
                </strong>
              </div>
              <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', padding: '0.65rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'block' }}>Por Pessoa</span>
                <strong className="font-mono" style={{ fontSize: '0.98rem', color: 'var(--brand-primary)' }}>
                  R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
