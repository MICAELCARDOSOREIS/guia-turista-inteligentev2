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
      color: '#1B5E4A',
      weight: 4,
      opacity: 0.9,
    }).addTo(polylineLayer.current);

    map.fitBounds(polyline.getBounds(), { padding: [28, 28] });

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
        const rotulo = p.tipo.includes('Eletroposto') ? 'EV' : 'KM';
        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:var(--bg-surface); border:1.5px solid var(--text-primary); color:var(--text-primary); border-radius:3px; width:26px; height:20px; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-weight:700; font-size:10px;">${rotulo}</div>`,
          iconSize: [26, 20],
        });

        L.marker([p.lat, p.lon], { icon: customIcon })
          .bindPopup(
            `<b>${p.nome}</b><br/>${p.tipo}<br/>Parada estimada: ${p.tempo_estimado_min} min<br/>Reserva: ${p.reserva_restante_pct}%`
          )
          .addTo(markersLayer.current);
      });
    }
  }, [roteiro]);

  if (!roteiro) {
    return (
      <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid var(--line-strong)' }}>
        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          SIRGAS 2000 • OSRM ROUTING • OPEN-ELEVATION
        </span>
        <h2 className="font-display" style={{ fontSize: '1.7rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.5rem', maxWidth: '52ch' }}>
          Selecione o município de partida e destino na coluna à esquerda para traçar a folha de rota.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '60ch' }}>
          O sistema consulta simultaneamente a geometria viária OSRM, a altimetria da rodovia e as condições meteorológicas para dimensionar paradas e custos por ocupante.
        </p>
      </div>
    );
  }

  const { rota, altimetria, custos, clima } = roteiro;
  const custosExibicao = custosAtuais || custos;
  const coordPartida = rota.coordinates?.[0];
  const coordChegada = rota.coordinates?.[rota.coordinates.length - 1];

  return (
    <>
      {/* 1. Cabeçalho da Folha de Rota */}
      <div className="route-header-bar">
        <div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {roteiro.origem} → {roteiro.destino}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {roteiro.paradas_recarga?.length || 0} {roteiro.paradas_recarga?.length === 1 ? 'parada programada' : 'paradas programadas'} (margem de segurança energética de 18%)
          </span>
        </div>

        {rota.rotas_alternativas && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {rota.rotas_alternativas.map((alt) => {
              const ativa = sugestaoSelecionada === alt.id;
              return (
                <button
                  key={alt.id}
                  type="button"
                  className="btn-utility"
                  style={{
                    borderColor: ativa ? 'var(--text-primary)' : 'var(--line-strong)',
                    background: ativa ? 'var(--bg-active)' : 'var(--bg-canvas)',
                  }}
                  onClick={() => setSugestaoSelecionada(alt.id)}
                >
                  <span>{alt.nome}</span>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {alt.distancia_km} km
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Faixa de Medidores Separados por Fios (Hairline Ledger) */}
      <div className="metrics-ledger">
        <div className="ledger-cell">
          <span className="ledger-label">Distância Rodoviária</span>
          <span className="ledger-value">{rota.distancia_km} km</span>
        </div>
        <div className="ledger-cell">
          <span className="ledger-label">Tempo Estimado</span>
          <span className="ledger-value">{rota.duracao_formatada}</span>
        </div>
        <div className="ledger-cell">
          <span className="ledger-label">Desnível Líquido</span>
          <span className="ledger-value">
            {altimetria?.desnivel_liquido_m > 0 ? `+${altimetria.desnivel_liquido_m} m` : `${altimetria?.desnivel_liquido_m} m`}
          </span>
        </div>
        <div className="ledger-cell">
          <span className="ledger-label">Clima no Destino</span>
          <span className="ledger-value">
            {clima ? `${clima.temperatura}°C` : '--'}{' '}
            <small style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {clima?.condicao}
            </small>
          </span>
        </div>
      </div>

      {/* 3. Divisão Superior: Mapa à Esquerda | Altimetria e Tabela Contábil à Direita */}
      <div className="canvas-split-top">
        <div className="map-pane">
          <div ref={mapRef} className="map-viewport" />
          <div className="map-toolbar">
            <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              {coordPartida && coordChegada
                ? `${coordPartida[1].toFixed(3)}°, ${coordPartida[0].toFixed(3)}° → ${coordChegada[1].toFixed(3)}°, ${coordChegada[0].toFixed(3)}°`
                : 'Geometria OSRM'}
            </span>
            <BotoesControleViagem roteiro={roteiro} />
          </div>
        </div>

        <div className="specs-pane">
          {/* Bloco de Altimetria */}
          <div className="spec-block">
            <div className="section-heading">
              <span>Altimetria da Rodovia</span>
              <span className="font-mono" style={{ color: 'var(--accent-ochre)' }}>
                +{altimetria?.penalizacao_consumo_pct}% consumo
              </span>
            </div>

            <table className="ledger-table" style={{ marginBottom: '0.85rem' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Ganho de subida acumulado</td>
                  <td>+{altimetria?.ganho_elevacao_m} m</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Descida acumulada</td>
                  <td>-{altimetria?.perda_elevacao_m} m</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Cota máxima do trecho</td>
                  <td>{altimetria?.altitude_maxima_m} m</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: 56, gap: 3, padding: '6px 0', borderBottom: '1px solid var(--line-strong)' }}>
              {altimetria?.perfil?.map((p, idx) => {
                const max = altimetria.altitude_maxima_m || 300;
                const alturaBarra = Math.max((p.elevacao / max) * 100, 12);
                return (
                  <div
                    key={idx}
                    title={`Km ${p.km}: ${p.elevacao}m`}
                    style={{
                      flex: 1,
                      height: `${alturaBarra}%`,
                      background: 'var(--text-primary)',
                      opacity: 0.72,
                    }}
                  />
                );
              })}
            </div>
            <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>0 km</span>
              <span>Open-Elevation</span>
              <span>{rota.distancia_km} km</span>
            </div>
          </div>

          {/* Bloco Contábil de Custos e Rateio */}
          <div className="spec-block">
            <div className="section-heading">
              <span>Demonstrativo de Custos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <label htmlFor="passageirosInput" style={{ fontSize: '0.74rem' }}>Ocupantes:</label>
                <select
                  id="passageirosInput"
                  className="field-select font-mono"
                  style={{ width: 'auto', minHeight: 26, padding: '0.1rem 0.4rem', fontSize: '0.76rem' }}
                  value={passageiros}
                  onChange={(e) => setPassageiros(parseInt(e.target.value, 10))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="ledger-table">
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Combustível / Energia</td>
                  <td>R$ {custosExibicao?.custo_combustivel_ou_energia?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Pedágios estimados</td>
                  <td>R$ {custosExibicao?.custo_pedagios?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Custo total da viagem</td>
                  <td>R$ {custosExibicao?.custo_total?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    Rateio individual ({passageiros} {passageiros === 1 ? 'pessoa' : 'pessoas'})
                  </td>
                  <td style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>
                    R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
