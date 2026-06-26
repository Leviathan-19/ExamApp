/**
 * Servicio del motor de examen.
 * Controla el flujo de la sesion: inicio, avance de preguntas, registro de respuestas.
 * Gestiona el estado de la sesion sin acoplarse a la UI.
 */

import { ExamenGenerado, SesionExamen } from '@/src/models';
import { generarId } from '@/src/utils/helpers';

/**
 * Crea una nueva sesion de examen a partir del examen generado.
 * Inicializa todas las respuestas como null y establece el tiempo restante.
 */
export function iniciarSesion(examen: ExamenGenerado): SesionExamen {
  const respuestas: Record<number, number | null> = {};
  for (let i = 0; i < examen.preguntas.length; i++) {
    respuestas[i] = null;
  }

  return {
    id: generarId(),
    examen,
    preguntaActual: 0,
    respuestas,
    tiempoRestante: examen.configuracion.tiempoLimitado ? examen.configuracion.tiempoTotal : null,
    estado: 'en_progreso',
    fechaInicio: Date.now(),
    fechaFin: null,
  };
}

/**
 * Registra la respuesta del usuario para la pregunta actual.
 * Retorna una nueva sesion con la respuesta guardada (inmutable).
 */
export function registrarRespuesta(sesion: SesionExamen, indiceOpcion: number): SesionExamen {
  return {
    ...sesion,
    respuestas: {
      ...sesion.respuestas,
      [sesion.preguntaActual]: indiceOpcion,
    },
  };
}

/**
 * Avanza a la siguiente pregunta.
 * Si era la ultima pregunta, marca la sesion como finalizada.
 * Retorna una nueva sesion actualizada (inmutable).
 */
export function avanzarPregunta(sesion: SesionExamen): SesionExamen {
  const siguientePregunta = sesion.preguntaActual + 1;
  const esUltimaPregunta = siguientePregunta >= sesion.examen.preguntas.length;

  if (esUltimaPregunta) {
    return {
      ...sesion,
      estado: 'finalizado',
      fechaFin: Date.now(),
    };
  }

  return {
    ...sesion,
    preguntaActual: siguientePregunta,
  };
}

/**
 * Finaliza la sesion por tiempo agotado.
 * Las preguntas no contestadas permanecen como null (se cuentan como incorrectas).
 */
export function finalizarPorTiempo(sesion: SesionExamen): SesionExamen {
  return {
    ...sesion,
    estado: 'tiempo_agotado',
    tiempoRestante: 0,
    fechaFin: Date.now(),
  };
}

/**
 * Actualiza el tiempo restante de la sesion.
 * Retorna una nueva sesion con el tiempo actualizado (inmutable).
 */
export function actualizarTiempo(sesion: SesionExamen, tiempoRestante: number): SesionExamen {
  return {
    ...sesion,
    tiempoRestante: Math.max(0, tiempoRestante),
  };
}

/**
 * Verifica si la sesion ha terminado (ya sea por completar todas las preguntas o por tiempo).
 */
export function esSesionFinalizada(sesion: SesionExamen): boolean {
  return sesion.estado === 'finalizado' || sesion.estado === 'tiempo_agotado';
}

/**
 * Obtiene la pregunta actual de la sesion.
 */
export function obtenerPreguntaActual(sesion: SesionExamen) {
  return sesion.examen.preguntas[sesion.preguntaActual];
}
