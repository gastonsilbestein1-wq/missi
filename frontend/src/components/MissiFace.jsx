import React, { useEffect, useRef } from 'react';

function MissiFace({ hablando, escuchando, error }) {
  const ojoIzqRef = useRef(null);
  const ojoDeRef = useRef(null);
  const bocaRef = useRef(null);
  const intervalRef = useRef(null);

  // Pestañeo aleatorio
  useEffect(() => {
    const pestañear = () => {
      [ojoIzqRef, ojoDeRef].forEach(ref => {
        ref.current?.classList.add('cerrado');
      });
      
      setTimeout(() => {
        [ojoIzqRef, ojoDeRef].forEach(ref => {
          ref.current?.classList.remove('cerrado');
        });
      }, 150);
    };

    // Solo pestañea si no hay error
    if (!error) {
      intervalRef.current = setInterval(() => {
        pestañear();
      }, Math.random() * 2000 + 3000); // 3-5 seg
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [error]);

  // Animación de boca al hablar
  useEffect(() => {
    if (hablando) {
      bocaRef.current?.classList.add('hablando');
    } else {
      bocaRef.current?.classList.remove('hablando');
    }
  }, [hablando]);

  return (
    <div className="missi-face">
      <div className="ojos">
        <div 
          ref={ojoIzqRef} 
          className={`ojo ${error ? 'triste' : ''}`}
        ></div>
        <div 
          ref={ojoDeRef} 
          className={`ojo ${error ? 'triste' : ''}`}
        ></div>
      </div>
      <div className={`boca-container ${hablando ? 'hablando' : ''}`}>
        <div 
          ref={bocaRef} 
          className={`boca ${error ? 'triste' : ''}`}
        ></div>
        <div className="boca-punta-izq"></div>
        <div className="boca-punta-der"></div>
      </div>
    </div>
  );
}

export default MissiFace;
