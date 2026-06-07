import React, { useEffect, useState } from 'react';
import MissiFace from './components/MissiFace';
import ConversationManager from './services/conversationManager';
import SpeechService from './services/speechService';

function App() {
  const [estado, setEstado] = useState('INICIAL');
  const [conversationManager] = useState(() => new ConversationManager());
  const [speechService] = useState(() => new SpeechService());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifica soporte de navegador
    if (!speechService.isSupported()) {
      setError('Tu navegador no es compatible. Usá Chrome, Edge o Safari');
      return;
    }

    // Solicita permisos de micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        // Inicia conversación
        conversationManager.iniciar(speechService, setEstado, setError);
      })
      .catch(() => {
        setError('No puedo escucharte. Verificá los permisos del micrófono');
      });
    
    // Limpieza
    return () => {
      conversationManager.detener();
      speechService.detener();
    };
  }, [conversationManager, speechService]);

  if (error) {
    return (
      <div className="app">
        <MissiFace hablando={false} escuchando={false} error={true} />
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <MissiFace 
        hablando={estado === 'HABLANDO'}
        escuchando={estado === 'ESCUCHANDO'}
        error={false}
      />
    </div>
  );
}

export default App;
