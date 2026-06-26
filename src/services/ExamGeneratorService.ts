/**
 * Servicio generador de examenes.
 * Recibe un examen parseado y la configuracion del usuario,
 * y genera el examen definitivo con preguntas seleccionadas y posiblemente reordenadas.
 */

import { Examen, Pregunta, PreguntaGenerada, ExamenGenerado, ConfiguracionExamen } from '@/src/models';
import { barajar, generarId } from '@/src/utils/helpers';

/**
 * Genera un examen listo para ser ejecutado segun la configuracion proporcionada.
 * Selecciona preguntas aleatorias, baraja el orden y reordena opciones si corresponde.
 */
export function generarExamen(
  examen: Examen,
  configuracion: ConfiguracionExamen,
  archivoId: string,
  nombreArchivo: string,
): ExamenGenerado {
  /* 1. Seleccionar preguntas */
  let preguntasSeleccionadas: Pregunta[];

  if (configuracion.cantidadPreguntas >= examen.preguntas.length) {
    preguntasSeleccionadas = [...examen.preguntas];
  } else {
    preguntasSeleccionadas = seleccionarPreguntasAleatorias(
      examen.preguntas,
      configuracion.cantidadPreguntas,
    );
  }

  /* 2. Aleatorizar orden de preguntas si esta habilitado */
  if (configuracion.aleatorizarPreguntas) {
    preguntasSeleccionadas = barajar(preguntasSeleccionadas);
  }

  /* 3. Convertir a PreguntaGenerada, aleatorizando opciones si aplica */
  const preguntasGeneradas: PreguntaGenerada[] = preguntasSeleccionadas.map(
    (pregunta, indice) => {
      if (configuracion.aleatorizarOpciones) {
        return aleatorizarOpcionesPregunta(pregunta, indice);
      }

      /* Sin aleatorizacion de opciones: mapeo directo */
      return {
        ...pregunta,
        indiceOriginal: indice,
        mapeoOpciones: pregunta.opciones.map((_, i) => i),
      };
    },
  );

  return {
    archivoId,
    nombreArchivo,
    configuracion,
    preguntas: preguntasGeneradas,
    fechaGeneracion: Date.now(),
  };
}

/**
 * Selecciona N preguntas aleatorias de un conjunto.
 * Usa Fisher-Yates parcial para eficiencia.
 */
function seleccionarPreguntasAleatorias(preguntas: Pregunta[], cantidad: number): Pregunta[] {
  const barajadas = barajar(preguntas);
  return barajadas.slice(0, cantidad);
}

/**
 * Aleatoriza el orden de las opciones de una pregunta.
 * Ajusta el indice de respuestaCorrecta para que siga apuntando a la opcion correcta.
 * Guarda el mapeo de opciones para poder reconstruir el orden original.
 */
function aleatorizarOpcionesPregunta(pregunta: Pregunta, indiceOriginal: number): PreguntaGenerada {
  /* Crear indices [0, 1, 2, ...] y barajarlos */
  const indices = pregunta.opciones.map((_, i) => i);
  const indicesBarajados = barajar(indices);

  /* Reordenar opciones segun los indices barajados */
  const opcionesReordenadas = indicesBarajados.map(i => pregunta.opciones[i]);

  /* Encontrar donde quedo la respuesta correcta en el nuevo orden */
  const nuevaRespuestaCorrecta = indicesBarajados.indexOf(pregunta.respuestaCorrecta);

  return {
    ...pregunta,
    opciones: opcionesReordenadas,
    respuestaCorrecta: nuevaRespuestaCorrecta,
    indiceOriginal,
    mapeoOpciones: indicesBarajados,
  };
}
