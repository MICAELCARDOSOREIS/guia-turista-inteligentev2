# Roteiro de Apresentação — Aluno 1: Maria Clara Almeida Martins (2025116TADS0012)
**Papel:** Frontend Developer  
**Tempo estimado:** 5 a 7 minutos  
**Repositório / Código sob sua responsabilidade:**
- `frontend/src/services/api.js`
- `frontend/src/services/geolocation.js`
- `frontend/src/types/schemas.js`
- `frontend/src/components/MapaRota.jsx`
- `frontend/src/App.jsx`
- `frontend/src/index.css`

---

## 🎯 O que você deve falar e demonstrar para garantir a nota 10:

### 1. Abertura e Visão da SPA React 19 (`:5173`)
- **O que falar:** "Professor Maykol, eu sou a Maria Clara Almeida Martins (matrícula 2025116TADS0012) e fiquei responsável pela engenharia de front-end do Guia do Turista Inteligente. A nossa interface foi construída em **React 19 com Vite**, adotando um **Design System Semântico** baseado nos tokens do Material Design 3 e conformidade rigorosa com acessibilidade **WCAG 2.1 AA**."
- **O que mostrar na tela:** Abra o navegador em `http://localhost:5173`. Mostre o layout limpo e responsivo. Clique no botão de alternar tema (☀️ Claro / 🌙 Escuro) no cabeçalho e mostre como o atributo `data-theme` altera dinamicamente as variáveis CSS em `src/index.css` sem piscar a tela.

### 2. Geolocalização com Cálculo Geodésico de Haversine (>400 km)
- **O que falar:** "Em `src/services/geolocation.js`, implementamos a fórmula matemática de Haversine para calcular distâncias esféricas a partir do raio terrestre de 6.371 km. No formulário, temos o botão **📍 GPS Proximidade** que extrai as coordenadas reais do navegador e filtra os 4 destinos turísticos mais viáveis. Quando o trajeto supera 400 km de raio, a aplicação alerta automaticamente a necessidade de paradas para descanso e recarga."
- **O que mostrar no código:** Abra `frontend/src/services/geolocation.js` e aponte para a função `calcularDistanciaHaversine` e `filtrarDestinosPorRaio`. Na interface, clique no botão e mostre as sugestões aparecendo com badges de quilometragem.

### 3. Mapa Leaflet, Traçado OSRM e Paradas Estratégicas
- **O que falar:** "Em `src/components/MapaRota.jsx`, consumimos a geometria GeoJSON retornada pelo backend e renderizamos o traçado da rodovia no Leaflet. O mapa não é estático: ele posiciona marcadores dinâmicos de postos de combustível ou eletropostos calculados pela autonomia do veículo, além de permitir alternar em tempo real entre a **Sugestão 01 (Rodovia Principal)** e a **Sugestão 02 (Mais Econômica)**."
- **O que mostrar na tela:** No mapa, dê zoom no trajeto, passe o mouse sobre os marcadores de postos (ícones ⛽ e ⚡) e mostre o popup com o tempo estimado de parada e margem de reserva de ~18%.

### 4. Sessão Híbrida Não-Destrutiva (Google Sign-In + Visitante)
- **O que falar:** "Um grande diferencial exigido na especificação é a sessão híbrida: se o usuário estiver logado com Google corporativo e quiser testar a aplicação como visitante, a conta Google não é perdida. Ela fica salva com segurança em `guia_turista_saved_google_user` no `localStorage`. Um botão 'Voltar para Micael' surge imediatamente no topo, permitindo restaurar a conta em 1 clique sem exigir nova autenticação."
- **O que mostrar na tela:** Clique em 'Usar como Visitante', mostre o temporizador regressivo de 2 horas (ex: `01:59:58`) e em seguida clique no botão de restauração.

---

## 💡 Respostas rápidas para perguntas do professor:
- **P: Por que usar Haversine no cliente se o backend tem OSRM?**  
  *R:* "O Haversine roda no cliente em menos de 1 milissegundo antes de enviar o formulário, permitindo que a interface ofereça sugestões instantâneas ao usuário sem onerar o servidor com chamadas desnecessárias."
- **P: O que acontece se o cliente perder conexão durante a navegação?**  
  *R:* "O hook `useNetworkStatus.js` captura os eventos `online` e `offline` do navegador, exibindo uma barra de contingência no topo sem quebrar a árvore de renderização do React."
