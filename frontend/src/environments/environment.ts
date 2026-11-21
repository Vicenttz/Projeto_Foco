// Sem chaves de API ou credenciais aqui.
// '/api' é relativo: quando o backend serve o site (python iniciar.py) já funciona na mesma porta,
// e com `ng serve` o proxy.conf.json encaminha /api para o backend em localhost:8000.
export const environment = { production: false, apiUrl: '/api' };
