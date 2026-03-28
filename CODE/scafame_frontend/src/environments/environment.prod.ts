const isLocalhost = window.location.hostname === 'localhost';

export const environment = {
  production: false,
  API_BASE: isLocalhost ? 'http://localhost:3000' : '/api',
  UPLOADS_BASE: '/uploads',
};
