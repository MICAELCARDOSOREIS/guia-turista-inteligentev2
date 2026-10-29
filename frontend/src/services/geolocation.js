/**
 * Serviço de geolocalização e cálculo geodésico pela Fórmula de Haversine.
 */

const RAIO_TERRA_KM = 6371.0;

function toRad(graus) {
  return (graus * Math.PI) / 180.0;
}

/**
 * Calcula a distância ortodrômica em quilômetros entre dois pontos geográficos.
 */
export function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(RAIO_TERRA_KM * c * 10) / 10;
}

/**
 * Obtém a posição geográfica atual do dispositivo via navegador.
 */
export function obterLocalizacaoAtual() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          precisao_m: pos.coords.accuracy,
        });
      },
      (erro) => {
        // Fallback para Teresina - PI em caso de recusa de permissão
        resolve({
          lat: -5.0892,
          lon: -42.8016,
          precisao_m: 1000,
          fallback: true,
          mensagem: erro.message,
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

/**
 * Filtra e ordena destinos ordenados pela menor distância calculada por Haversine.
 */
export function filtrarDestinosPorRaio(latAtual, lonAtual, destinos, limite = 4) {
  if (!destinos || !destinos.length) return [];

  const comDistancias = destinos.map((dest) => {
    const distancia = calcularDistanciaHaversine(latAtual, lonAtual, dest.lat, dest.lon);
    return {
      ...dest,
      distancia_km: distancia,
      requer_paradas: distancia > 400,
    };
  });

  comDistancias.sort((a, b) => a.distancia_km - b.distancia_km);
  return comDistancias.slice(0, limite);
}
