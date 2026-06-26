/**
 * Pantalla del examen (ExamScreen).
 * Interfaz principal donde el usuario responde las preguntas una por una.
 * Muestra temporizador si esta habilitado, indicador de progreso y opciones de respuesta.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

export default function PantallaExamen() {
  const tema = usarTema();
  const router = useRouter();

  /* Estado skeleton - se conectara con ExamEngineService en Fase 11 */
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);

  const preguntaActual = 1;
  const totalPreguntas = 10;
  const textoPregunta = 'Pregunta de ejemplo - Se cargara con datos reales';
  const opciones = ['Opcion A', 'Opcion B', 'Opcion C', 'Opcion D'];

  const estilos = crearEstilos(tema);

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra de progreso y temporizador */}
      <View style={estilos.barraSuperior}>
        <Text style={[estilos.progreso, { color: tema.texto }]}>
          {preguntaActual} de {totalPreguntas}
        </Text>
        <Text style={[estilos.temporizador, { color: tema.secundario }]}>
          --:--
        </Text>
      </View>

      {/* Barra de progreso visual */}
      <View style={[estilos.barraProgreso, { backgroundColor: tema.borde }]}>
        <View
          style={[
            estilos.barraProgresoRelleno,
            {
              backgroundColor: tema.primario,
              width: `${(preguntaActual / totalPreguntas) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Pregunta */}
      <View style={estilos.contenidoPregunta}>
        <Text style={[estilos.textoPregunta, { color: tema.texto }]}>
          {textoPregunta}
        </Text>
      </View>

      {/* Opciones */}
      <View style={estilos.zonaOpciones}>
        {opciones.map((opcion, indice) => {
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
              onPress={() => setOpcionSeleccionada(indice)}
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
          onPress={() => {
            /* Se implementara en Fase 11 */
            router.push('/resultados');
          }}
          disabled={opcionSeleccionada === null}
          activeOpacity={0.8}
        >
          <Text style={[
            estilos.textoBotonSiguiente,
            { color: opcionSeleccionada !== null ? '#FFFFFF' : tema.textoDeshabilitado },
          ]}>
            Siguiente
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
