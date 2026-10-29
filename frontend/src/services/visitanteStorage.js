/**
 * Gerenciador de armazenamento local para suporte a sessão híbrida não destrutiva.
 */

const CHAVE_VISITANTE = 'guia_turista_visitante_session';
const CHAVE_GOOGLE_SALVO = 'guia_turista_saved_google_user';
const CHAVE_HISTORICO_LOCAL = 'guia_turista_viagens_cache';

export const visitanteStorage = {
  salvarSessaoVisitante(usuario) {
    try {
      localStorage.setItem(CHAVE_VISITANTE, JSON.stringify(usuario));
    } catch (_) {}
  },

  obterSessaoVisitante() {
    try {
      const data = localStorage.getItem(CHAVE_VISITANTE);
      return data ? JSON.parse(data) : null;
    } catch (_) {
      return null;
    }
  },

  limparSessaoVisitante() {
    try {
      localStorage.removeItem(CHAVE_VISITANTE);
    } catch (_) {}
  },

  salvarUsuarioGoogle(usuario) {
    try {
      localStorage.setItem(CHAVE_GOOGLE_SALVO, JSON.stringify(usuario));
    } catch (_) {}
  },

  obterUsuarioGoogleSalvo() {
    try {
      const data = localStorage.getItem(CHAVE_GOOGLE_SALVO);
      return data ? JSON.parse(data) : null;
    } catch (_) {
      return null;
    }
  },

  limparUsuarioGoogleSalvo() {
    try {
      localStorage.removeItem(CHAVE_GOOGLE_SALVO);
    } catch (_) {}
  },
};
