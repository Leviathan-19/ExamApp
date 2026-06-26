/**
 * Constantes globales de la aplicacion.
 * Centraliza todos los valores magicos y limites de configuracion.
 */

/** Limites de opciones por pregunta */
export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;

/** Limites de preguntas por archivo */
export const MIN_PREGUNTAS = 1;
export const MAX_PREGUNTAS_POR_ARCHIVO = 1000;

/** Limites de tiempo por pregunta (en segundos) */
export const MIN_SEGUNDOS_POR_PREGUNTA = 30;
export const MAX_SEGUNDOS_POR_PREGUNTA = 120;

/** Escala de calificacion */
export const ESCALA_CALIFICACION = 20;

/** Limite de pruebas en el historial por archivo */
export const MAX_PRUEBAS_HISTORIAL = 10;

/** Dias antes de limpiar un examen en progreso no reanudado */
export const DIAS_EXPIRACION_EXAMEN = 7;

/** Tamano maximo de archivo en bytes (10MB) */
export const TAMANO_MAXIMO_ARCHIVO = 10 * 1024 * 1024;

/** Intervalo de guardado del tiempo restante en ms (5 segundos) */
export const INTERVALO_GUARDADO_TIEMPO = 5000;

/** Umbral de advertencia de tiempo bajo (en segundos) */
export const UMBRAL_TIEMPO_BAJO = 30;

/** Claves de AsyncStorage */
export const STORAGE_KEYS = {
  ARCHIVOS: '@examen_offline/archivos',
  EXAMEN_EN_PROGRESO: '@examen_offline/examen_en_progreso',
  HISTORIAL: '@examen_offline/historial',
} as const;

/** Version de la aplicacion */
export const VERSION_APP = '1.0.0';
