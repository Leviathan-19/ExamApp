/**
 * Tema visual de la aplicacion.
 * Paleta de colores basada en la especificacion del proyecto.
 * Incluye modo claro y oscuro con colores primarios violeta y acentos cyan.
 */

/** Colores primarios (violeta) */
export const colorPrimario = {
  principal: '#7F00FF',
  claro: '#A855F7',
  masCclaro: '#D8B4FE',
  oscuro: '#5B00CC',
  masOscuro: '#3D0080',
} as const;

/** Colores secundarios (cyan) */
export const colorSecundario = {
  principal: '#00D9FF',
  claro: '#00F0FF',
  oscuro: '#00A8CC',
} as const;

/** Colores de retroalimentacion */
export const colorRetroalimentacion = {
  exito: '#10B981',
  error: '#EF4444',
  advertencia: '#F59E0B',
  info: '#3B82F6',
} as const;

/** Colores neutrales */
export const colorNeutral = {
  blanco: '#FFFFFF',
  gris50: '#F9FAFB',
  gris100: '#F3F4F6',
  gris200: '#E5E7EB',
  gris300: '#D1D5DB',
  gris400: '#9CA3AF',
  gris500: '#6B7280',
  gris600: '#4B5563',
  gris700: '#374151',
  gris800: '#1F2937',
  gris900: '#111827',
} as const;

/** Tema oscuro (tema principal de la app) */
export const temaOscuro = {
  fondo: '#0F172A',
  superficie: '#1E293B',
  superficieElevada: '#273549',
  texto: '#F1F5F9',
  textoSecundario: '#94A3B8',
  textoDeshabilitado: '#475569',
  borde: '#334155',
  primario: colorPrimario.principal,
  primarioClaro: colorPrimario.claro,
  secundario: colorSecundario.principal,
  exito: colorRetroalimentacion.exito,
  error: colorRetroalimentacion.error,
  advertencia: colorRetroalimentacion.advertencia,
  info: colorRetroalimentacion.info,
} as const;

/** Tema claro */
export const temaClaro = {
  fondo: colorNeutral.gris50,
  superficie: colorNeutral.blanco,
  superficieElevada: colorNeutral.gris100,
  texto: colorNeutral.gris900,
  textoSecundario: colorNeutral.gris500,
  textoDeshabilitado: colorNeutral.gris400,
  borde: colorNeutral.gris200,
  primario: colorPrimario.principal,
  primarioClaro: colorPrimario.claro,
  secundario: colorSecundario.principal,
  exito: colorRetroalimentacion.exito,
  error: colorRetroalimentacion.error,
  advertencia: colorRetroalimentacion.advertencia,
  info: colorRetroalimentacion.info,
} as const;

/** Tipo del tema para inferencia de TypeScript */
export type Tema = typeof temaOscuro;

/** Espaciado estandar */
export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Bordes redondeados */
export const bordes = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  completo: 9999,
} as const;

/** Tamanos de fuente */
export const fuentes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  titulo: 28,
  encabezado: 22,
} as const;
