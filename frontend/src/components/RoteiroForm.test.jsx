import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RoteiroForm from './RoteiroForm';

describe('Componente RoteiroForm', () => {
  it('renderiza os campos obrigatórios de município, UF e seletor de propulsão', () => {
    render(<RoteiroForm onSubmit={vi.fn()} carregando={false} />);
    expect(screen.getByLabelText(/Município de Origem/i)).toBeDefined();
    expect(screen.getByLabelText(/UF de Origem/i)).toBeDefined();
    expect(screen.getByLabelText(/Município de Destino/i)).toBeDefined();
    expect(screen.getByLabelText(/UF de Destino/i)).toBeDefined();
    expect(screen.getByText(/Combustão/i)).toBeDefined();
    expect(screen.getByText(/100% Elétrico/i)).toBeDefined();
  });

  it('desabilita o botão de planejar quando o formulário está carregando (prevenção de duplo clique)', () => {
    render(<RoteiroForm onSubmit={vi.fn()} carregando={true} />);
    const botao = screen.getByRole('button', { name: /Processando/i });
    expect(botao).toHaveProperty('disabled', true);
  });
});
