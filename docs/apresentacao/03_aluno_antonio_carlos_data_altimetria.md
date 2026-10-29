# Roteiro de Apresentação — Aluno 3: Antonio Carlos Gomes (Matrícula 2025116TADS0024)
**Papel:** Data & Altimetry Engineer  
**Tempo estimado:** 5 a 7 minutos  
**Repositório / Código sob sua responsabilidade:**
- `backend/app/schemas/auth.py`
- `backend/app/schemas/roteiros.py`
- `backend/app/services/altimetria_service.py`
- `backend/app/services/postos_service.py`
- `backend/app/services/custos_service.py`

---

## 🎯 O que você deve falar e demonstrar para garantir a nota 10:

### 1. Contratos Estritos e Validações Defensivas com Pydantic v2
- **O que falar:** "Professor Maykol, eu sou o Antonio Carlos Gomes (Matrícula 2025116TADS0024) e fiquei responsável pela camada de dados, validação de contratos e engenharia de altimetria e custos. Em `app/schemas/roteiros.py`, utilizamos o **Pydantic v2**, cuja validação de tipos é compilada diretamente em Rust (`pydantic-core`), eliminando código manual de sanitização. Implementamos o decorador `@field_validator` para validar e normalizar estados e cidades: siglas em minúsculas como `'pi'` são convertidas para `'PI'`, e qualquer sigla inexistente como `'XX'` é imediatamente rejeitada pelo servidor com status padronizado **HTTP 422 Unprocessable Entity**."
- **O que mostrar no Swagger ou terminal:** Abra o Swagger (`/docs`) e envie um payload com `origem_uf: "XX"`. Mostre a resposta retornando status 422 e a mensagem de erro: *"Sigla ou estado 'XX' é inválido no Brasil"*. Mostre em seguida o teste automatizado no terminal: `pytest tests/test_schemas.py -v`.

### 2. Integração com Open-Elevation e Análise Topográfica
- **O que falar:** "Em `app/services/altimetria_service.py`, extraímos as coordenadas do traçado rodoviário e consultamos a API da Open-Elevation para construir o perfil topográfico de relevo. O serviço calcula o ganho total de elevação (subidas), perda total (descidas), altitude máxima e o desnível líquido."
- **O que mostrar no código e tela:** Mostre a função `obter_perfil_altimetrico_async` e na SPA abra a sanfona **⛰️ Perfil Topográfico & Altimetria**, apontando para o gráfico de barras que ilustra o relevo da estrada.

### 3. Penalização Altimétrica no Consumo
- **O que falar:** "A física de uma viagem não é linear: subir serras exige mais esforço do motor. Criamos a função `calcular_penalizacao_altimetrica()`, que penaliza o consumo nominal em até 25% com base na razão de metros de aclive por quilômetro rodado. Esse percentual ajusta dinamicamente a autonomia do veículo e o gasto de combustível."
- **O que mostrar no código:** Aponte para `calcular_penalizacao_altimetrica` em `altimetria_service.py`.

### 4. Autonomia Nominal (Margem 18%) e Rateio de Custos por Passageiro
- **O que falar:** "Em `app/services/postos_service.py`, calculamos quando a bateria ou o tanque atingirá a reserva crítica (estabelecida com margem de segurança de ~18%). O algoritmo projeta as paradas nos pontos correspondentes a 82% da capacidade ao longo da rota. Além disso, em `custos_service.py`, computamos as despesas com energia/combustível e tarifas de pedágio regionais por UF, permitindo ao usuário simular a divisão de despesas em tempo real para até 8 passageiros."
- **O que mostrar na SPA:** No painel de despesas, mude o seletor de passageiros de 1 para 4 e mostre a cota individual se recalculando instantaneamente.

---

## 💡 Respostas rápidas para perguntas do professor:
- **P: Por que o Pydantic v2 é superior ao v1 nesta arquitetura?**  
  *R:* "O Pydantic v2 foi reescrito em Rust com a biblioteca `pydantic-core`. Ele é de 5 a 20 vezes mais rápido que o v1 em parsing e serialização JSON, o que é crucial para endpoints que lidam com centenas de coordenadas em tempo real."
- **P: Como foi calculada a tarifa de pedágio se o OSRM não fornece preços?**  
  *R:* "Mapeamos em `app/core/catalogo.py` as tarifas médias por quilômetro concessionado para cada estado brasileiro (ex: SP com R$ 0,16/km, CE com R$ 0,05/km, PI com R$ 0,00). O serviço interpola as UFs de origem e destino multiplicadas pela extensão do trecho."
