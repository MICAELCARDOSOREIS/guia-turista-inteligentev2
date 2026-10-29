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

  const handleSelecionarDestinoSugerido = (dest) => {
    setDestinoCidade(dest.cidade);
    setDestinoUf(dest.uf);
  };

  const autonomiaNominalKm = Math.round((parseFloat(consumoMedio) || 0) * (parseFloat(capacidade) || 0));
  const autonomiaSeguraKm = Math.round(autonomiaNominalKm * 0.82);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Carta de Navegação
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Defina trecho rodoviário, telemetria veicular e estadia
          </p>
        </div>
        <button
          type="button"
          onClick={handleDetectarGps}
          className="btn-outline"
          disabled={buscandoGps}
          title="Calcular destinos mais próximos pela distância geodésica de Haversine"
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', whiteSpace: 'nowrap' }}
        >
          {buscandoGps ? 'Localizando...' : 'Raio GPS'}
        </button>
      </div>

      {destinosProximos.length > 0 && (
        <div
          style={{
            marginBottom: '1.2rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Destinos por distância geodésica (Haversine)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {destinosProximos.map((d) => (
              <button
                key={d.cidade}
                type="button"
                className="btn-outline font-mono"
                style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                onClick={() => handleSelecionarDestinoSugerido(d)}
              >
                <span>{d.cidade}-{d.uf}</span>
                <span style={{ color: 'var(--accent-primary)' }}>{d.distancia_km} km</span>
                {d.requer_paradas && (
                  <span style={{ color: 'var(--accent-danger)' }} title="Exige parada obrigatória (> 400 km)">
                    • &gt;400km
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="route-connector-box">
          <span className="route-node-dot" style={{ top: '1.9rem' }} aria-hidden="true" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 82px', gap: '0.55rem' }}>
            <div className="form-group">
              <label htmlFor="origemCidade" className="form-label">Município de Origem</label>
              <input
                id="origemCidade"
                type="text"
                className="form-input"
                value={origemCidade}
                onChange={(e) => setOrigemCidade(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="origemUf" className="form-label">UF de Origem</label>
              <input
                id="origemUf"
                type="text"
                maxLength={2}
                className="form-input font-mono"
                value={origemUf}
                onChange={(e) => setOrigemUf(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <span className="route-node-dot dest" style={{ bottom: '1.3rem' }} aria-hidden="true" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 82px', gap: '0.55rem' }}>
            <div className="form-group" style={{ marginBottom: '0.2rem' }}>
              <label htmlFor="destinoCidade" className="form-label">Município de Destino</label>
              <input
                id="destinoCidade"
                type="text"
                className="form-input"
                value={destinoCidade}
                onChange={(e) => setDestinoCidade(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.2rem' }}>
              <label htmlFor="destinoUf" className="form-label">UF de Destino</label>
              <input
                id="destinoUf"
                type="text"
                maxLength={2}
                className="form-input font-mono"
                value={destinoUf}
                onChange={(e) => setDestinoUf(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section-divider">Motorização e Autonomia</div>

        <div className="form-group">
          <div className="propulsion-toggle" role="group" aria-label="Tipo de Propulsão">
            <button
              type="button"
              className={`propulsion-option ${tipoPropulsao === 'combustao' ? 'active-combustao' : ''}`}
              onClick={() => {
                setTipoPropulsao('combustao');
                setConsumoMedio(12.0);
                setCapacidade(50.0);
                setPrecoUnidade(5.89);
              }}
            >
              ⛽ Combustão
            </button>
            <button
              type="button"
              className={`propulsion-option ${tipoPropulsao === 'ev' ? 'active-ev' : ''}`}
              onClick={() => {
                setTipoPropulsao('ev');
                setConsumoMedio(6.5);
                setCapacidade(60.0);
                setPrecoUnidade(0.95);
              }}
            >
              ⚡ 100% Elétrico (EV)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <div className="form-group">
            <label htmlFor="consumoMedio" className="form-label">
              {tipoPropulsao === 'ev' ? 'Eficiência (km/kWh)' : 'Consumo (km/l)'}
            </label>
            <input
              id="consumoMedio"
              type="number"
              step="0.1"
              min="1"
              max="50"
              className="form-input font-mono"
              value={consumoMedio}
              onChange={(e) => setConsumoMedio(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="capacidade" className="form-label">
              {tipoPropulsao === 'ev' ? 'Bateria (kWh)' : 'Tanque (litros)'}
            </label>
            <input
              id="capacidade"
              type="number"
              step="1"
              min="10"
              max="200"
              className="form-input font-mono"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              required
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.85rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-color)',
            fontSize: '0.76rem',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Alcance útil (reserva 18%):</span>
          <strong className="font-mono" style={{ color: 'var(--accent-secondary)' }}>
            {autonomiaSeguraKm} km <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {autonomiaNominalKm} km máx</span>
          </strong>
        </div>

        <div className="form-section-divider">Estadia e Curadoria Cultural</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <div className="form-group">
            <label htmlFor="diasEstadia" className="form-label">Duração no Destino</label>
            <select
              id="diasEstadia"
              className="form-select"
              value={diasEstadia}
              onChange={(e) => setDiasEstadia(e.target.value)}
            >
              <option value="1">1 dia (bate-volta)</option>
              <option value="2">2 dias (fim de semana)</option>
              <option value="3">3 dias (feriado)</option>
              <option value="4">4 dias (imersão)</option>
              <option value="5">5 dias (expedição)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="estiloViagem" className="form-label">Foco do Roteiro</label>
            <select
              id="estiloViagem"
              className="form-select"
              value={estiloViagem}
              onChange={(e) => setEstiloViagem(e.target.value)}
            >
              <option value="Cultural">Histórico & Cultural</option>
              <option value="Gastronômico">Rota Gastronômica</option>
              <option value="Ecoturismo">Natureza & Ecoturismo</option>
              <option value="Família">Lazer em Família</option>
              <option value="Romântico">Refúgio & Charme</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={carregando}
          style={{ marginTop: '0.5rem' }}
        >
          {carregando ? 'Processando Rota, Relevo & IA...' : 'Traçar Rota e Gerar Guia'}
        </button>
      </form>
    </div>
  );
}
