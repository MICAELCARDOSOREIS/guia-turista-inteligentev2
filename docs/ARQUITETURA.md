# Arquitetura de Microsserviços — Guia do Turista Inteligente v2

Este documento descreve a topologia, os fluxos assíncronos e os padrões de projeto adotados no desacoplamento da solução.

```
┌────────────────────────────────────────────────────────┐
│      PROJETO 2: Front-End SPA (React 19 + Vite)        │
│                    Porta :5173                         │
│                                                        │
│  • App.jsx (Orquestrador Reativo)                      │
│  • MapaRota.jsx (Leaflet & Altimetria)                 │
│  • geolocation.js (Fórmula de Haversine >400 km)       │
│  • api.js (Fetch REST & Leitor de Streaming SSE)       │
└───────────────────────────┬────────────────────────────┘
                            │
               Barramento HTTP / REST / SSE
               Headers: X-User-Id, X-Process-Time
                            │
┌───────────────────────────▼────────────────────────────┐
│          PROJETO 1: Backend ASGI (FastAPI)             │
│                    Porta :8001                         │
│                                                        │
│  • main.py (Lifespan, CORSMiddleware, Metrics)         │
│  • routers/roteiros.py (Duplo asyncio.gather)          │
│  • core/dependencies.py (httpx.AsyncClient Pool)       │
│  • core/circuit_breaker.py (CLOSED / OPEN / HALF_OPEN) │
│  • schemas/ (Pydantic v2 estrito com @field_validator) │
│  • services/ (Clima, Rota, Altimetria, Postos, Gemini) │
└─────────────┬─────────────┬─────────────┬──────────────┘
              │             │             │
        Open-Meteo API   OSRM API   Open-Elevation API
          (Clima)        (Rotas)     (Topografia)
```

## 1. Concorrência com Duplo `asyncio.gather()`

No endpoint `POST /api/v1/roteiros/planejar`:
1. **Estágio 1:** Geocodifica simultaneamente origem e destino:
   ```python
   (lat_o, lon_o, nome_o), (lat_d, lon_d, nome_d) = await asyncio.gather(
       buscar_coordenadas_async(client, payload.origem_cidade, payload.origem_uf),
       buscar_coordenadas_async(client, payload.destino_cidade, payload.destino_uf),
   )
   ```
2. **Estágio 2:** Dispara simultaneamente a previsão meteorológica na Open-Meteo e o traçado rodoviário no OSRM:
   ```python
   dados_clima, dados_percurso = await asyncio.gather(
       obter_clima_async(client, lat_d, lon_d),
       calcular_rota_osrm_async(client, lat_o, lon_o, lat_d, lon_d),
   )
   ```

## 2. Server-Sent Events (SSE)

O endpoint `/api/v1/roteiros/stream-guia` utiliza `StreamingResponse` para transmitir fragmentos contínuos de texto com delimitador `data: {"chunk": "...", "done": false}\n\n`. O cliente em React consome via `ReadableStream` (`response.body.getReader()`), proporcionando latência percebida inferior a 300 ms.

## 3. Disjuntores de Circuito (Circuit Breakers)

Para blindar o servidor contra instabilidades de provedores externos, todas as chamadas críticas são protegidas pelo `CircuitBreaker`. Se um serviço falhar 3 vezes consecutivas, o disjuntor abre e aciona imediatamente o fallback em memória, mantendo a API operante.
