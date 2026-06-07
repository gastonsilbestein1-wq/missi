class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.onTranscript = null;
    this.isPaused = false;
  }

  isSupported() {
    return ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) 
      && 'speechSynthesis' in window;
  }

  iniciarEscucha(onTranscript) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-AR';
    this.onTranscript = onTranscript;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log('Transcripción:', transcript);
      
      if (this.onTranscript && transcript) {
        this.onTranscript(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      // Reinicia si es un error recuperable
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (this.isListening && !this.isPaused) {
            this.recognition.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      // Reinicia automáticamente si está escuchando y no está pausado
      if (this.isListening && !this.isPaused) {
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Error al reiniciar reconocimiento:', e);
          }
        }, 300);
      }
    };

    this.isListening = true;
    this.isPaused = false;
    
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Error al iniciar reconocimiento:', e);
    }
  }

  pausarEscucha() {
    this.isPaused = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error al pausar:', e);
      }
    }
  }

  hablar(texto, onEnd) {
    // Cancela cualquier síntesis en curso
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-AR';
    utterance.rate = 0.9; // Velocidad natural
    utterance.pitch = 1.1; // Voz femenina
    
    // Busca voz femenina en español
    const voices = this.synthesis.getVoices();
    const vozFemenina = voices.find(v => 
      v.lang.includes('es') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('mujer'))
    ) || voices.find(v => v.lang.includes('es'));
    
    if (vozFemenina) {
      utterance.voice = vozFemenina;
    }

    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('Error de síntesis:', event);
      if (onEnd) {
        onEnd();
      }
    };
    
    // Pausa escucha mientras habla
    this.pausarEscucha();

    this.synthesis.speak(utterance);
  }

  reanudarEscucha() {
    this.isPaused = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        // Si ya está corriendo, ignora el error
        console.log('Reconocimiento ya en curso');
      }
    }
  }

  detener() {
    this.isListening = false;
    this.isPaused = true;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error al detener reconocimiento:', e);
      }
    }
    
    this.synthesis.cancel();
  }
}

export default SpeechService;
