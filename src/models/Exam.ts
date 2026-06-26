/**
 * Modelos principales del dominio de examenes.
 * Define las interfaces para preguntas y examenes parseados desde archivos JSON o Markdown.
 */

/** Tipos de pregunta soportados */
export type TipoPregunta = 'multiple' | 'verdadero_falso';

/** Representa una pregunta individual del examen */
export interface Pregunta {
  /** Identificador unico de la pregunta dentro del archivo */
  id: number;
  /** Texto de la pregunta */
  pregunta: string;
  /** Tipo de pregunta */
  tipo: TipoPregunta;
  /** Lista de opciones de respuesta (2-6 elementos) */
  opciones: string[];
  /** Indice (base 0) de la opcion correcta dentro del array de opciones */
  respuestaCorrecta: number;
}

/** Representa un examen completo parseado desde un archivo */
export interface Examen {
  /** Titulo del examen (opcional, puede venir del archivo) */
  titulo?: string;
  /** Descripcion breve del examen (opcional) */
  descripcion?: string;
  /** Lista de preguntas del examen */
  preguntas: Pregunta[];
}
