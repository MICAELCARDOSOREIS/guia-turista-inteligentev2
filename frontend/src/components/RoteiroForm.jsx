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
    <div className="sidebar-section">
      <div className="section-heading">
        <span>Parâmetros do Trecho</span>
        <button
          type="button"
          onClick={handleDetectarGps}
          className="btn-utility"
          disabled={buscandoGps}
          style={{ minHeight: 28, padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
        >
          {buscandoGps ? 'Localizando…' : 'Proximidade GPS'}
        </button>
      </div>

      {destinosProximos.length > 0 && (
        <div style={{ marginBottom: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--line-hairline)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Raio geodésico (Haversine):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {destinosProximos.map((d) => (
              <button
                key={d.cidade}
                type="button"
                className="btn-utility font-mono"
                style={{ fontSize: '0.72rem', minHeight: 28, padding: '0.2rem 0.5rem' }}
                onClick={() => handleSelecionarDestinoSugerido(d)}
              >
                <span>{d.cidade}-{d.uf}</span>
                <span style={{ color: 'var(--accent-ochre)' }}>{d.distancia_km} km</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field-row" style={{ gridTemplateColumns: '1fr 74px' }}>
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

        <div className="field-row" style={{ gridTemplateColumns: '1fr 74px' }}>
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

        <div className="field-label" style={{ marginTop: '0.85rem' }}>Propulsão</div>
        <div className="segmented-control" role="group" aria-label="Tipo de Propulsão">
          <button
            type="button"
            className={`segmented-btn ${tipoPropulsao === 'combustao' ? 'is-active' : ''}`}
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
            className={`segmented-btn ${tipoPropulsao === 'ev' ? 'is-active' : ''}`}
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

        <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            padding: '0.45rem 0',
            marginBottom: '0.65rem',
            borderTop: '1px solid var(--line-hairline)',
            borderBottom: '1px solid var(--line-hairline)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Alcance útil (reserva 18%)</span>
          <span className="font-mono" style={{ fontWeight: 600 }}>
            {autonomiaSeguraKm} km / {autonomiaNominalKm} km
          </span>
        </div>

        <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
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
            <label htmlFor="estiloViagem" className="field-label">Foco</label>
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

        <button
          type="submit"
          className="btn-action"
          disabled={carregando}
          style={{ marginTop: '0.35rem' }}
        >
          {carregando ? 'Processando rota e relevo…' : 'Calcular Rota e Roteiro'}
        </button>
      </form>
    </div>
  );
}
