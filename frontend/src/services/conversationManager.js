import ApiService from './apiService';
import { generarSensores } from './sensorSimulator';

const ESTADOS = {
  INICIAL: 'INICIAL',
  PIDIENDO_SENSORES: 'PIDIENDO_SENSORES',
  LEYENDO_SENSORES: 'LEYENDO_SENSORES',
  DIAGNOSTICANDO: 'DIAGNOSTICANDO',
  FINALIZANDO: 'FINALIZANDO'
};

class ConversationManager {
  constructor() {
    this.apiService = new ApiService();
    this.estado = ESTADOS.INICIAL;
    this.preguntaNumero = 0;
    this.sensores = null;
    this.historial = [];
    this.speechService = null;
    this.setEstado = null;
    this.setError = null;
    this.procesando = false;
  }

  iniciar(speechService, setEstado, setError) {
    this.speechService = speechService;
    this.setEstado = setEstado;
    this.setError = setError;
    
    // Saludo inicial
    setTimeout(() => {
      this.setEstado('HABLANDO');
      this.speechService.hablar(
        'Hola, soy Missi. ¿Cómo te sentís hoy?',
        () => {
          this.estado = ESTADOS.PIDIENDO_SENSORES;
          this.setEstado('ESCUCHANDO');
          
          // Inicia escucha continua
          this.speechService.iniciarEscucha((transcript) => {
            this.procesarMensaje(transcript);
          });
        }
      );
    }, 500);
  }

  async procesarMensaje(mensaje) {
    // Evita procesamiento simultáneo
    if (this.procesando) {
      console.log('Ya procesando un mensaje, ignorando...');
      return;
    }

    this.procesando = true;
    this.setEstado('PROCESANDO');

    try {
      this.historial.push({ rol: 'usuario', texto: mensaje });

      // Primera respuesta: pedir sensores
      if (this.estado === ESTADOS.PIDIENDO_SENSORES) {
        this.setEstado('HABLANDO');
        this.speechService.hablar(
          'Poné tu dedo en el sensor y verificaré tus signos vitales',
          () => {
            this.setEstado('ESPERANDO');
            // Espera 5 segundos
            setTimeout(() => {
              this.sensores = generarSensores();
              this.leerSensores();
            }, 5000);
          }
        );
        this.estado = ESTADOS.LEYENDO_SENSORES;
        this.procesando = false;
        return;
      }

      // Envía al backend
      if (this.estado === ESTADOS.DIAGNOSTICANDO || this.estado === ESTADOS.LEYENDO_SENSORES) {
        this.preguntaNumero++;
        
        const respuesta = await this.apiService.enviarMensaje(
          mensaje,
          this.sensores,
          this.historial,
          this.preguntaNumero
        );

        this.historial.push({ rol: 'missi', texto: respuesta });
        
        this.setEstado('HABLANDO');
        this.speechService.hablar(respuesta, () => {
          if (this.preguntaNumero >= 6) {
            this.estado = ESTADOS.FINALIZANDO;
            this.setEstado('FINALIZADO');
            // Opcional: reiniciar después de 10 seg
            setTimeout(() => {
              this.reiniciar();
            }, 10000);
          } else {
            this.setEstado('ESCUCHANDO');
            this.speechService.reanudarEscucha();
          }
        });

        if (this.estado === ESTADOS.LEYENDO_SENSORES) {
          this.estado = ESTADOS.DIAGNOSTICANDO;
        }
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      this.setEstado('HABLANDO');
      this.speechService.hablar(
        'Perdí la conexión. Intentá de nuevo en unos segundos',
        () => {
          this.setEstado('ESCUCHANDO');
          this.speechService.reanudarEscucha();
        }
      );
    } finally {
      this.procesando = false;
    }
  }

  leerSensores() {
    const texto = `
      Tu temperatura es ${this.sensores.temperatura} grados,
      tu ritmo cardíaco ${this.sensores.ritmoCardiaco} latidos por minuto,
      tu oxígeno en sangre ${this.sensores.oxigeno} por ciento,
      y tu presión ${this.sensores.presion.sistolica} sobre ${this.sensores.presion.diastolica}.
    `.trim();
    
    this.historial.push({ rol: 'missi', texto });
    
    this.setEstado('HABLANDO');
    this.speechService.hablar(texto, () => {
      this.setEstado('ESCUCHANDO');
      this.speechService.reanudarEscucha();
    });
  }

  reiniciar() {
    this.estado = ESTADOS.INICIAL;
    this.preguntaNumero = 0;
    this.sensores = null;
    this.historial = [];
    this.procesando = false;
    
    // Reinicia la conversación
    this.iniciar(this.speechService, this.setEstado, this.setError);
  }

  detener() {
    this.procesando = false;
    if (this.speechService) {
      this.speechService.detener();
    }
  }
}

export default ConversationManager;
