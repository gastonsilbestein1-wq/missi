function random(min, max, decimales = 0) {
  const valor = Math.random() * (max - min) + min;
  return decimales > 0 ? parseFloat(valor.toFixed(decimales)) : Math.round(valor);
}

function generarSensores() {
  return {
    temperatura: random(36.0, 38.5, 1),
    ritmoCardiaco: random(60, 110),
    oxigeno: random(92, 100),
    presion: {
      sistolica: random(110, 150),
      diastolica: random(70, 95)
    }
  };
}

export { generarSensores };
