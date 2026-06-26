/**
 * Funciones auxiliares reutilizables en toda la aplicacion.
 */

/**
 * Baraja un array usando el algoritmo Fisher-Yates.
 * Retorna un nuevo array sin mutar el original.
 */
export function barajar<T>(array: T[]): T[] {
  const resultado = [...array];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

/**
 * Genera un ID unico basado en el timestamp actual y un componente aleatorio.
 * Formato: "timestamp_random"
 */
export function generarId(): string {
  const timestamp = Date.now();
  const aleatorio = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${aleatorio}`;
}

/**
 * Formatea una cantidad de segundos a formato legible "Xm Ys".
 * Ejemplo: 125 -> "2m 5s"
 */
export function formatearTiempo(segundos: number): string {
  if (segundos <= 0) return '0s';

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;

  if (minutos === 0) return `${segs}s`;
  if (segs === 0) return `${minutos}m`;
  return `${minutos}m ${segs}s`;
}

/**
 * Formatea un timestamp a una cadena de fecha legible.
 * Ejemplo: 1234567890000 -> "26/06/2026 14:30"
 */
export function formatearFecha(timestamp: number): string {
  const fecha = new Date(timestamp);
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minuto = fecha.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
}

/**
 * Redondea un numero a un decimal.
 * Ejemplo: 16.45 -> 16.5, 16.44 -> 16.4
 */
export function redondearUnDecimal(valor: number): number {
  return Math.round(valor * 10) / 10;
}
