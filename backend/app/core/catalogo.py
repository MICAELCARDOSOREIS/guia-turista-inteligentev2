"""Catálogo de dados curados, destinos, gastronomia, praças de pedágio e redes de postos."""

ESTADOS_BRASIL = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
}

ESTADOS_NOMES = {
    "acre": "AC", "alagoas": "AL", "amapá": "AP", "amapa": "AP",
    "amazonas": "AM", "bahia": "BA", "ceará": "CE", "ceara": "CE",
    "distrito federal": "DF", "espírito santo": "ES", "espirito santo": "ES",
    "goiás": "GO", "goias": "GO", "maranhão": "MA", "maranhao": "MA",
    "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG",
    "pará": "PA", "para": "PA", "paraíba": "PB", "paraiba": "PB",
    "paraná": "PR", "parana": "PR", "pernambuco": "PE", "piauí": "PI",
    "piaui": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
    "rio grande do sul": "RS", "rondônia": "RO", "rondonia": "RO",
    "roraima": "RR", "santa catarina": "SC", "são paulo": "SP",
    "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO"
}

DESTINOS_CATALOGO = [
    {
        "cidade": "Parnaíba",
        "uf": "PI",
        "lat": -2.9038,
        "lon": -41.7766,
        "atrativos": ["Delta do Parnaíba", "Porto das Barcas", "Praia da Pedra do Sal", "Lagoa do Portinho"],
        "gastronomia": ["Torta de Caranguejo", "Peixada Piauiense", "Casquinha de Siri", "Cajuína Gelada"],
        "descricao": "Portal de entrada para o único delta em mar aberto das Américas, rica em história colonial e ventos para kitesurf."
    },
    {
        "cidade": "Luís Correia",
        "uf": "PI",
        "lat": -2.8794,
        "lon": -41.6669,
        "atrativos": ["Praia de Atalaia", "Praia do Coqueiro", "Árvore Penteada", "Praia de Macapá"],
        "gastronomia": ["Camarão ao Alho e Óleo", "Moqueca de Robalo", "Caranguejo ao Molho", "Sorvete de Bacuri"],
        "descricao": "Litoral piauiense com praias de areia branca, gastronomia marinha fresca e esportes náuticos."
    },
    {
        "cidade": "Pedro II",
        "uf": "PI",
        "lat": -4.4258,
        "lon": -41.4586,
        "atrativos": ["Minas de Opala Preciosa", "Mirante do Gritador", "Cachoeira do Salto Liso", "Centro Histórico"],
        "gastronomia": ["Galinha Caipira com Pirão", "Doce de Buriti", "Maria Isabel com Paçoca", "Café Colonial da Serra"],
        "descricao": "Suíça Piauiense, famosa pelo clima ameno serrano, jazidas de opala única e festival de inverno."
    },
    {
        "cidade": "Sete Cidades (Piracuruca)",
        "uf": "PI",
        "lat": -4.0988,
        "lon": -41.7069,
        "atrativos": ["Parque Nacional de Sete Cidades", "Pinturas Rupestres", "Pedra dos Canhões", "Piscina do Milagre"],
        "gastronomia": ["Carne de Sol de Piripiri", "Arroz de Capote", "Beiju de Tapioca"],
        "descricao": "Monumento geológico milenar com formações rochosas esculpidas pela natureza e arte rupestre ancestral."
    },
    {
        "cidade": "Jericoacoara",
        "uf": "CE",
        "lat": -2.7958,
        "lon": -40.5142,
        "atrativos": ["Duna do Pôr do Sol", "Pedra Furada", "Lagoa do Paraíso", "Praia da Malhada"],
        "gastronomia": ["Peixe na Telha", "Bobó de Camarão", "Cocada Quente", "Caipifruta de Caju"],
        "descricao": "Vila paradisíaca entre dunas móveis e lagoas cristalinas, santuário ecológico do Ceará."
    },
    {
        "cidade": "Fortaleza",
        "uf": "CE",
        "lat": -3.7172,
        "lon": -38.5433,
        "atrativos": ["Praia de Iracema", "Mercado Central", "Dragão do Mar", "Praia do Futuro"],
        "gastronomia": ["Caranguejada da Quinta", "Baião de Dois com Queijo Coalho", "Moqueca Cearense"],
        "descricao": "Metrópole vibrante nordestina com rica vida cultural, orla renovada e gastronomia de frutos do mar."
    },
    {
        "cidade": "Teresina",
        "uf": "PI",
        "lat": -5.0892,
        "lon": -42.8016,
        "atrativos": ["Encontro dos Rios Parnaíba e Poti", "Ponte Estaiada", "Central de Artesanato", "Parque Potycabana"],
        "gastronomia": ["Capote Piauiense", "Panelada Tradicional", "Carne de Sol com Macaxeira", "Cajuína"],
        "descricao": "A Cidade Verde, capital acolhedora e polo gastronômico e de saúde entre os rios Parnaíba e Poti."
    }
]

REDES_POSTOS_COMBUSTAO = ["Posto Ipiranga", "Posto Shell", "Posto Petrobras BR", "Posto Ale"]
REDES_POSTOS_EV = ["Eletroposto Shell Recharge", "Eletroposto Raízen Power", "Eletroposto Volvo", "Eletroposto EDP Smart"]

TARIFAS_PEDAGIO_UF = {
    "SP": 0.16,
    "RJ": 0.14,
    "MG": 0.11,
    "PR": 0.13,
    "SC": 0.09,
    "RS": 0.10,
    "BA": 0.08,
    "CE": 0.05,
    "PI": 0.00,
    "MA": 0.00,
}
