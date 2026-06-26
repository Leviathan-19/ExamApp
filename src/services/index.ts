/** Exportar todos los servicios desde un unico punto de entrada */
export {
  parsearArchivo,
  parsearJSON,
  parsearMarkdown,
  detectarFormato,
} from './ParserService';
export type { ResultadoParsing } from './ParserService';

export {
  validarExamen,
  validarPregunta,
  validarOpciones,
} from './ValidationService';
export type { ResultadoValidacion } from './ValidationService';

export {
  obtenerArchivos,
  listarArchivos,
  obtenerArchivoPorId,
  guardarArchivo,
  eliminarArchivo,
  guardarExamenEnProgreso,
  obtenerExamenEnProgreso,
  limpiarExamenEnProgreso,
  obtenerHistorialPorArchivo,
  guardarEnHistorial,
  eliminarEntradaHistorial,
  limpiarTodosLosDatos,
} from './StorageService';

export { generarExamen } from './ExamGeneratorService';

export {
  iniciarSesion,
  registrarRespuesta,
  avanzarPregunta,
  finalizarPorTiempo,
  actualizarTiempo,
  esSesionFinalizada,
  obtenerPreguntaActual,
} from './ExamEngineService';

export {
  evaluarRespuesta,
  calcularCalificacion,
  calcularPorcentaje,
  generarEstadisticas,
} from './ScoringService';
