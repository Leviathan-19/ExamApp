/**
 * Modelos para el historial de pruebas y archivos guardados.
 * Define las interfaces para persistencia de datos en el dispositivo.
 */

import { Examen } from './Exam';

/** Archivo de examen guardado en el dispositivo */
export interface ArchivoExamen {
  /** ID unico del archivo (hash SHA-256 del contenido) */
  id: string;
  /** Nombre original del archivo */
  nombre: string;
  /** Total de preguntas en el archivo */
  totalPreguntas: number;
  /** Timestamp de cuando se cargo el archivo */
  fechaCarga: number;
  /** Contenido parseado del examen */
  contenido: Examen;
}

/** Estadisticas de una prueba completada */
export interface Estadisticas {
  /** Total de preguntas en el examen */
  totalPreguntas: number;
  /** Cantidad de respuestas correctas */
  respuestasCorrectas: number;
  /** Cantidad de respuestas incorrectas */
  respuestasIncorrectas: number;
  /** Porcentaje de acierto (0-100) */
  porcentajeAcierto: number;
  /** Calificacion final sobre 20 puntos */
  calificacionFinal: number;
  /** Tiempo utilizado en segundos (null si no habia limite de tiempo) */
  tiempoUtilizado: number | null;
}

/** Entrada en el historial de pruebas */
export interface EntradaHistorial {
  /** ID unico de la prueba (timestamp) */
  id: string;
  /** ID del archivo de origen */
  archivoId: string;
  /** Timestamp de cuando se realizo la prueba */
  fecha: number;
  /** Calificacion final sobre 20 */
  calificacion: number;
  /** Cantidad de respuestas correctas */
  respuestasCorrectas: number;
  /** Cantidad de respuestas incorrectas */
  respuestasIncorrectas: number;
  /** Tiempo utilizado en segundos (null si no habia limite) */
  tiempoUtilizado: number | null;
  /** Respuestas del usuario para revision posterior */
  respuestas: Record<number, number | null>;
  /** Preguntas del examen (para poder revisar despues) */
  preguntas: import('./ExamSession').PreguntaGenerada[];
}
