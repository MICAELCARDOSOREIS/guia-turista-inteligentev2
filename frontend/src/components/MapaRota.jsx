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
  const [sanfonaAberta, setSanfonaAberta] = useState(true);
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

    const polyline = L.polyline(coords, {
      color: '#E09F3E',
      weight: 5,
      opacity: 0.92,
    }).addTo(polylineLayer.current);

    map.fitBounds(polyline.getBounds(), { padding: [34, 34] });

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
        const iconeHtml = p.tipo.includes('Eletroposto') ? '⚡' : '⛽';
        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:var(--bg-secondary); border:2px solid var(--accent-primary); border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:var(--shadow-md);">${iconeHtml}</div>`,
          iconSize: [30, 30],
        });

        L.marker([p.lat, p.lon], { icon: customIcon })
          .bindPopup(
            `<b>${p.nome}</b><br/>${p.tipo}<br/>Parada estimada: ${p.tempo_estimado_min} min<br/>Reserva no ponto: ${p.reserva_restante_pct}%`
          )
          .addTo(markersLayer.current);
      });
    }
  }, [roteiro]);

  if (!roteiro) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 430,
          background:
            'radial-gradient(circle at 80% 20%, rgba(46, 196, 182, 0.12), transparent 55%), var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge badge-info">Carta Cartográfica OSRM + Open-Elevation</span>
          <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            DATUM SIRGAS 2000 • ESCALA DINÂMICA
          </span>
        </div>

        <div style={{ maxWidth: '58ch', margin: '2rem 0' }}>
          <h2 className="font-display" style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Planejamento rodoviário com altimetria real, reserva de autonomia e guia em tempo real.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem' }}>
            Informe o município de partida e o destino ao lado para calcular a malha viária via OSRM,
            a penalização altimétrica na subida da serra, os postos ou eletropostos ao longo da rodovia
            e o roteiro cultural transmitido via Server-Sent Events (SSE).
          </p>
        </div>

        <div className="odometer-strip">
          <div className="odometer-cell">
            <span className="odometer-label">Corredor Litorâneo</span>
            <span className="odometer-value">Teresina → Parnaíba</span>
          </div>
          <div className="odometer-cell">
            <span className="odometer-label">Serra da Ibiapaba</span>
            <span className="odometer-value">Teresina → Pedro II</span>
          </div>
          <div className="odometer-cell">
            <span className="odometer-label">Rota das Emoções</span>
            <span className="odometer-value">Parnaíba → Jericoacoara</span>
          </div>
        </div>
      </div>
    );
  }

  const { rota, altimetria, custos } = roteiro;
  const custosExibicao = custosAtuais || custos;
  const coordPartida = rota.coordinates?.[0];
  const coordChegada = rota.coordinates?.[rota.coordinates.length - 1];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {roteiro.origem} → {roteiro.destino}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Traçado rodoviário calculado com margem de segurança energética de 18%
          </span>
        </div>
        <span className="badge badge-success">
          {roteiro.paradas_recarga?.length || 0} {roteiro.paradas_recarga?.length === 1 ? 'parada estratégica' : 'paradas estratégicas'}
        </span>
      </div>

      {/* Hodômetro de Telemetria da Viagem */}
      <div className="odometer-strip">
        <div className="odometer-cell">
          <span className="odometer-label">Extensão do Trecho</span>
          <span className="odometer-value">{rota.distancia_km} km</span>
        </div>
        <div className="odometer-cell">
          <span className="odometer-label">Tempo de Condução</span>
          <span className="odometer-value">{rota.duracao_formatada}</span>
        </div>
        <div className="odometer-cell">
          <span className="odometer-label">Desnível Líquido</span>
          <span className="odometer-value">
            {altimetria?.desnivel_liquido_m > 0 ? `+${altimetria.desnivel_liquido_m} m` : `${altimetria?.desnivel_liquido_m} m`}
          </span>
        </div>
        <div className="odometer-cell">
          <span className="odometer-label">Impacto do Relevo</span>
          <span className="odometer-value" style={{ color: 'var(--accent-primary)' }}>
            +{altimetria?.penalizacao_consumo_pct || 0}%
          </span>
        </div>
      </div>

      {/* Opções de Traçado */}
      {rota.rotas_alternativas && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {rota.rotas_alternativas.map((alt) => {
            const ativa = sugestaoSelecionada === alt.id;
            return (
              <button
                key={alt.id}
                type="button"
                className="btn-outline"
                style={{
                  borderColor: ativa ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: ativa ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                  color: ativa ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
                onClick={() => setSugestaoSelecionada(alt.id)}
              >
                <span>{alt.nome}</span>
                <span className="font-mono" style={{ fontSize: '0.76rem' }}>
                  {alt.distancia_km} km • {alt.duracao_min} min
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mapa Interativo com Overlay de Coordenadas */}
      <div className="map-frame">
        <div ref={mapRef} className="map-container" />
        {coordPartida && coordChegada && (
          <div className="map-coordinates-overlay">
            ORIG {coordPartida[1].toFixed(3)}°, {coordPartida[0].toFixed(3)}° • DEST {coordChegada[1].toFixed(3)}°, {coordChegada[0].toFixed(3)}°
          </div>
        )}
      </div>

      <BotoesControleViagem roteiro={roteiro} />

      {/* Corte Altimétrico SVG Contínuo */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setSanfonaAberta(!sanfonaAberta)}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '0.88rem',
            color: 'var(--text-primary)',
          }}
        >
          <span>Corte Topográfico e Altimetria da Rodovia (Open-Elevation)</span>
          <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {sanfonaAberta ? 'Ocultar ▲' : 'Inspecionar ▼'}
          </span>
        </button>

        {sanfonaAberta && (
          <div style={{ padding: '1.1rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Ganho Acumulado</small>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-danger)' }}>
                  +{altimetria?.ganho_elevacao_m} m
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Descida Acumulada</small>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  -{altimetria?.perda_elevacao_m} m
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Cota de Topo</small>
                <div className="font-mono" style={{ fontWeight: 700 }}>
                  {altimetria?.altitude_maxima_m} m
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Ajuste Energético</small>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                  +{altimetria?.penalizacao_consumo_pct}% consumo
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: 82, gap: 5, background: 'var(--bg-secondary)', padding: '10px 8px 6px', borderRadius: 8 }}>
              {altimetria?.perfil?.map((p, idx) => {
                const max = altimetria.altitude_maxima_m || 300;
                const alturaBarra = Math.max((p.elevacao / max) * 100, 14);
                return (
                  <div
                    key={idx}
                    title={`Km ${p.km}: ${p.elevacao}m de altitude`}
                    style={{
                      flex: 1,
                      height: `${alturaBarra}%`,
                      background: 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(224, 159, 62, 0.25) 100%)',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                );
              })}
            </div>
            <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
              <span>KM 0 ({roteiro.origem.split('-')[0].trim()})</span>
              <span>TRECHO INTERMEDIÁRIO</span>
              <span>KM {rota.distancia_km} ({roteiro.destino.split('-')[0].trim()})</span>
            </div>
          </div>
        )}
      </div>

      {/* Painel de Custos & Rateio */}
      <div style={{ background: 'var(--bg-secondary)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Orçamento Rodoviário & Rateio
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Inclui combustível/recarga corrigidos pelo relevo e estimativa de pedágios
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="passageirosInput" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Ocupantes:
            </label>
            <select
              id="passageirosInput"
              className="form-select font-mono"
              style={{ width: 'auto', padding: '0.3rem 0.65rem' }}
              value={passageiros}
              onChange={(e) => setPassageiros(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'ocupante' : 'ocupantes'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="odometer-strip">
          <div className="odometer-cell" style={{ background: 'var(--bg-card)' }}>
            <span className="odometer-label">Abastecimento / Recarga</span>
            <span className="odometer-value" style={{ fontSize: '1.05rem' }}>
              R$ {custosExibicao?.custo_combustivel_ou_energia?.toFixed(2)}
            </span>
          </div>
          <div className="odometer-cell" style={{ background: 'var(--bg-card)' }}>
            <span className="odometer-label">Praças de Pedágio</span>
            <span className="odometer-value" style={{ fontSize: '1.05rem' }}>
              R$ {custosExibicao?.custo_pedagios?.toFixed(2)}
            </span>
          </div>
          <div className="odometer-cell" style={{ background: 'var(--bg-card)' }}>
            <span className="odometer-label">Custo Total do Trecho</span>
            <span className="odometer-value" style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
              R$ {custosExibicao?.custo_total?.toFixed(2)}
            </span>
          </div>
          <div className="odometer-cell" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--accent-secondary)' }}>
            <span className="odometer-label">Rateio por Pessoa ({passageiros}x)</span>
            <span className="odometer-value" style={{ fontSize: '1.15rem', color: 'var(--accent-secondary)' }}>
              R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
