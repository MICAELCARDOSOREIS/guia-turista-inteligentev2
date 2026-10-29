/**
 * Hook de autenticação e sessão híbrida (Google OAuth2 + Visitante temporário).
 */

import { useState, useEffect } from 'react';
import { visitanteStorage } from '../services/visitanteStorage';
import { API_BASE_URL } from '../config';

export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [googleSalvo, setGoogleSalvo] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1. Verifica se há usuário Google salvo anteriormente
    const salvo = visitanteStorage.obterUsuarioGoogleSalvo();
    if (salvo) setGoogleSalvo(salvo);

    // 2. Verifica se há sessão ativa (visitante ou google)
    const sessaoVisitante = visitanteStorage.obterSessaoVisitante();
    if (sessaoVisitante) {
      setUsuario(sessaoVisitante);
    } else if (salvo) {
      setUsuario(salvo);
    } else {
      // Inicia com visitante default
      setUsuario({
        user_id: 'guest_visitante',
        nome: 'Visitante',
        is_visitante: true,
      });
    }
    setCarregando(false);
  }, []);

  const loginGoogleSucesso = (perfilGoogle) => {
    visitanteStorage.salvarUsuarioGoogle(perfilGoogle);
    visitanteStorage.limparSessaoVisitante();
    setGoogleSalvo(perfilGoogle);
    setUsuario(perfilGoogle);
  };

  const mudarParaModoVisitante = async () => {
    if (usuario && !usuario.is_visitante) {
      visitanteStorage.salvarUsuarioGoogle(usuario);
      setGoogleSalvo(usuario);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/visitante`, { method: 'POST' });
      if (res.ok) {
        const dados = await res.json();
        visitanteStorage.salvarSessaoVisitante(dados.usuario);
        setUsuario(dados.usuario);
        return;
      }
    } catch (_) {}

    const guestLocal = {
      user_id: `guest_${Math.random().toString(36).substring(2, 8)}`,
      nome: 'Visitante Temporário',
      is_visitante: true,
      expira_em_segundos: 7200,
    };
    visitanteStorage.salvarSessaoVisitante(guestLocal);
    setUsuario(guestLocal);
  };

  const restaurarUsuarioGoogle = () => {
    if (googleSalvo) {
      visitanteStorage.limparSessaoVisitante();
      setUsuario(googleSalvo);
    }
  };

  const logoutCompleto = () => {
    visitanteStorage.limparSessaoVisitante();
    visitanteStorage.limparUsuarioGoogleSalvo();
    setGoogleSalvo(null);
    setUsuario({
      user_id: 'guest_anonimo',
      nome: 'Visitante',
      is_visitante: true,
    });
  };

  return {
    usuario,
    googleSalvo,
    carregando,
    loginGoogleSucesso,
    mudarParaModoVisitante,
    restaurarUsuarioGoogle,
    logoutCompleto,
  };
}
