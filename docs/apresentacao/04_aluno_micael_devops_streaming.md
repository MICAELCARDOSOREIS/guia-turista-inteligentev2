# Roteiro de Apresentação — Aluno 4: Micael Cardoso Reis
**Matrícula:** 2025116TADS0041  
**Papel:** DevOps, QA & Streaming Lead  
**Tempo estimado:** 5 a 7 minutos  
**Repositório / Código sob sua responsabilidade:**
- Endpoint `/api/v1/roteiros/stream-guia` (Server-Sent Events)
- `backend/app/services/gemini_service.py`
- `backend/app/services/gpx_service.py`
- `backend/app/services/storage_service.py`
- `backend/tests/test_roteiros.py` e suíte de testes do pytest
- `frontend/*.test.jsx` e suíte de testes do Vitest

---

## 🎯 O que você deve falar e demonstrar para garantir a nota 10:

### 1. Streaming em Tempo Real com Server-Sent Events (SSE)
- **O que falar:** "Professor Maykol, eu sou o Micael Cardoso Reis (Matrícula 2025116TADS0041) e fiquei responsável pela engenharia de streaming com IA, geração de arquivos GPX 1.1, persistência atômica thread-safe, governança de concorrência e liderança de testes e qualidade (QA & DevOps). No endpoint `/stream-guia`, utilizamos o padrão **Server-Sent Events** (`StreamingResponse` com `text/event-stream`). Em vez de fazer o cliente esperar passivamente 4 ou 5 segundos até o Gemini concluir a geração inteira do texto, transmitimos fragmentos (`chunks`) de texto sob demanda. O primeiro caractere aparece na tela em menos de 300 ms!"
- **O que mostrar no código e tela:** Abra `backend/app/routers/roteiros.py` na linha do `stream_guia_ia()` e `backend/app/services/gemini_service.py` mostrando o gerador assíncrono `gerar_guia_ia_stream_async` e o `yield f"data: {payload_sse}\n\n"`. Na SPA, mostre o banner pulsante *'📡 Streaming SSE Ativo...'* e o texto sendo redigido progressivamente.

### 2. Exportação de Arquivos XML GPX 1.1 Padronizados e Persistência Atômica
- **O que falar:** "Em `app/services/gpx_service.py`, geramos o documento XML padronizado GPX 1.1 com conformidade estrita de esquema (`xmlns="http://www.topografix.com/GPX/1/1"`). Ele incorpora waypoints de partida e chegada, trilha contínua (`<trk>`) e dados altimétricos (`<ele>`), permitindo que o usuário baixe o arquivo e importe diretamente em qualquer dispositivo GPS físico, Garmin ou aplicativo como Strava. Além disso, em `app/services/storage_service.py`, garantimos persistência atômica thread-safe em JSON usando `threading.Lock()` e escrita via arquivo temporário (`.tmp` + `replace`), isolando os roteiros por usuário sem risco de corrupção."
- **O que mostrar na interface:** Clique no botão **📥 Baixar GPX 1.1**, abra o arquivo baixado no VS Code e mostre a estrutura XML válida.

### 3. Bloqueio de Concorrência e Idempotência (HTTP 409 Conflict)
- **O que falar:** "Para proteger a infraestrutura contra usuários que clicam repetidamente no botão de submissão por impaciência, implementamos um lock concorrente em memória com `asyncio.Lock()` e uma chave de requisição baseada no usuário e trajeto. Se uma segunda requisição idêntica chegar enquanto a primeira ainda está em voo, a segunda é rejeitada na hora com **HTTP 409 Conflict**."
- **O que mostrar no código:** Abra `app/routers/roteiros.py` e aponte para `lock_requisicoes` e `REQUISICOES_ATIVAS`.

### 4. Telemetria Prometheus (`/metrics`) e 100% de Aprovação nos Testes
- **O que falar:** "Na parte de observabilidade e DevOps, criamos o endpoint `/metrics` formatado para scrape de sistemas de monitoramento como Prometheus e Grafana, expondo contadores de roteiros, latência média e uptime. E para garantir a robustez de toda a solução, construímos uma suíte completa de testes automatizados com **100% de aprovação no pytest (21 testes) e no Vitest (6 testes)**."
- **O que mostrar no terminal:** Rode ao vivo no terminal os dois comandos:
  ```bash
  # Testes do Backend (21 aprovados):
  cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -v
  
  # Testes do Frontend (6 aprovados):
  cd ../frontend && npm test
  ```
  Mostre todas as linhas verdes passando!

---

## 💡 Respostas rápidas para perguntas do professor:
- **P: Qual a vantagem de SSE sobre WebSockets para este caso de uso?**  
  *R:* "O SSE opera sobre o protocolo HTTP padrão unidirecional (servidor -> cliente) com reconexão automática nativa do navegador e sem o overhead de gerenciar handshakes bidirecionais de WebSockets, sendo a escolha arquitetural ideal e mais leve para fluxos de LLM."
- **P: Como garantir que o lock HTTP 409 não trave a aplicação inteira?**  
  *R:* "O `asyncio.Lock` protege apenas a leitura e escrita do conjunto `REQUISICOES_ATIVAS` por frações de microssegundo. O processamento assíncrono do pipeline roda fora do lock, e a chave é obrigatoriamente descartada no bloco `finally`."
- **P: Como o `storage_service.py` evita corrupção de dados no arquivo JSON?**  
  *R:* "Combinamos `threading.Lock()` para serializar o acesso entre threads com escrita atômica via arquivo temporário (`caminho.with_suffix('.tmp')` seguido de `.replace(caminho)`), garantindo que o arquivo `viagens.json` nunca fique parcialmente escrito."
