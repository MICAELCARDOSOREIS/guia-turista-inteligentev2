/**
 * Validação defensiva e higienização de esquemas no Front-End (Espelho dos contratos Pydantic v2).
 */

export const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const TIPOS_PROPULSAO_VALIDOS = ['combustao', 'ev'];

/**
 * Higieniza nome de município removendo espaços excedentes e caracteres de controle.
 */
export function sanitizarCidade(valor) {
  if (!valor || typeof valor !== 'string') return '';
  return valor
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Higieniza e normaliza sigla de Unidade Federativa (UF).
 */
export function sanitizarUf(valor) {
  if (!valor || typeof valor !== 'string') return '';
  return valor
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Verifica se a sigla UF pertence às 27 Unidades Federativas do Brasil.
 */
export function validarUf(uf) {
  const limpa = sanitizarUf(uf);
  return UFS_VALIDAS.includes(limpa);
}

/**
 * Valida parâmetros completos do formulário de planejamento de roteiro.
 */
export function validarParametrosViagem(payload) {
  const erros = [];

  const origemCidade = sanitizarCidade(payload?.origem_cidade);
  const destinoCidade = sanitizarCidade(payload?.destino_cidade);
  const origemUf = sanitizarUf(payload?.origem_uf);
  const destinoUf = sanitizarUf(payload?.destino_uf);

  if (origemCidade.length < 2) {
    erros.push('Município de origem deve ter ao menos 2 caracteres.');
  }
  if (destinoCidade.length < 2) {
    erros.push('Município de destino deve ter ao menos 2 caracteres.');
  }
  if (!validarUf(origemUf)) {
    erros.push(`UF de origem inválida: "${origemUf}".`);
  }
  if (!validarUf(destinoUf)) {
    erros.push(`UF de destino inválida: "${destinoUf}".`);
  }
  if (!TIPOS_PROPULSAO_VALIDOS.includes(payload?.tipo_propulsao)) {
    erros.push('Tipo de propulsão deve ser "combustao" ou "ev".');
  }

  return {
    valido: erros.length === 0,
    erros,
    dadosSanitizados: {
      ...payload,
      origem_cidade: origemCidade,
      origem_uf: origemUf,
      destino_cidade: destinoCidade,
      destino_uf: destinoUf,
    },
  };
}
