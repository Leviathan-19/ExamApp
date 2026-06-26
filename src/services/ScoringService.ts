/**
 * Servicio de calificacion.
 * Calcula puntuaciones, porcentajes y estadisticas de un examen completado.
 * La escala siempre es sobre 20 puntos, independientemente del numero de preguntas.
 */

import { PreguntaGenerada, SesionExamen, Estadisticas } from '@/src/models';
import { ESCALA_CALIFICACION } from '@/src/utils/constants';
import { redondearUnDecimal } from '@/src/utils/helpers';

/**
 * Evalua si una respuesta del usuario es correcta.
 * Retorna true si el indice seleccionado coincide con la respuesta correcta.
 */
export function evaluarRespuesta(pregunta: PreguntaGenerada, respuestaUsuario: number | null): boolean {
  if (respuestaUsuario === null) return false;
  return respuestaUsuario === pregunta.respuestaCorrecta;
}

/**
 * Calcula la calificacion final sobre 20 puntos.
 * Formula: (correctas / total) * 20
 */
export function calcularCalificacion(correctas: number, total: number): number {
  if (total === 0) return 0;
  return redondearUnDecimal((correctas / total) * ESCALA_CALIFICACION);
}

/**
 * Calcula el porcentaje de acierto.
 * Retorna un valor entre 0 y 100, redondeado a un decimal.
 */
export function calcularPorcentaje(correctas: number, total: number): number {
  if (total === 0) return 0;
  return redondearUnDecimal((correctas / total) * 100);
}

/**
 * Genera las estadisticas completas de una sesion de examen finalizada.
 * Procesa todas las respuestas y calcula calificacion, porcentaje y conteos.
 */
export function generarEstadisticas(sesion: SesionExamen): Estadisticas {
  const preguntas = sesion.examen.preguntas;
  const totalPreguntas = preguntas.length;

  let respuestasCorrectas = 0;

  for (let i = 0; i < preguntas.length; i++) {
    const respuestaUsuario = sesion.respuestas[i] ?? null;
    if (evaluarRespuesta(preguntas[i], respuestaUsuario)) {
      respuestasCorrectas++;
    }
  }

  const respuestasIncorrectas = totalPreguntas - respuestasCorrectas;
  const calificacionFinal = calcularCalificacion(respuestasCorrectas, totalPreguntas);
  const porcentajeAcierto = calcularPorcentaje(respuestasCorrectas, totalPreguntas);

  /* Calcular tiempo utilizado si habia limite */
  let tiempoUtilizado: number | null = null;
  if (sesion.examen.configuracion.tiempoLimitado && sesion.tiempoRestante !== null) {
    tiempoUtilizado = sesion.examen.configuracion.tiempoTotal - sesion.tiempoRestante;
  }

  return {
    totalPreguntas,
    respuestasCorrectas,
    respuestasIncorrectas,
    porcentajeAcierto,
    calificacionFinal,
    tiempoUtilizado,
  };
}
