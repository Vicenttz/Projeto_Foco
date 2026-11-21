<<<<<<< HEAD
// Sem chaves de API ou credenciais aqui.
// '/api' é relativo: quando o backend serve o site (python iniciar.py) já funciona na mesma porta,
// e com `ng serve` o proxy.conf.json encaminha /api para o backend em localhost:8000.
export const environment = { production: false, apiUrl: '/api' };
=======
// Sem chaves de API ou credenciais aqui. O backend (FastAPI) rodará localmente na porta 8000.
export const environment = { production: false, apiUrl: 'http://localhost:8000/api' };
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
