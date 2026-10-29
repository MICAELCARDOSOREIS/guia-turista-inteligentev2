# 🇧🇷 Guia do Turista Inteligente — Unidades I & II
### De Monólito Flask SSR (Unidade I) a Microsserviço FastAPI ASGI + SPA React 19 (Unidade II)

Projeto prático desenvolvido para a disciplina de **Automação Web em Python** (**Prof. Maykol Sampaio**), contemplando:
- **Unidade I (Atividade 1):** Aplicação web com **Flask**, sessões, lock de concorrência em JSON, integração HTTPX com Open-Meteo / OSRM, Google Auth e Gemini AI.
- **Unidade II (Atividade 2):** Refatoração arquitetural completa para **Microsserviço FastAPI ASGI (`:8001`)** desacoplado de uma **Single Page Application (SPA) em React 19 + Vite (`:5173`)**, com orquestração concorrente (`asyncio.gather`), streaming Server-Sent Events (SSE), cálculo altimétrico (Open-Elevation), exportação GPX 1.1 e telemetria Prometheus.

---

## 👥 Equipe e Divisão das Atividades

### Unidade II — Atividade 2 (Microsserviço FastAPI ASGI + React 19)

| Papel | Integrante | Matrícula | Módulos e Responsabilidades Principais | Guia de Apresentação |
| --- | --- | --- | --- | --- |
| **Aluno 1 — Frontend Developer** | Maria Clara Almeida Martins | `2025116TADS0012` | SPA React 19 (`frontend/src/`), Mapa Interativo Leaflet (`RouteMap`), Geolocation com filtro Haversine (> 400 km), Sessão Híbrida Não-Destrutiva (Google OAuth + Visitante 2h TTL), Rateio e Design System M3. | [`01_aluno_maria_clara_frontend.md`](docs/apresentacao/01_aluno_maria_clara_frontend.md) |
| **Aluno 2 — Backend Core Engineer** | Roger Pierre Reis Silva | `2025116TADS0010` | `backend/app/main.py`, router `/planejar`, orquestração concorrente com duplo `asyncio.gather()`, Lifespan Pool `httpx.AsyncClient`, Circuit Breakers (`pybreaker`), `clima_service.py` e `rota_service.py`. | [`02_aluno_roger_pierre_backend_core.md`](docs/apresentacao/02_aluno_roger_pierre_backend_core.md) |
| **Aluno 3 — Data & Altimetry Engineer** | Antonio Carlos Gomes | `2025116TADS0024` | Contratos Pydantic v2 (`schemas/roteiros.py`, `schemas/auth.py`) com `@field_validator`, `altimetria_service.py` (Open-Elevation e penalização de consumo), `postos_service.py` (paradas com margem de ~18%) e `custos_service.py` (rateio de combustível/energia e pedágios). | [`03_aluno_antonio_carlos_data_altimetria.md`](docs/apresentacao/03_aluno_antonio_carlos_data_altimetria.md) |
| **Aluno 4 — DevOps, QA & Streaming Lead** | Micael Cardoso Reis | `2025116TADS0041` | Streaming SSE em tempo real (`gemini_service.py`), geração XML GPX 1.1 (`gpx_service.py`), persistência assíncrona atômica com HTTP 409 (`storage_service.py`), observabilidade (`/healthz`, `/readyz`, `/metrics`) e suíte de 21 testes (`backend/tests/`). | [`04_aluno_micael_devops_streaming.md`](docs/apresentacao/04_aluno_micael_devops_streaming.md) |

---

### Unidade I — Atividade 1 (Flask + HTTPX + Google Auth + Gemini AI)

| Papel | Integrante | Matrícula | Responsabilidades Concluídas | Divisão Detalhada |
| --- | --- | --- | --- | --- |
| **Aluno 1 — APIs REST e Autenticação** | Maria Clara Almeida Martins | `2025116TADS0012` | Em `services.py`: validação do token Google OAuth (`validar_token_google`) e geocodificação Open-Meteo com filtro restrito ao Brasil e identificação da UF (`buscar_coordenadas`). | [`maria-clara-almeida-martins.md`](divisoes/maria-clara-almeida-martins.md) |
| **Aluno 2 — Telemetria e IA** | Roger Pierre Reis Silva | `2025116TADS0010` | Em `services.py`: clima Open-Meteo (`obter_clima`) e rotas OSRM (`obter_percurso`). Em `planejamento.py`: guia turístico Gemini (`gerar_guia_ia`) e contingência (`gerar_contingencia_local`). | [`roger-pierre-reis-silva.md`](divisoes/roger-pierre-reis-silva.md) |
| **Aluno 3 — Backend e Sessões** | Antonio Carlos Gomes | `2025116TADS0024` | Em `app.py`: rotas Flask, sessões, criação e exclusão de viagens, padrão Post/Redirect/Get (PRG) e controle de requisições duplicadas (`planejamento_em_andamento`). | [`antonio-carlos-gomes.md`](divisoes/antonio-carlos-gomes.md) |
| **Aluno 4 — JSON e Resiliência** | Micael Cardoso Reis | `2025116TADS0041` | Em `app.py`: persistência JSON atômica com `threading.Lock()`, sanitização HTML (`markupsafe.escape`), endpoint `/api/viagens` e handlers 404/405. | [`micael-cardoso-reis.md`](divisoes/micael-cardoso-reis.md) |

---

## ⚡ Como Executar a Unidade II (FastAPI ASGI + React 19 SPA)

Abra dois terminais a partir da raiz do projeto:

### Terminal 1 — Backend FastAPI (`:8001`)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Iniciar o servidor ASGI com recarregamento automático na porta 8001:
uvicorn app.main:app --reload --port 8001
```
- **API REST Online:** `http://localhost:8001`
- **Documentação Swagger UI:** `http://localhost:8001/docs`
- **Documentação ReDoc:** `http://localhost:8001/redoc`
- **Probes de Saúde:** `http://localhost:8001/healthz` e `http://localhost:8001/readyz`
- **Métricas Prometheus:** `http://localhost:8001/metrics`

### Terminal 2 — Frontend SPA React 19 (`:5173`)
```bash
cd frontend
npm install
npm run dev
```
- **Aplicação Web SPA:** `http://localhost:5173`

### 🧪 Executando as Suítes de Testes Automatizados (Unidade II)
```bash
# 1. Testes do Backend FastAPI (21 testes):
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v

# 2. Testes do Frontend React 19 (6 testes):
cd ../frontend
npm test
```

---

## 🚀 Como Executar a Unidade I (Monólito Flask)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"
export GOOGLE_CLIENT_ID="776335673676-dk7od4ljhh43bio4bppf94i8ou0u9v9i.apps.googleusercontent.com"
export PORT="8001"

python app.py
```

---

## 📂 Estrutura Completa do Repositório

```text
├── backend/                        # [Unidade II] Microsserviço FastAPI ASGI (:8001)
│   ├── app/
│   │   ├── core/                   # Settings, Logging JSON, Limiter, Circuit Breakers, Metrics
│   │   ├── routers/                # Endpoints (/auth, /planejar, /stream-guia, /exportar-gpx, /healthz)
│   │   ├── schemas/                # Contratos Pydantic v2 com @field_validator
│   │   ├── services/               # Clima, Rota, Altimetria, Postos, Custos, Gemini SSE, GPX, Storage
│   │   └── main.py                 # Entrypoint ASGI e Lifespan Pool httpx.AsyncClient
│   ├── tests/                      # Suíte Pytest (21 testes assíncronos e unitários)
│   └── requirements.txt
├── frontend/                       # [Unidade II] Single Page Application React 19 + Vite (:5173)
│   ├── src/
│   │   ├── components/             # TopBar, HeroCard, TripForm, RouteMap, TelemetryGrid, StreamingGuideCard...
│   │   ├── hooks/                  # useAuth, useTripPlanner, useStreamingGuide, useGeolocation
│   │   ├── services/               # api.js, geolocation.js (Haversine >400 km), visitanteStorage.js
│   │   └── types/                  # schemas.js (validação Zod espelhada com Pydantic)
│   ├── package.json
│   └── vite.config.js
├── docs/                           # Documentação Arquitetural e Guias de Apresentação Individual
│   ├── ARQUITETURA.md
│   └── apresentacao/               # Roteiros de defesa individual (Alunos 1 a 4)
├── divisoes/                       # Documentação de divisão de tarefas da Unidade I
├── app.py                          # [Unidade I] Servidor Flask, sessões e persistência JSON
├── config.py                       # [Unidade I] Configurações e catálogo das UFs
├── services.py                     # [Unidade I] Integrações HTTPX síncronas (Open-Meteo, OSRM, Google)
├── planejamento.py                 # [Unidade I] Guia turístico com Gemini e contingência local
├── templates/index.html            # [Unidade I] Interface SSR Jinja2
├── static/                         # [Unidade I] CSS, JS e base JSON
└── README.md
```
