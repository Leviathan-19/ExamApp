/**
 * Servicio de almacenamiento local.
 * Gestiona la persistencia de archivos, sesiones de examen e historial
 * usando AsyncStorage como backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MAX_PRUEBAS_HISTORIAL, DIAS_EXPIRACION_EXAMEN } from '@/src/utils/constants';
import { ArchivoExamen, EntradaHistorial } from '@/src/models';
import { SesionExamen } from '@/src/models';

/* ========================================================================
 * GESTION DE ARCHIVOS
 * ======================================================================== */

/**
 * Obtiene todos los archivos guardados.
 * Retorna un objeto donde las claves son los IDs de los archivos.
 */
export async function obtenerArchivos(): Promise<Record<string, ArchivoExamen>> {
  try {
    const datos = await AsyncStorage.getItem(STORAGE_KEYS.ARCHIVOS);
    if (!datos) return {};
    return JSON.parse(datos);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return {};
  }
}

/**
 * Obtiene la lista de archivos como array, ordenada por fecha de carga (mas reciente primero).
 */
export async function listarArchivos(): Promise<ArchivoExamen[]> {
  const archivos = await obtenerArchivos();
  return Object.values(archivos).sort((a, b) => b.fechaCarga - a.fechaCarga);
}

/**
 * Obtiene un archivo por su ID.
 * Retorna null si no existe.
 */
export async function obtenerArchivoPorId(id: string): Promise<ArchivoExamen | null> {
  const archivos = await obtenerArchivos();
  return archivos[id] || null;
}

/**
 * Guarda un archivo nuevo. Si ya existe un archivo con el mismo ID (mismo hash de contenido),
 * actualiza la fecha de carga.
 */
export async function guardarArchivo(archivo: ArchivoExamen): Promise<void> {
  try {
    const archivos = await obtenerArchivos();
    archivos[archivo.id] = archivo;
    await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVOS, JSON.stringify(archivos));
  } catch (error) {
    console.error('Error al guardar archivo:', error);
    throw new Error('No se pudo guardar el archivo. Por favor, intenta de nuevo.');
  }
}

/**
 * Elimina un archivo por su ID.
 * Tambien elimina el historial asociado a ese archivo.
 */
export async function eliminarArchivo(id: string): Promise<void> {
  try {
    const archivos = await obtenerArchivos();
    delete archivos[id];
    await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVOS, JSON.stringify(archivos));

    /* Eliminar historial asociado */
    await eliminarHistorialPorArchivo(id);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw new Error('No se pudo eliminar el archivo. Por favor, intenta de nuevo.');
  }
}

/* ========================================================================
 * GESTION DE EXAMEN EN PROGRESO
 * ======================================================================== */

/**
 * Guarda el estado actual de un examen en progreso.
 * Se llama automaticamente cada vez que el usuario responde una pregunta.
 */
export async function guardarExamenEnProgreso(sesion: SesionExamen): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXAMEN_EN_PROGRESO, JSON.stringify(sesion));
  } catch (error) {
    console.error('Error al guardar examen en progreso:', error);
  }
}

/**
 * Obtiene el examen en progreso si existe.
 * Retorna null si no hay examen en progreso o si ha expirado.
 */
export async function obtenerExamenEnProgreso(): Promise<SesionExamen | null> {
  try {
    const datos = await AsyncStorage.getItem(STORAGE_KEYS.EXAMEN_EN_PROGRESO);
    if (!datos) return null;

    const sesion: SesionExamen = JSON.parse(datos);

    /* Verificar si el examen ha expirado (mas de 7 dias sin reanudarse) */
    const ahora = Date.now();
    const diasTranscurridos = (ahora - sesion.fechaInicio) / (1000 * 60 * 60 * 24);

    if (diasTranscurridos > DIAS_EXPIRACION_EXAMEN) {
      await limpiarExamenEnProgreso();
      return null;
    }

    /* Solo retornar si esta en progreso */
    if (sesion.estado !== 'en_progreso') {
      await limpiarExamenEnProgreso();
      return null;
    }

    return sesion;
  } catch (error) {
    console.error('Error al obtener examen en progreso:', error);
    return null;
  }
}

/**
 * Elimina el examen en progreso del almacenamiento.
 */
export async function limpiarExamenEnProgreso(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.EXAMEN_EN_PROGRESO);
  } catch (error) {
    console.error('Error al limpiar examen en progreso:', error);
  }
}

/* ========================================================================
 * GESTION DE HISTORIAL
 * ======================================================================== */

/**
 * Obtiene todo el historial organizado por archivo.
 * Retorna un objeto donde las claves son los IDs de archivo
 * y los valores son arrays de entradas de historial.
 */
async function obtenerHistorialCompleto(): Promise<Record<string, EntradaHistorial[]>> {
  try {
    const datos = await AsyncStorage.getItem(STORAGE_KEYS.HISTORIAL);
    if (!datos) return {};
    return JSON.parse(datos);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return {};
  }
}

/**
 * Obtiene el historial de un archivo especifico, ordenado por fecha (mas reciente primero).
 */
export async function obtenerHistorialPorArchivo(archivoId: string): Promise<EntradaHistorial[]> {
  const historial = await obtenerHistorialCompleto();
  const entradas = historial[archivoId] || [];
  return entradas.sort((a, b) => b.fecha - a.fecha);
}

/**
 * Guarda una nueva entrada en el historial.
 * Si se supera el limite de MAX_PRUEBAS_HISTORIAL (10), elimina la mas antigua.
 */
export async function guardarEnHistorial(entrada: EntradaHistorial): Promise<void> {
  try {
    const historial = await obtenerHistorialCompleto();

    if (!historial[entrada.archivoId]) {
      historial[entrada.archivoId] = [];
    }

    historial[entrada.archivoId].push(entrada);

    /* Ordenar por fecha (mas reciente primero) */
    historial[entrada.archivoId].sort((a, b) => b.fecha - a.fecha);

    /* Mantener solo las ultimas MAX_PRUEBAS_HISTORIAL entradas */
    if (historial[entrada.archivoId].length > MAX_PRUEBAS_HISTORIAL) {
      historial[entrada.archivoId] = historial[entrada.archivoId].slice(0, MAX_PRUEBAS_HISTORIAL);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial));
  } catch (error) {
    console.error('Error al guardar en historial:', error);
    throw new Error('No se pudo guardar el resultado. Por favor, intenta de nuevo.');
  }
}

/**
 * Elimina una entrada especifica del historial.
 */
export async function eliminarEntradaHistorial(archivoId: string, entradaId: string): Promise<void> {
  try {
    const historial = await obtenerHistorialCompleto();

    if (historial[archivoId]) {
      historial[archivoId] = historial[archivoId].filter(e => e.id !== entradaId);

      if (historial[archivoId].length === 0) {
        delete historial[archivoId];
      }

      await AsyncStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial));
    }
  } catch (error) {
    console.error('Error al eliminar entrada de historial:', error);
    throw new Error('No se pudo eliminar la entrada del historial.');
  }
}

/**
 * Elimina todo el historial asociado a un archivo.
 */
async function eliminarHistorialPorArchivo(archivoId: string): Promise<void> {
  try {
    const historial = await obtenerHistorialCompleto();
    delete historial[archivoId];
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial));
  } catch (error) {
    console.error('Error al eliminar historial del archivo:', error);
  }
}

/* ========================================================================
 * UTILIDADES
 * ======================================================================== */

/**
 * Elimina todos los datos de la aplicacion.
 * Util para depuracion o cuando el usuario quiere empezar desde cero.
 */
export async function limpiarTodosLosDatos(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ARCHIVOS,
      STORAGE_KEYS.EXAMEN_EN_PROGRESO,
      STORAGE_KEYS.HISTORIAL,
    ]);
  } catch (error) {
    console.error('Error al limpiar todos los datos:', error);
    throw new Error('No se pudieron eliminar los datos.');
  }
}
