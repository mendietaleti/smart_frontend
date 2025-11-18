// Configuración de la API
// En desarrollo, usa el proxy de Vite
// En producción, usa la variable de entorno VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default API_BASE_URL;

