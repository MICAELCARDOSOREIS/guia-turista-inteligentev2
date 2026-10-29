# Roteiro de Apresentação — Aluno 2: Roger Pierre Reis Silva (Matrícula: 2025116TADS0010)
**Papel:** Backend Core Engineer  
**Tempo estimado:** 5 a 7 minutos  
**Repositório / Código sob sua responsabilidade:**
- `backend/app/main.py`
- `backend/app/routers/roteiros.py` (endpoint `/planejar`)
- `backend/app/routers/auth.py` e `backend/app/routers/telemetria.py`
- `backend/app/core/dependencies.py`, `backend/app/core/config.py`, `backend/app/core/circuit_breaker.py`
- `backend/app/services/clima_service.py` e `backend/app/services/rota_service.py`

---

## 🎯 O que você deve falar e demonstrar para garantir a nota 10:

### 1. Arquitetura ASGI, Concorrência Paralela e SLA < 1.000 ms
- **O que falar:** "Professor Maykol, eu sou o Roger Pierre Reis Silva (matrícula 2025116TADS0010) e fiquei responsável pela engenharia de núcleo do backend FastAPI. No monólito Flask anterior (WSGI síncrono), cada chamada externa consecutiva retinha a thread do servidor, totalizando mais de 4.000 ms de latência. Aqui no FastAPI com ASGI e Uvicorn, nós dividimos o pipeline do endpoint `/planejar` em estágios concorrentes usando `asyncio.gather()`. O resultado é que entregamos o roteiro completo em **menos de 800 ms**."
- **O que mostrar no código:** Abra `backend/app/routers/roteiros.py` e mostre as linhas do `asyncio.gather()` duplo:
  1. *Estágio 1:* `buscar_coordenadas_async` de Origem e Destino disparados simultaneamente.
  2. *Estágio 2:* `obter_clima_async` (Open-Meteo) e `calcular_rota_osrm_async` (OSRM) executados em paralelo.
- **O que mostrar na tela/Swagger:** Abra `http://localhost:8001/docs`, dispare `/api/v1/roteiros/planejar` e aponte para o cabeçalho de resposta: `X-Process-Time: 780ms`!

### 2. Lifespan Context e Pool de Conexões HTTP Compartilhado
- **O que falar:** "Em `app/main.py`, implementamos o gerenciador assíncrono `lifespan`. Em vez de abrir e fechar conexões TCP/TLS a cada request (o que destruiria o desempenho), inicializamos um pool de conexões persistente com `httpx.AsyncClient` em `app.state.http_client` com limites configurados (`Limits(max_keepalive_connections=50)`). Em `app/core/dependencies.py`, esse cliente é injetado via `Depends(obter_http_client)` com zero overhead de handshake."
- **O que mostrar no código:** Abra `backend/app/main.py` e mostre a função `@asynccontextmanager async def lifespan(app: FastAPI):`.

### 3. Cancelamento Ativo (`request.is_disconnected()`) e Idempotência
- **O que falar:** "Se um usuário clicar em outro destino ou fechar a aba enquanto a requisição está sendo processada, nós não desperdiçamos ciclos nem custos de API: checamos ativamente `if await request.is_disconnected(): raise HTTPException(status_code=499)`. O pipeline é abortado imediatamente e a escrita da viagem em disco é cancelada. Além disso, usamos um lock assíncrono sobre `REQUISICOES_ATIVAS` para retornar `409 Conflict` em cliques duplos simultâneos."
- **O que mostrar no código:** Aponte para as verificações de `is_disconnected()` e `REQUISICOES_ATIVAS` em `app/routers/roteiros.py`.

### 4. Circuit Breakers e Proteção contra Indisponibilidade Externa
- **O que falar:** "Em `app/core/circuit_breaker.py`, construímos o disjuntor de circuito com os três estados: `CLOSED`, `OPEN` e `HALF_OPEN`. Se um provedor externo como Open-Meteo ou OSRM falhar repetidamente (3 falhas consecutivas), o disjuntor abre, impedindo requisições de ficarem presas em timeout e acionando o fallback degradado em tempo zero."
- **O que mostrar no código:** Abra `app/core/circuit_breaker.py` e mostre a lógica de transição de estado e o método `executar()`.

---

## 💡 Respostas rápidas para perguntas do professor:
- **P: Qual a diferença entre WSGI e ASGI no contexto desta atividade?**  
  *R:* "O WSGI do Flask é bloqueante e síncrono: uma requisição I/O trava a thread do sistema operacional. O ASGI do FastAPI opera sobre o Event Loop do Python: enquanto aguardamos a resposta de rede do Open-Meteo ou OSRM, o event loop fica livre para atender dezenas de outros usuários concorrentes."
- **P: Por que usar BackgroundTasks para salvar a viagem em disco?**  
  *R:* "A persistência atômica em arquivo JSON envolve I/O de disco. Ao delegar para `background_tasks.add_task(salvar_nova_viagem)`, liberamos a resposta JSON imediatamente para o usuário, economizando de 15 a 30 ms no tempo percebido."
