const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  async enviarMensaje(mensaje, sensores, historial, preguntaNumero) {
    try {
      console.log('Enviando a API:', { mensaje, sensores, preguntaNumero });
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje,
          sensores,
          historial,
          preguntaNumero
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de API:', data);
      
      return data.respuesta;
    } catch (error) {
      console.error('Error al comunicarse con el backend:', error);
      throw error;
    }
  }
}

export default ApiService;
