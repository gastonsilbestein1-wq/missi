import { procesarConversacion } from './bedrockService.js';

export const handler = async (event) => {
  console.log('Event recibido:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { mensaje, sensores, historial, preguntaNumero } = body;

    // Validación
    if (!mensaje || !sensores || !historial || preguntaNumero === undefined) {
      console.error('Datos incompletos:', { mensaje, sensores, historial, preguntaNumero });
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Datos incompletos' })
      };
    }

    console.log('Procesando conversación:', { 
      mensaje, 
      sensores, 
      preguntaNumero,
      historialLength: historial.length 
    });

    // Procesa con Bedrock
    const respuesta = await procesarConversacion(
      mensaje,
      sensores,
      historial,
      preguntaNumero
    );

    console.log('Respuesta generada:', respuesta);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ respuesta })
    };
  } catch (error) {
    console.error('Error en handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        mensaje: error.message 
      })
    };
  }
};
