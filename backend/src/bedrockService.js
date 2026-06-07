const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { construirPrompt } = require('./promptBuilder.js');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const MODEL_ID = 'us.amazon.nova-lite-v1:0';

async function procesarConversacion(mensaje, sensores, historial, preguntaNumero) {
  const prompt = construirPrompt(mensaje, sensores, historial, preguntaNumero);

  console.log('Enviando a Bedrock con modelo:', MODEL_ID);
  console.log('Prompt length:', prompt.length);

  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }]
      }
    ],
    inferenceConfig: {
      maxTokens: 300,
      temperature: 0.7,
      topP: 0.9
    }
  });

  try {
    const response = await client.send(command);
    const respuesta = response.output.message.content[0].text;

    console.log('Respuesta de Bedrock:', respuesta);
    console.log('Tokens usados - Input:', response.usage?.inputTokens, 'Output:', response.usage?.outputTokens);

    return respuesta;
  } catch (error) {
    console.error('Error llamando a Bedrock:', error);
    throw error;
  }
}

module.exports = { procesarConversacion };
