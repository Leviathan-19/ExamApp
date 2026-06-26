/**
 * Modelos para la sesion activa del examen y su configuracion.
 * Define las interfaces necesarias para controlar el flujo de un examen en progreso.
 */

import { Pregunta } from './Exam';

/** Configuracion seleccionada por el usuario antes de iniciar el examen */
export interface ConfiguracionExamen {
  /** Numero de preguntas a incluir en el examen */
  cantidadPreguntas: number;
  /** Si el examen tiene limite de tiempo */
  tiempoLimitado: boolean;
  /** Segundos por pregunta (30-120), solo aplica si tiempoLimitado es true */
  segundosPorPregunta: number;
  /** Tiempo total en segundos, calculado automaticamente */
  tiempoTotal: number;
  /** Si se debe aleatorizar el orden de las preguntas */
  aleatorizarPreguntas: boolean;
  /** Si se debe aleatorizar el orden de las opciones en cada pregunta */
  aleatorizarOpciones: boolean;
}

/** Pregunta generada con posible reordenamiento de opciones */
export interface PreguntaGenerada extends Pregunta {
  /** Indice original de la pregunta en el archivo fuente */
  indiceOriginal: number;
  /** Mapeo de indices: indice nuevo -> indice original de la opcion */
  mapeoOpciones: number[];
}

/** Examen generado listo para ser ejecutado */
export interface ExamenGenerado {
  /** ID del archivo de origen */
  archivoId: string;
  /** Nombre del archivo de origen */
  nombreArchivo: string;
  /** Configuracion aplicada */
  configuracion: ConfiguracionExamen;
  /** Preguntas seleccionadas y posiblemente reordenadas */
  preguntas: PreguntaGenerada[];
  /** Timestamp de cuando se genero el examen */
  fechaGeneracion: number;
}

/** Estado de la sesion del examen en progreso */
export interface SesionExamen {
  /** ID unico de la sesion */
  id: string;
  /** Examen generado asociado a esta sesion */
  examen: ExamenGenerado;
  /** Indice de la pregunta actual (base 0) */
  preguntaActual: number;
  /** Respuestas del usuario: clave = indice de la pregunta, valor = indice de opcion seleccionada (null si no respondida) */
  respuestas: Record<number, number | null>;
  /** Tiempo restante en segundos (null si no hay limite de tiempo) */
  tiempoRestante: number | null;
  /** Estado de la sesion */
  estado: 'en_progreso' | 'finalizado' | 'tiempo_agotado';
  /** Timestamp de cuando se inicio la sesion */
  fechaInicio: number;
  /** Timestamp de cuando se finalizo (null si esta en progreso) */
  fechaFin: number | null;
}
