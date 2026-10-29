import { describe, it, expect } from 'vitest';
import { calcularDistanciaHaversine, filtrarDestinosPorRaio } from './geolocation';

describe('Geolocalização Haversine', () => {
  it('calcula corretamente a distância geodésica entre Teresina e Parnaíba (~270 a 300 km)', () => {
    // Teresina: -5.0892, -42.8016
    // Parnaíba: -2.9038, -41.7766
    const dist = calcularDistanciaHaversine(-5.0892, -42.8016, -2.9038, -41.7766);
    expect(dist).toBeGreaterThan(250);
    expect(dist).toBeLessThan(350);
  });

  it('identifica corretamente viagens que superam 400 km de raio', () => {
    // Teresina para Fortaleza (~500 km)
    const dist = calcularDistanciaHaversine(-5.0892, -42.8016, -3.7172, -38.5433);
    expect(dist).toBeGreaterThan(400);
  });

  it('filtra e ordena os destinos curados mais próximos', () => {
    const destinos = [
      { cidade: 'Parnaíba', lat: -2.9038, lon: -41.7766 },
      { cidade: 'Fortaleza', lat: -3.7172, lon: -38.5433 },
      { cidade: 'Pedro II', lat: -4.4258, lon: -41.4586 },
    ];
    // A partir de Teresina (-5.0892, -42.8016) Pedro II (~170km) é mais próximo que Fortaleza (~500km)
    const proximos = filtrarDestinosPorRaio(-5.0892, -42.8016, destinos, 4);
    expect(proximos[0].cidade).toBe('Pedro II');
  });
});
