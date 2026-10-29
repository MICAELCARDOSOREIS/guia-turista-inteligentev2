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
      color: '#E09F3E',
      weight: 5,
      opacity: 0.92,
    }).addTo(polylineLayer.current);

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

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
      <>
        {/* Bloco 8 colunas: Apresentação do Atlas */}
        <div
          className="card bento-span-8"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 340,
            background:
              'radial-gradient(circle at 80% 20%, rgba(46, 196, 182, 0.12), transparent 55%), var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-info">Carta Cartográfica OSRM + Open-Elevation</span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              SIRGAS 2000 • ESCALA DINÂMICA
            </span>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.65rem' }}>
              Planejamento rodoviário com altimetria real, reserva de autonomia e guia em tempo real.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '56ch' }}>
              Configure a rota no painel à esquerda para renderizar o mapa interativo, o corte topográfico da serra,
              o orçamento dividido por ocupante e a curadoria cultural via Server-Sent Events (SSE).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div className="odometer-cell">
              <span className="odometer-label">Corredor Litorâneo</span>
              <span className="odometer-value" style={{ fontSize: '0.95rem' }}>Teresina → Parnaíba</span>
            </div>
            <div className="odometer-cell">
              <span className="odometer-label">Serra da Ibiapaba</span>
              <span className="odometer-value" style={{ fontSize: '0.95rem' }}>Teresina → Pedro II</span>
            </div>
            <div className="odometer-cell">
              <span className="odometer-label">Rota das Emoções</span>
              <span className="odometer-value" style={{ fontSize: '0.95rem' }}>Parnaíba → Jeri</span>
            </div>
          </div>
        </div>

        {/* Bloco 4 colunas: Especificações de Engenharia */}
        <div
          className="card bento-span-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem',
          }}
        >
          <div>
            <span className="badge badge-warning">Arquitetura ASGI</span>
            <h3 className="font-display" style={{ fontSize: '1.15rem', marginTop: '0.5rem' }}>
              Módulos Ativos no Painel
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
            <div className="odometer-cell">
              <span className="odometer-label">Orquestração Paralela</span>
              <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                Duplo asyncio.gather()
              </span>
            </div>
            <div className="odometer-cell">
              <span className="odometer-label">Reserva de Segurança</span>
              <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                Margem energética de 18%
              </span>
            </div>
            <div className="odometer-cell">
              <span className="odometer-label">Exportação GPS</span>
              <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Padrão XML GPX 1.1
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { rota, altimetria, custos, clima } = roteiro;
  const custosExibicao = custosAtuais || custos;
  const coordPartida = rota.coordinates?.[0];
  const coordChegada = rota.coordinates?.[rota.coordinates.length - 1];

  return (
    <>
      {/* 1. FAIXA SUPERIOR (12 colunas): Cabeçalho da Rota + 4 Células de Hodômetro */}
      <div className="card bento-span-12" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                {roteiro.origem} → {roteiro.destino}
              </h2>
              <span className="badge badge-success">
                {roteiro.paradas_recarga?.length || 0} {roteiro.paradas_recarga?.length === 1 ? 'parada' : 'paradas'}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Cálculo rodoviário OSRM com margem energética de 18% e compensação de relevo Open-Elevation
            </span>
          </div>

          {rota.rotas_alternativas && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
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
                    <span className="font-mono" style={{ fontSize: '0.72rem' }}>
                      {alt.distancia_km} km
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
            <span className="odometer-label">Clima no Destino</span>
            <span className="odometer-value" style={{ color: 'var(--accent-secondary)' }}>
              {clima ? `${clima.temperatura}°C` : '--'} <small style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{clima?.condicao}</small>
            </span>
          </div>
        </div>
      </div>

      {/* 2. BLOCO ESQUERDO (7 colunas): Mapa Interativo + Botões de Exportação */}
      <div className="card bento-span-7" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
        <div className="map-frame">
          <div ref={mapRef} className="map-container" />
          {coordPartida && coordChegada && (
            <div className="map-coordinates-overlay">
              ORIG {coordPartida[1].toFixed(3)}°, {coordPartida[0].toFixed(3)}° • DEST {coordChegada[1].toFixed(3)}°, {coordChegada[0].toFixed(3)}°
            </div>
          )}
        </div>
        <BotoesControleViagem roteiro={roteiro} />
      </div>

      {/* 3. BLOCO DIREITO (5 colunas): Altimetria + Orçamento & Rateio Lado a Lado com o Mapa */}
      <div className="bento-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Card de Corte Topográfico */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Corte Topográfico & Relevo
            </h3>
            <span className="badge badge-warning">
              +{altimetria?.penalizacao_consumo_pct}% consumo
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div className="odometer-cell" style={{ padding: '0.5rem 0.65rem' }}>
              <span className="odometer-label">Subida</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-danger)' }}>
                +{altimetria?.ganho_elevacao_m} m
              </span>
            </div>
            <div className="odometer-cell" style={{ padding: '0.5rem 0.65rem' }}>
              <span className="odometer-label">Descida</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>
                -{altimetria?.perda_elevacao_m} m
              </span>
            </div>
            <div className="odometer-cell" style={{ padding: '0.5rem 0.65rem' }}>
              <span className="odometer-label">Altitude Máx</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {altimetria?.altitude_maxima_m} m
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 68, gap: 4, background: 'var(--bg-secondary)', padding: '8px 6px 4px', borderRadius: 8 }}>
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
                      background: 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(224, 159, 62, 0.25) 100%)',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                );
              })}
            </div>
            <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>0 km</span>
              <span>Perfil Open-Elevation</span>
              <span>{rota.distancia_km} km</span>
            </div>
          </div>
        </div>

        {/* Card de Orçamento Rodoviário & Rateio */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Orçamento & Rateio
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label htmlFor="passageirosInput" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Ocupantes:
              </label>
              <select
                id="passageirosInput"
                className="form-select font-mono"
                style={{ width: 'auto', padding: '0.22rem 0.5rem', fontSize: '0.78rem' }}
                value={passageiros}
                onChange={(e) => setPassageiros(parseInt(e.target.value, 10))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
            <div className="odometer-cell" style={{ padding: '0.55rem 0.7rem' }}>
              <span className="odometer-label">Combustível / Energia</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                R$ {custosExibicao?.custo_combustivel_ou_energia?.toFixed(2)}
              </span>
            </div>
            <div className="odometer-cell" style={{ padding: '0.55rem 0.7rem' }}>
              <span className="odometer-label">Pedágios Estimados</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                R$ {custosExibicao?.custo_pedagios?.toFixed(2)}
              </span>
            </div>
            <div className="odometer-cell" style={{ padding: '0.55rem 0.7rem' }}>
              <span className="odometer-label">Total da Viagem</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                R$ {custosExibicao?.custo_total?.toFixed(2)}
              </span>
            </div>
            <div className="odometer-cell" style={{ padding: '0.55rem 0.7rem', background: 'var(--bg-elevated)', borderColor: 'var(--accent-secondary)' }}>
              <span className="odometer-label">Por Pessoa ({passageiros}x)</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-secondary)' }}>
                R$ {custosExibicao?.custo_por_passageiro?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
