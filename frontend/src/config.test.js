import { describe, it, expect } from 'vitest';
import { API_BASE_URL, APP_CONFIG } from './config';

describe('Frontend Config', () => {
  it('aponta para a porta correta do backend ASGI 8001', () => {
    expect(API_BASE_URL).toContain(':8001');
    expect(APP_CONFIG.TITULO).toBe('Guia do Turista Inteligente');
  });
});
