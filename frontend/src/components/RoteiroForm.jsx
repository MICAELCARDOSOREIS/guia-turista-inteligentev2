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
  const [preferenciaRota, setPreferenciaRota] = useState('tempo');
  
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

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>🚗 Planejar Viagem</h2>
        <button
          type="button"
          onClick={handleDetectarGps}
          className="btn-outline"
          disabled={buscandoGps}
          title="Buscar destinos mais próximos com base na fórmula de Haversine"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
        >
          {buscandoGps ? 'GPS Ativo...' : '📍 GPS Proximidade'}
        </button>
      </div>

      {/* Sugestões Haversine */}
      {destinosProximos.length > 0 && (
        <div style={{ marginBottom: '1.25rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Destinos por Raio Geodésico (Haversine):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
            {destinosProximos.map((d) => (
              <button
                key={d.cidade}
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={() => handleSelecionarDestinoSugerido(d)}
              >
                {d.cidade} ({d.distancia_km} km) {d.requer_paradas ? '⚠️ >400km' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Origem e Destino */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '0.5rem' }}>
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
              className="form-input"
              value={origemUf}
              onChange={(e) => setOrigemUf(e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '0.5rem' }}>
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="destinoUf" className="form-label">UF de Destino</label>
            <input
              id="destinoUf"
              type="text"
              maxLength={2}
              className="form-input"
              value={destinoUf}
              onChange={(e) => setDestinoUf(e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        {/* Tipo de Motor / Propulsão */}
        <div className="form-group">
          <label className="form-label">Tipo de Propulsão</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-outline"
              style={{
                borderColor: tipoPropulsao === 'combustao' ? 'var(--accent-primary)' : 'var(--border-color)',
                background: tipoPropulsao === 'combustao' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                fontWeight: tipoPropulsao === 'combustao' ? '700' : '400',
              }}
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
              className="btn-outline"
              style={{
                borderColor: tipoPropulsao === 'ev' ? 'var(--accent-secondary)' : 'var(--border-color)',
                background: tipoPropulsao === 'ev' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                fontWeight: tipoPropulsao === 'ev' ? '700' : '400',
              }}
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

        {/* Parâmetros do Veículo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
              className="form-input"
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
              className="form-input"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div className="form-group">
            <label htmlFor="diasEstadia" className="form-label">Duração (Dias)</label>
            <select
              id="diasEstadia"
              className="form-select"
              value={diasEstadia}
              onChange={(e) => setDiasEstadia(e.target.value)}
            >
              <option value="1">1 Dia (Bate-Volta)</option>
              <option value="2">2 Dias (Fim de Semana)</option>
              <option value="3">3 Dias (Feriado)</option>
              <option value="4">4 Dias (Extenso)</option>
              <option value="5">5 Dias (Semana)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="estiloViagem" className="form-label">Perfil do Viajante</label>
            <select
              id="estiloViagem"
              className="form-select"
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

        {/* Botão com bloqueio idempotente */}
        <button
          type="submit"
          className="btn-primary"
          disabled={carregando}
          style={{ marginTop: '0.75rem' }}
        >
          {carregando ? '⏳ Processando Rota & IA...' : '🚀 Planejar Roteiro Inteligente'}
        </button>
      </form>
    </div>
  );
}
