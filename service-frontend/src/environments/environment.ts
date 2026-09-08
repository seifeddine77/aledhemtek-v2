const isLocalhostDev = typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '4200';

export const environment = {
  production: false,
  serverUrl: isLocalhostDev ? 'http://localhost:8080/' : '/',
  apiUrl: isLocalhostDev ? 'http://localhost:8080/api' : '/api',
  uploadsUrl: isLocalhostDev ? 'http://localhost:8080/uploads' : '/uploads'
};
