/**
 * Servicio de validacion de examenes.
 * Valida que un examen parseado cumpla con todas las reglas de la especificacion.
 * Complementa la validacion basica que ya realiza el ParserService.
 */

import { Examen, Pregunta } from '@/src/models';
import { MIN_OPCIONES, MAX_OPCIONES, MAX_PREGUNTAS_POR_ARCHIVO } from '@/src/utils/constants';

/** Resultado de la validacion */
export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
}

/**
 * Valida un examen completo.
 * Retorna la lista de todos los errores encontrados (no se detiene en el primero).
 */
export function validarExamen(examen: Examen): ResultadoValidacion {
  const errores: string[] = [];

  /* Validar que exista el array de preguntas */
  if (!examen.preguntas || !Array.isArray(examen.preguntas)) {
    return { valido: false, errores: ['El archivo no contiene el campo "preguntas".'] };
  }

  /* Validar que no este vacio */
  if (examen.preguntas.length === 0) {
    return { valido: false, errores: ['El archivo debe contener al menos una pregunta.'] };
  }

  /* Validar limite maximo de preguntas */
  if (examen.preguntas.length > MAX_PREGUNTAS_POR_ARCHIVO) {
    errores.push(
      `El archivo tiene ${examen.preguntas.length} preguntas (maximo ${MAX_PREGUNTAS_POR_ARCHIVO}).`
    );
  }

  /* Validar IDs unicos */
  const idsVistos = new Set<number>();
  for (const pregunta of examen.preguntas) {
    if (idsVistos.has(pregunta.id)) {
      errores.push(`El ID ${pregunta.id} esta duplicado. Cada pregunta debe tener un ID unico.`);
    }
    idsVistos.add(pregunta.id);
  }

  /* Validar cada pregunta individualmente */
  for (let i = 0; i < examen.preguntas.length; i++) {
    const erroresPregunta = validarPregunta(examen.preguntas[i], i + 1);
    errores.push(...erroresPregunta);
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

/**
 * Valida una pregunta individual.
 * Retorna un array con los errores encontrados en esa pregunta.
 */
export function validarPregunta(pregunta: Pregunta, numero: number): string[] {
  const errores: string[] = [];

  /* Validar texto de la pregunta */
  if (!pregunta.pregunta || typeof pregunta.pregunta !== 'string' || pregunta.pregunta.trim().length === 0) {
    errores.push(`La pregunta #${numero} no tiene texto.`);
  }

  /* Validar opciones */
  if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) {
    errores.push(`La pregunta #${numero} no tiene opciones.`);
    return errores; /* No se puede continuar sin opciones */
  }

  const erroresOpciones = validarOpciones(pregunta.opciones, pregunta.tipo, numero);
  errores.push(...erroresOpciones);

  /* Validar respuesta correcta */
  if (
    typeof pregunta.respuestaCorrecta !== 'number' ||
    !Number.isInteger(pregunta.respuestaCorrecta) ||
    pregunta.respuestaCorrecta < 0 ||
    pregunta.respuestaCorrecta >= pregunta.opciones.length
  ) {
    errores.push(
      `La pregunta #${numero} no tiene una respuesta correcta valida. El indice debe estar entre 0 y ${pregunta.opciones.length - 1}.`
    );
  }

  /* Validar que las opciones no esten vacias */
  for (let i = 0; i < pregunta.opciones.length; i++) {
    if (!pregunta.opciones[i] || pregunta.opciones[i].trim().length === 0) {
      errores.push(`La pregunta #${numero}, opcion ${i + 1} esta vacia.`);
    }
  }

  return errores;
}

/**
 * Valida las opciones de una pregunta.
 * Verifica cantidad, duplicados y coherencia con el tipo de pregunta.
 */
export function validarOpciones(
  opciones: string[],
  tipo: string,
  numeroPregunta: number,
): string[] {
  const errores: string[] = [];

  /* Validar cantidad de opciones */
  if (opciones.length < MIN_OPCIONES) {
    errores.push(
      `La pregunta #${numeroPregunta} tiene ${opciones.length} opcion(es). Cada pregunta debe tener al menos ${MIN_OPCIONES} opciones.`
    );
  }

  if (opciones.length > MAX_OPCIONES) {
    errores.push(
      `La pregunta #${numeroPregunta} tiene ${opciones.length} opciones (maximo ${MAX_OPCIONES}). Por favor, reduce el numero de opciones.`
    );
  }

  /* Validar coherencia con tipo verdadero/falso */
  if (tipo === 'verdadero_falso' && opciones.length !== 2) {
    errores.push(
      `La pregunta #${numeroPregunta} es de tipo "verdadero_falso" pero tiene ${opciones.length} opciones. Debe tener exactamente 2.`
    );
  }

  /* Validar opciones duplicadas */
  const opcionesNormalizadas = opciones.map(o => o.trim().toLowerCase());
  const opcionesVistas = new Set<string>();
  for (const opcion of opcionesNormalizadas) {
    if (opcionesVistas.has(opcion)) {
      errores.push(
        `La pregunta #${numeroPregunta} tiene opciones duplicadas. Cada opcion debe ser unica.`
      );
      break; /* Solo reportar duplicados una vez por pregunta */
    }
    opcionesVistas.add(opcion);
  }

  return errores;
}
