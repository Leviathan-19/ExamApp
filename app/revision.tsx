/**
 * Pantalla de revision de respuestas (ReviewScreen).
 * Muestra cada pregunta con la respuesta del usuario y la respuesta correcta.
 * Permite navegar entre preguntas (adelante y atras).
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

export default function PantallaRevision() {
  const tema = usarTema();
  const router = useRouter();

  /* Estado skeleton - se conectara en Fase 15 */
  const [indicePregunta, setIndicePregunta] = useState(0);

  const totalPreguntas = 10;
  const textoPregunta = 'Pregunta de ejemplo - Se cargara con datos reales';
  const opciones = ['Opcion A', 'Opcion B', 'Opcion C', 'Opcion D'];
  const respuestaUsuario = 0;
  const respuestaCorrecta = 2;

  const estilos = crearEstilos(tema);

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra superior */}
      <View style={estilos.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>Resultados</Text>
        </TouchableOpacity>
        <Text style={[estilos.progreso, { color: tema.texto }]}>
          {indicePregunta + 1} de {totalPreguntas}
        </Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Pregunta */}
      <View style={estilos.contenidoPregunta}>
        <Text style={[estilos.textoPregunta, { color: tema.texto }]}>
          {textoPregunta}
        </Text>
      </View>

      {/* Opciones con colores */}
      <View style={estilos.zonaOpciones}>
        {opciones.map((opcion, indice) => {
          const esRespuestaUsuario = indice === respuestaUsuario;
          const esRespuestaCorrecta = indice === respuestaCorrecta;
          const usuarioAcerto = respuestaUsuario === respuestaCorrecta;

          let colorFondo = tema.superficie;
          let colorBorde = tema.borde;

          if (esRespuestaCorrecta) {
            colorFondo = tema.exito + '20';
            colorBorde = tema.exito;
          } else if (esRespuestaUsuario && !usuarioAcerto) {
            colorFondo = tema.error + '20';
            colorBorde = tema.error;
          }

          return (
            <View
              key={indice}
              style={[
                estilos.opcion,
                { backgroundColor: colorFondo, borderColor: colorBorde },
              ]}
            >
              <Text style={[estilos.textoOpcion, { color: tema.texto }]}>
                {opcion}
              </Text>
              {esRespuestaCorrecta && (
                <Text style={[estilos.indicador, { color: tema.exito }]}>Correcta</Text>
              )}
              {esRespuestaUsuario && !usuarioAcerto && (
                <Text style={[estilos.indicador, { color: tema.error }]}>Tu respuesta</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Navegacion */}
      <View style={estilos.navegacion}>
        <TouchableOpacity
          style={[
            estilos.botonNav,
            {
              backgroundColor: indicePregunta > 0 ? tema.superficie : tema.borde,
              borderColor: tema.borde,
            },
          ]}
          onPress={() => setIndicePregunta(Math.max(0, indicePregunta - 1))}
          disabled={indicePregunta === 0}
          activeOpacity={0.7}
        >
          <Text style={[
            estilos.textoBotonNav,
            { color: indicePregunta > 0 ? tema.texto : tema.textoDeshabilitado },
          ]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            estilos.botonNav,
            {
              backgroundColor: indicePregunta < totalPreguntas - 1 ? tema.superficie : tema.borde,
              borderColor: tema.borde,
            },
          ]}
          onPress={() => setIndicePregunta(Math.min(totalPreguntas - 1, indicePregunta + 1))}
          disabled={indicePregunta >= totalPreguntas - 1}
          activeOpacity={0.7}
        >
          <Text style={[
            estilos.textoBotonNav,
            { color: indicePregunta < totalPreguntas - 1 ? tema.texto : tema.textoDeshabilitado },
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
      borderBottomWidth: 1,
      borderBottomColor: tema.borde,
    },
    textoVolver: {
      fontSize: fuentes.md,
      fontWeight: '500',
    },
    progreso: {
      fontSize: fuentes.md,
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
      justifyContent: 'space-between',
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1.5,
    },
    textoOpcion: {
      fontSize: fuentes.md,
      flex: 1,
    },
    indicador: {
      fontSize: fuentes.xs,
      fontWeight: '600',
      marginLeft: espaciado.sm,
    },
    navegacion: {
      flexDirection: 'row',
      padding: espaciado.lg,
      gap: espaciado.md,
    },
    botonNav: {
      flex: 1,
      paddingVertical: espaciado.md,
      borderRadius: bordes.lg,
      alignItems: 'center',
      borderWidth: 1,
    },
    textoBotonNav: {
      fontSize: fuentes.md,
      fontWeight: '500',
    },
  });
}
