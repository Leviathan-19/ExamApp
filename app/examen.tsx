/**
 * Pantalla del examen (ExamScreen).
 * Interfaz principal donde el usuario responde las preguntas una por una.
 * Incluye temporizador, auto-guardado, y finalizacion automatica por tiempo.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { UMBRAL_TIEMPO_BAJO, INTERVALO_GUARDADO_TIEMPO } from '@/src/utils/constants';
import { formatearTiempo } from '@/src/utils/helpers';
import {
  obtenerExamenEnProgreso,
  guardarExamenEnProgreso,
  limpiarExamenEnProgreso,
  guardarEnHistorial,
  registrarRespuesta,
  avanzarPregunta,
  finalizarPorTiempo,
  actualizarTiempo,
  obtenerPreguntaActual,
  esSesionFinalizada,
  generarEstadisticas,
} from '@/src/services';
import { SesionExamen, EntradaHistorial } from '@/src/models';
import { generarId } from '@/src/utils/helpers';

export default function PantallaExamen() {
  const tema = usarTema();
  const router = useRouter();
  const { continuar } = useLocalSearchParams<{ continuar?: string }>();

  const [sesion, setSesion] = useState<SesionExamen | null>(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  const intervaloTemporizador = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervaloGuardado = useRef<ReturnType<typeof setInterval> | null>(null);
  const sesionRef = useRef<SesionExamen | null>(null);

  const estilos = crearEstilos(tema);

  /* Mantener ref sincronizada con el estado */
  useEffect(() => {
    sesionRef.current = sesion;
  }, [sesion]);

  /* Cargar sesion (nueva o reanudada) */
  useEffect(() => {
    const cargar = async () => {
      try {
        const sesionGuardada = await obtenerExamenEnProgreso();
        if (sesionGuardada && sesionGuardada.estado === 'en_progreso') {
          setSesion(sesionGuardada);
          setOpcionSeleccionada(null);
        } else {
          Alert.alert('Error', 'No se encontro el examen.');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error al cargar sesion:', error);
        router.replace('/');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [continuar, router]);

  /* Temporizador */
  useEffect(() => {
    if (!sesion || !sesion.examen.configuracion.tiempoLimitado || sesion.tiempoRestante === null) {
      return;
    }

    if (esSesionFinalizada(sesion)) return;

    intervaloTemporizador.current = setInterval(() => {
      setSesion(prev => {
        if (!prev || prev.tiempoRestante === null || prev.tiempoRestante <= 0) {
          return prev;
        }

        const nuevoTiempo = prev.tiempoRestante - 1;

        if (nuevoTiempo <= 0) {
          /* Tiempo agotado */
          if (intervaloTemporizador.current) {
            clearInterval(intervaloTemporizador.current);
          }
          const sesionFinalizada = finalizarPorTiempo(prev);
          finalizarExamen(sesionFinalizada);
          return sesionFinalizada;
        }

        return actualizarTiempo(prev, nuevoTiempo);
      });
    }, 1000);

    return () => {
      if (intervaloTemporizador.current) {
        clearInterval(intervaloTemporizador.current);
      }
    };
  }, [sesion?.examen.configuracion.tiempoLimitado, sesion?.estado]);

  /* Auto-guardado periodico del tiempo */
  useEffect(() => {
    if (!sesion || !sesion.examen.configuracion.tiempoLimitado) return;

    intervaloGuardado.current = setInterval(() => {
      if (sesionRef.current && sesionRef.current.estado === 'en_progreso') {
        guardarExamenEnProgreso(sesionRef.current);
      }
    }, INTERVALO_GUARDADO_TIEMPO);

    return () => {
      if (intervaloGuardado.current) {
        clearInterval(intervaloGuardado.current);
      }
    };
  }, [sesion?.examen.configuracion.tiempoLimitado]);

  /* Finalizar examen y guardar en historial */
  const finalizarExamen = useCallback(async (sesionFinalizada: SesionExamen) => {
    try {
      const estadisticas = generarEstadisticas(sesionFinalizada);

      const entrada: EntradaHistorial = {
        id: generarId(),
        archivoId: sesionFinalizada.examen.archivoId,
        fecha: Date.now(),
        calificacion: estadisticas.calificacionFinal,
        respuestasCorrectas: estadisticas.respuestasCorrectas,
        respuestasIncorrectas: estadisticas.respuestasIncorrectas,
        tiempoUtilizado: estadisticas.tiempoUtilizado,
        respuestas: sesionFinalizada.respuestas,
        preguntas: sesionFinalizada.examen.preguntas,
      };

      await guardarEnHistorial(entrada);
      await limpiarExamenEnProgreso();

      router.replace({
        pathname: '/resultados',
        params: {
          calificacion: String(estadisticas.calificacionFinal),
          correctas: String(estadisticas.respuestasCorrectas),
          incorrectas: String(estadisticas.respuestasIncorrectas),
          porcentaje: String(estadisticas.porcentajeAcierto),
          tiempoUtilizado: estadisticas.tiempoUtilizado !== null ? String(estadisticas.tiempoUtilizado) : '',
          entradaId: entrada.id,
          archivoId: sesionFinalizada.examen.archivoId,
        },
      });
    } catch (error) {
      console.error('Error al finalizar examen:', error);
    }
  }, [router]);

  /* Manejar seleccion de opcion */
  const manejarSeleccionar = (indice: number) => {
    setOpcionSeleccionada(indice);
  };

  /* Manejar boton siguiente */
  const manejarSiguiente = async () => {
    if (!sesion || opcionSeleccionada === null) return;

    /* Registrar respuesta */
    let sesionActualizada = registrarRespuesta(sesion, opcionSeleccionada);

    /* Avanzar pregunta */
    sesionActualizada = avanzarPregunta(sesionActualizada);

    /* Guardar progreso */
    await guardarExamenEnProgreso(sesionActualizada);

    if (esSesionFinalizada(sesionActualizada)) {
      /* Examen completado */
      if (intervaloTemporizador.current) {
        clearInterval(intervaloTemporizador.current);
      }
      await finalizarExamen(sesionActualizada);
    } else {
      /* Siguiente pregunta */
      setSesion(sesionActualizada);
      setOpcionSeleccionada(null);
    }
  };

  if (cargando || !sesion) return null;

  const pregunta = obtenerPreguntaActual(sesion);
  const totalPreguntas = sesion.examen.preguntas.length;
  const tiempoBajo = sesion.tiempoRestante !== null && sesion.tiempoRestante <= UMBRAL_TIEMPO_BAJO;

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra de progreso y temporizador */}
      <View style={estilos.barraSuperior}>
        <Text style={[estilos.progreso, { color: tema.texto }]}>
          {sesion.preguntaActual + 1} de {totalPreguntas}
        </Text>
        {sesion.examen.configuracion.tiempoLimitado && sesion.tiempoRestante !== null && (
          <Text style={[
            estilos.temporizador,
            { color: tiempoBajo ? tema.error : tema.secundario },
          ]}>
            {formatearTiempo(sesion.tiempoRestante)}
          </Text>
        )}
      </View>

      {/* Barra de progreso visual */}
      <View style={[estilos.barraProgreso, { backgroundColor: tema.borde }]}>
        <View
          style={[
            estilos.barraProgresoRelleno,
            {
              backgroundColor: tema.primario,
              width: `${((sesion.preguntaActual + 1) / totalPreguntas) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Advertencia de tiempo bajo */}
      {tiempoBajo && (
        <View style={[estilos.advertenciaTiempo, { backgroundColor: tema.error + '20' }]}>
          <Text style={[estilos.textoAdvertencia, { color: tema.error }]}>
            Quedan menos de {UMBRAL_TIEMPO_BAJO} segundos
          </Text>
        </View>
      )}

      {/* Pregunta */}
      <View style={estilos.contenidoPregunta}>
        <Text style={[estilos.textoPregunta, { color: tema.texto }]}>
          {pregunta.pregunta}
        </Text>
      </View>

      {/* Opciones */}
      <View style={estilos.zonaOpciones}>
        {pregunta.opciones.map((opcion, indice) => {
          const seleccionada = opcionSeleccionada === indice;
          return (
            <TouchableOpacity
              key={indice}
              style={[
                estilos.opcion,
                {
                  backgroundColor: seleccionada ? tema.primario + '20' : tema.superficie,
                  borderColor: seleccionada ? tema.primario : tema.borde,
                },
              ]}
              onPress={() => manejarSeleccionar(indice)}
              activeOpacity={0.7}
            >
              <View style={[
                estilos.radio,
                {
                  borderColor: seleccionada ? tema.primario : tema.textoSecundario,
                  backgroundColor: seleccionada ? tema.primario : 'transparent',
                },
              ]}>
                {seleccionada && <View style={estilos.radioInterno} />}
              </View>
              <Text style={[estilos.textoOpcion, { color: tema.texto }]}>
                {opcion}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Boton siguiente */}
      <View style={estilos.piePagina}>
        <TouchableOpacity
          style={[
            estilos.botonSiguiente,
            {
              backgroundColor: opcionSeleccionada !== null ? tema.primario : tema.borde,
            },
          ]}
          onPress={manejarSiguiente}
          disabled={opcionSeleccionada === null}
          activeOpacity={0.8}
        >
          <Text style={[
            estilos.textoBotonSiguiente,
            { color: opcionSeleccionada !== null ? '#FFFFFF' : tema.textoDeshabilitado },
          ]}>
            {sesion.preguntaActual === totalPreguntas - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function crearEstilos(tema: ReturnType<typeof usarTema>) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
    },
    barraSuperior: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
    },
    progreso: {
      fontSize: fuentes.md,
      fontWeight: '600',
    },
    temporizador: {
      fontSize: fuentes.lg,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    barraProgreso: {
      height: 4,
      marginHorizontal: espaciado.lg,
      borderRadius: bordes.completo,
      overflow: 'hidden',
    },
    barraProgresoRelleno: {
      height: '100%',
      borderRadius: bordes.completo,
    },
    advertenciaTiempo: {
      marginHorizontal: espaciado.lg,
      marginTop: espaciado.md,
      padding: espaciado.sm,
      borderRadius: bordes.md,
      alignItems: 'center',
    },
    textoAdvertencia: {
      fontSize: fuentes.sm,
      fontWeight: '600',
    },
    contenidoPregunta: {
      paddingHorizontal: espaciado.xl,
      paddingVertical: espaciado.xxl,
    },
    textoPregunta: {
      fontSize: fuentes.xl,
      fontWeight: '500',
      lineHeight: 28,
    },
    zonaOpciones: {
      flex: 1,
      paddingHorizontal: espaciado.lg,
      gap: espaciado.md,
    },
    opcion: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1.5,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: bordes.completo,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: espaciado.md,
    },
    radioInterno: {
      width: 10,
      height: 10,
      borderRadius: bordes.completo,
      backgroundColor: '#FFFFFF',
    },
    textoOpcion: {
      fontSize: fuentes.md,
      flex: 1,
    },
    piePagina: {
      padding: espaciado.lg,
    },
    botonSiguiente: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
    },
    textoBotonSiguiente: {
      fontSize: fuentes.lg,
      fontWeight: '600',
    },
  });
}
