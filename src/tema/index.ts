/** Exportar todo el sistema de temas desde un unico punto de entrada */
export {
  colorPrimario,
  colorSecundario,
  colorRetroalimentacion,
  colorNeutral,
  temaOscuro,
  temaClaro,
  espaciado,
  bordes,
  fuentes,
} from './colores';
export type { Tema } from './colores';
export { TemaProveedor, usarTema } from './TemaProveedor';
