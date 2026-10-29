export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '776335673676-dk7od4ljhh43bio4bppf94i8ou0u9v9i.apps.googleusercontent.com';

export const APP_CONFIG = {
  TITULO: 'Guia do Turista Inteligente',
  VERSAO: '2.0.0',
  PORTA_API: 8001,
  PORTA_FRONT: 5173,
};
