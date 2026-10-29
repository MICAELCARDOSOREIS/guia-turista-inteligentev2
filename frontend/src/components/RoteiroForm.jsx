import React, { useState } from 'react';
import { obterLocalizacaoAtual, filtrarDestinosPorRaio } from '../services/geolocation';

const DESTINOS_SUGERIDOS = [
  { cidade: 'Parnaíba', uf: 'PI', lat: -2.9038, lon: -41.7766 },
  { cidade: 'Luís Correia', uf: 'PI', lat: -2.8794, lon: -41.6669 },
  { cidade: 'Pedro II', uf: 'PI', lat: -4.4258, lon: -41.4586 },
  { cidade: 'Sete Cidades', uf: 'PI', lat: -4.0988, lon: -41.7069 },
  { cidade: 'Jericoacoara', uf: 'CE', lat: -2.7958, lon: -40.5142 },
  { cidade: 'Fortaleza', uf: 'CE', lat: -3.7172, lon: -38.5433 },
];

export default function RoteiroForm({ onSubmit, carregando }) {
  const [origemCidade, setOrigemCidade] = useState('Teresina');
  const [origemUf, setOrigemUf] = useState('PI');
  const [destinoCidade, setDestinoCidade] = useState('Parnaíba');
  const [destinoUf, setDestinoUf] = useState('PI');
  const [tipoPropulsao, setTipoPropulsao] = useState('combustao');
  const [consumoMedio, setConsumoMedio] = useState(12.0);
  const [capacidade, setCapacidade] = useState(50.0);
  const [precoUnidade, setPrecoUnidade] = useState(5.89);
  const [diasEstadia, setDiasEstadia] = useState(3);
  const [estiloViagem, setEstiloViagem] = useState('Cultural');
  const [preferenciaRota] = useState('tempo');

  const [destinosProximos, setDestinosProximos] = useState([]);
  const [buscandoGps, setBuscandoGps] = useState(false);

  const handleDetectarGps = async () => {
    setBuscandoGps(true);
    try {
      const loc = await obterLocalizacaoAtual();
      const proximos = filtrarDestinosPorRaio(loc.lat, loc.lon, DESTINOS_SUGERIDOS, 4);
      setDestinosProximos(proximos);
    } catch (_) {}
    finally {
      setBuscandoGps(false);
    }
  };

  const handleInverterRota = () => {
    setOrigemCidade(destinoCidade);
    setOrigemUf(destinoUf);
    setDestinoCidade(origemCidade);
    setDestinoUf(origemUf);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (carregando) return;

    onSubmit({
      origem_cidade: origemCidade.trim(),
      origem_uf: origemUf.trim().toUpperCase(),
      destino_cidade: destinoCidade.trim(),
      destino_uf: destinoUf.trim().toUpperCase(),
      tipo_propulsao: tipoPropulsao,
      consumo_medio: parseFloat(consumoMedio),
      capacidade_tanque_bateria: parseFloat(capacidade),
      preco_unidade_energia: parseFloat(precoUnidade),
      dias_estadia: parseInt(diasEstadia, 10),
      estilo_viagem: estiloViagem,
      preferencia_rota: preferenciaRota,
    });
  };

  const autonomiaNominalKm = Math.round((parseFloat(consumoMedio) || 0) * (parseFloat(capacidade) || 0));
  const autonomiaSeguraKm = Math.round(autonomiaNominalKm * 0.82);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Planejador de Rota
          </h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Configure origem, destino e veículo
          </p>
        </div>
        <button
          type="button"
          onClick={handleDetectarGps}
          className="btn-ghost"
          disabled={buscandoGps}
          style={{ height: 30, padding: '0 0.6rem', fontSize: '0.74rem' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          <span>{buscandoGps ? 'Buscando…' : 'Destinos próximos'}</span>
        </button>
      </div>

      {destinosProximos.length > 0 && (
        <div
          style={{
            marginBottom: '0.9rem',
            padding: '0.65rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Sugestões por proximidade (Haversine):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {destinosProximos.map((d) => (
              <button
                key={d.cidade}
                type="button"
                className="btn-ghost font-mono"
                style={{ height: 26, padding: '0 0.5rem', fontSize: '0.72rem' }}
                onClick={() => {
                  setDestinoCidade(d.cidade);
                  setDestinoUf(d.uf);
                }}
              >
                <span>{d.cidade}-{d.uf}</span>
                <span style={{ color: 'var(--brand-primary)' }}>{d.distancia_km}km</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Bloco Unificado de Origem e Destino com Botão de Inverter */}
        <div className="route-inputs-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 68px', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <div>
              <label htmlFor="origemCidade" className="field-label">Município de Origem</label>
              <input
                id="origemCidade"
                type="text"
                className="field-input"
                value={origemCidade}
                onChange={(e) => setOrigemCidade(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="origemUf" className="field-label">UF de Origem</label>
              <input
                id="origemUf"
                type="text"
                maxLength={2}
                className="field-input font-mono"
                value={origemUf}
                onChange={(e) => setOrigemUf(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0.5rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <button
              type="button"
              onClick={handleInverterRota}
              className="btn-ghost"
              style={{ height: 24, padding: '0 0.5rem', fontSize: '0.7rem' }}
              title="Inverter origem e destino"
            >
              ⇅ Inverter
            </button>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 68px', gap: '0.5rem' }}>
            <div>
              <label htmlFor="destinoCidade" className="field-label">Município de Destino</label>
              <input
                id="destinoCidade"
                type="text"
                className="field-input"
                value={destinoCidade}
                onChange={(e) => setDestinoCidade(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="destinoUf" className="field-label">UF de Destino</label>
              <input
                id="destinoUf"
                type="text"
                maxLength={2}
                className="field-input font-mono"
                value={destinoUf}
                onChange={(e) => setDestinoUf(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
        </div>

        {/* Seletor de Propulsão */}
        <div className="field-group">
          <label className="field-label">Motorização</label>
          <div className="segmented-pill" role="group" aria-label="Tipo de Propulsão">
            <button
              type="button"
              className={`segmented-item ${tipoPropulsao === 'combustao' ? 'active' : ''}`}
              onClick={() => {
                setTipoPropulsao('combustao');
                setConsumoMedio(12.0);
                setCapacidade(50.0);
                setPrecoUnidade(5.89);
              }}
            >
              Combustão
            </button>
            <button
              type="button"
              className={`segmented-item ${tipoPropulsao === 'ev' ? 'active' : ''}`}
              onClick={() => {
                setTipoPropulsao('ev');
                setConsumoMedio(6.5);
                setCapacidade(60.0);
                setPrecoUnidade(0.95);
              }}
            >
              100% Elétrico (EV)
            </button>
          </div>
        </div>

        {/* Eficiência e Tanque */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.65rem' }}>
          <div>
            <label htmlFor="consumoMedio" className="field-label">
              {tipoPropulsao === 'ev' ? 'Eficiência (km/kWh)' : 'Consumo (km/l)'}
            </label>
            <input
              id="consumoMedio"
              type="number"
              step="0.1"
              min="1"
              max="50"
              className="field-input font-mono"
              value={consumoMedio}
              onChange={(e) => setConsumoMedio(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="capacidade" className="field-label">
              {tipoPropulsao === 'ev' ? 'Bateria (kWh)' : 'Tanque (litros)'}
            </label>
            <input
              id="capacidade"
              type="number"
              step="1"
              min="10"
              max="200"
              className="field-input font-mono"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Barra de Autonomia Segura */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            background: 'var(--brand-light)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.85rem',
            fontSize: '0.76rem',
          }}
        >
          <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Autonomia segura (-18%)</span>
          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
            {autonomiaSeguraKm} km <span style={{ opacity: 0.7, fontWeight: 500 }}>/ {autonomiaNominalKm} km</span>
          </span>
        </div>

        {/* Estadia e Estilo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
          <div>
            <label htmlFor="diasEstadia" className="field-label">Estadia</label>
            <select
              id="diasEstadia"
              className="field-select"
              value={diasEstadia}
              onChange={(e) => setDiasEstadia(e.target.value)}
            >
              <option value="1">1 dia</option>
              <option value="2">2 dias</option>
              <option value="3">3 dias</option>
              <option value="4">4 dias</option>
              <option value="5">5 dias</option>
            </select>
          </div>
          <div>
            <label htmlFor="estiloViagem" className="field-label">Perfil</label>
            <select
              id="estiloViagem"
              className="field-select"
              value={estiloViagem}
              onChange={(e) => setEstiloViagem(e.target.value)}
            >
              <option value="Cultural">Cultural</option>
              <option value="Gastronômico">Gastronômico</option>
              <option value="Ecoturismo">Ecoturismo</option>
              <option value="Família">Família</option>
              <option value="Romântico">Romântico</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-brand" disabled={carregando}>
          {carregando ? 'Processando rota e relevo…' : 'Planejar Viagem'}
        </button>
      </form>
    </div>
  );
}
