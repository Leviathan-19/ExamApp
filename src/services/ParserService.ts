/**
 * Servicio de parsing de archivos.
 * Convierte archivos JSON y Markdown al modelo unificado de Examen.
 * Incluye deteccion automatica del formato basada en la extension del archivo.
 */

import { Examen, Pregunta, TipoPregunta } from '@/src/models';

/** Resultado del parsing con posibles errores */
export interface ResultadoParsing {
  exito: boolean;
  examen?: Examen;
  error?: string;
}

/**
 * Detecta el formato del archivo basandose en su extension.
 * Si la extension no es reconocida, intenta detectar por contenido.
 */
export function detectarFormato(nombreArchivo: string, contenido: string): 'json' | 'markdown' | null {
  const extension = nombreArchivo.toLowerCase().split('.').pop();

  if (extension === 'json') return 'json';
  if (extension === 'md' || extension === 'markdown') return 'markdown';

  /* Intento de deteccion por contenido */
  const contenidoLimpio = contenido.trim();
  if (contenidoLimpio.startsWith('{') || contenidoLimpio.startsWith('[')) {
    return 'json';
  }
  if (contenidoLimpio.startsWith('#') || contenidoLimpio.includes('## Pregunta')) {
    return 'markdown';
  }

  return null;
}

/**
 * Parsea el contenido de un archivo al modelo Examen.
 * Detecta automaticamente el formato y aplica el parser correspondiente.
 */
export function parsearArchivo(nombreArchivo: string, contenido: string): ResultadoParsing {
  if (!contenido || contenido.trim().length === 0) {
    return {
      exito: false,
      error: 'El archivo esta vacio. Por favor, selecciona un archivo con preguntas.',
    };
  }

  const formato = detectarFormato(nombreArchivo, contenido);

  if (!formato) {
    return {
      exito: false,
      error: 'El archivo no tiene un formato valido. Asegurate de que sea JSON o Markdown correctamente estructurado.',
    };
  }

  if (formato === 'json') {
    return parsearJSON(contenido);
  }

  return parsearMarkdown(contenido);
}

/* ========================================================================
 * PARSER JSON
 * ======================================================================== */

/**
 * Parsea contenido JSON al modelo Examen.
 * Espera la estructura definida en la especificacion:
 * { titulo?, descripcion?, preguntas: [{ id, pregunta, tipo, opciones, respuestaCorrecta }] }
 */
export function parsearJSON(contenido: string): ResultadoParsing {
  let datos: unknown;

  try {
    datos = JSON.parse(contenido);
  } catch {
    return {
      exito: false,
      error: 'El archivo JSON no es valido. Verifica la sintaxis.',
    };
  }

  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    return {
      exito: false,
      error: 'El archivo JSON debe contener un objeto con el campo "preguntas".',
    };
  }

  const obj = datos as Record<string, unknown>;

  if (!obj.preguntas || !Array.isArray(obj.preguntas)) {
    return {
      exito: false,
      error: 'El archivo no contiene el campo "preguntas". Por favor, verifica la estructura.',
    };
  }

  if (obj.preguntas.length === 0) {
    return {
      exito: false,
      error: 'El archivo debe contener al menos una pregunta.',
    };
  }

  const preguntas: Pregunta[] = [];

  for (let i = 0; i < obj.preguntas.length; i++) {
    const p = obj.preguntas[i] as Record<string, unknown>;
    const numeroPregunta = i + 1;

    /* Validar texto de la pregunta */
    if (!p.pregunta || typeof p.pregunta !== 'string' || p.pregunta.trim().length === 0) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} no tiene texto.`,
      };
    }

    /* Validar opciones */
    if (!p.opciones || !Array.isArray(p.opciones)) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} no tiene opciones. Cada pregunta debe tener entre 2 y 6 opciones.`,
      };
    }

    if (p.opciones.length < 2) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} tiene ${p.opciones.length} opcion(es) (minimo 2).`,
      };
    }

    if (p.opciones.length > 6) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} tiene ${p.opciones.length} opciones (maximo 6). Por favor, reduce el numero de opciones.`,
      };
    }

    /* Validar tipo */
    const tipo: TipoPregunta = p.tipo === 'verdadero_falso' ? 'verdadero_falso' : 'multiple';

    if (tipo === 'verdadero_falso' && p.opciones.length !== 2) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} es de tipo "verdadero_falso" pero tiene ${p.opciones.length} opciones. Debe tener exactamente 2.`,
      };
    }

    /* Validar respuesta correcta */
    if (
      typeof p.respuestaCorrecta !== 'number' ||
      p.respuestaCorrecta < 0 ||
      p.respuestaCorrecta >= p.opciones.length
    ) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} no tiene una respuesta correcta valida. El indice debe estar entre 0 y ${p.opciones.length - 1}.`,
      };
    }

    /* Validar opciones duplicadas */
    const opcionesNormalizadas = (p.opciones as string[]).map(o => o.trim().toLowerCase());
    const opcionesUnicas = new Set(opcionesNormalizadas);
    if (opcionesUnicas.size !== opcionesNormalizadas.length) {
      return {
        exito: false,
        error: `La pregunta #${numeroPregunta} tiene opciones duplicadas. Cada opcion debe ser unica.`,
      };
    }

    preguntas.push({
      id: typeof p.id === 'number' ? p.id : numeroPregunta,
      pregunta: (p.pregunta as string).trim(),
      tipo,
      opciones: (p.opciones as string[]).map(o => String(o).trim()),
      respuestaCorrecta: p.respuestaCorrecta as number,
    });
  }

  return {
    exito: true,
    examen: {
      titulo: typeof obj.titulo === 'string' ? obj.titulo.trim() : undefined,
      descripcion: typeof obj.descripcion === 'string' ? obj.descripcion.trim() : undefined,
      preguntas,
    },
  };
}

/* ========================================================================
 * PARSER MARKDOWN
 * ======================================================================== */

/**
 * Parsea contenido Markdown al modelo Examen.
 * Espera la estructura:
 *   # Titulo (opcional)
 *   Descripcion: texto (opcional)
 *   ## Pregunta N
 *   Texto de la pregunta
 *   - Opcion normal
 *   - **Opcion correcta**
 */
export function parsearMarkdown(contenido: string): ResultadoParsing {
  const lineas = contenido.split('\n').map(l => l.replace(/\r$/, ''));

  let titulo: string | undefined;
  let descripcion: string | undefined;
  const preguntas: Pregunta[] = [];

  let preguntaActual: {
    texto: string;
    opciones: string[];
    respuestaCorrectaIndice: number | null;
    cantidadRespuestasCorrectas: number;
  } | null = null;

  let numeroPregunta = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    /* Lineas vacias se ignoran */
    if (linea.length === 0) continue;

    /* Titulo del examen: # Titulo */
    if (linea.startsWith('# ') && !linea.startsWith('## ')) {
      titulo = linea.substring(2).trim();
      continue;
    }

    /* Descripcion: Descripcion: texto */
    if (linea.toLowerCase().startsWith('descripcion:') || linea.toLowerCase().startsWith('descripción:')) {
      descripcion = linea.substring(linea.indexOf(':') + 1).trim();
      continue;
    }

    /* Nueva pregunta: ## Pregunta N */
    if (linea.startsWith('## ')) {
      /* Finalizar pregunta anterior si existe */
      if (preguntaActual) {
        const resultado = finalizarPreguntaMarkdown(preguntaActual, numeroPregunta);
        if (resultado.error) {
          return { exito: false, error: resultado.error };
        }
        preguntas.push(resultado.pregunta!);
      }

      numeroPregunta++;
      preguntaActual = {
        texto: '',
        opciones: [],
        respuestaCorrectaIndice: null,
        cantidadRespuestasCorrectas: 0,
      };
      continue;
    }

    /* Opcion: - texto o - **texto** */
    if (linea.startsWith('- ') && preguntaActual) {
      let textoOpcion = linea.substring(2).trim();
      let esCorrecta = false;

      /* Detectar respuesta correcta marcada con ** */
      if (textoOpcion.startsWith('**') && textoOpcion.endsWith('**')) {
        textoOpcion = textoOpcion.substring(2, textoOpcion.length - 2).trim();
        esCorrecta = true;
        preguntaActual.cantidadRespuestasCorrectas++;
      }

      if (esCorrecta) {
        preguntaActual.respuestaCorrectaIndice = preguntaActual.opciones.length;
      }

      preguntaActual.opciones.push(textoOpcion);
      continue;
    }

    /* Texto de la pregunta (cualquier linea despues de ## que no sea una opcion) */
    if (preguntaActual && preguntaActual.opciones.length === 0) {
      if (preguntaActual.texto.length > 0) {
        preguntaActual.texto += ' ' + linea;
      } else {
        preguntaActual.texto = linea;
      }
    }
  }

  /* Finalizar ultima pregunta */
  if (preguntaActual) {
    const resultado = finalizarPreguntaMarkdown(preguntaActual, numeroPregunta);
    if (resultado.error) {
      return { exito: false, error: resultado.error };
    }
    preguntas.push(resultado.pregunta!);
  }

  if (preguntas.length === 0) {
    return {
      exito: false,
      error: 'El archivo no contiene preguntas. Asegurate de usar el formato "## Pregunta N" para cada pregunta.',
    };
  }

  return {
    exito: true,
    examen: {
      titulo,
      descripcion,
      preguntas,
    },
  };
}

/**
 * Finaliza y valida una pregunta leida del Markdown.
 * Verifica que tenga texto, opciones y exactamente una respuesta correcta.
 */
function finalizarPreguntaMarkdown(
  preguntaActual: {
    texto: string;
    opciones: string[];
    respuestaCorrectaIndice: number | null;
    cantidadRespuestasCorrectas: number;
  },
  numeroPregunta: number,
): { pregunta?: Pregunta; error?: string } {
  if (preguntaActual.texto.trim().length === 0) {
    return { error: `La pregunta #${numeroPregunta} no tiene texto.` };
  }

  if (preguntaActual.opciones.length < 2) {
    return {
      error: `La pregunta #${numeroPregunta} tiene ${preguntaActual.opciones.length} opcion(es). Cada pregunta debe tener entre 2 y 6 opciones.`,
    };
  }

  if (preguntaActual.opciones.length > 6) {
    return {
      error: `La pregunta #${numeroPregunta} tiene ${preguntaActual.opciones.length} opciones (maximo 6). Por favor, reduce el numero de opciones.`,
    };
  }

  if (preguntaActual.cantidadRespuestasCorrectas === 0) {
    return {
      error: `La pregunta #${numeroPregunta} no tiene una respuesta correcta marcada. Marca una opcion con **negrita**.`,
    };
  }

  if (preguntaActual.cantidadRespuestasCorrectas > 1) {
    return {
      error: `La pregunta #${numeroPregunta} tiene multiples respuestas correctas marcadas. Solo una opcion debe estar en negrita.`,
    };
  }

  /* Validar opciones duplicadas */
  const opcionesNormalizadas = preguntaActual.opciones.map(o => o.trim().toLowerCase());
  const opcionesUnicas = new Set(opcionesNormalizadas);
  if (opcionesUnicas.size !== opcionesNormalizadas.length) {
    return {
      error: `La pregunta #${numeroPregunta} tiene opciones duplicadas. Cada opcion debe ser unica.`,
    };
  }

  /* Determinar tipo */
  const tipo: TipoPregunta = preguntaActual.opciones.length === 2 ? 'verdadero_falso' : 'multiple';

  return {
    pregunta: {
      id: numeroPregunta,
      pregunta: preguntaActual.texto.trim(),
      tipo,
      opciones: preguntaActual.opciones,
      respuestaCorrecta: preguntaActual.respuestaCorrectaIndice!,
    },
  };
}
