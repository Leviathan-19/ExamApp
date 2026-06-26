/**
 * Pantalla de revision de respuestas (ReviewScreen).
 * Muestra cada pregunta con la respuesta del usuario y la respuesta correcta.
 * Carga los datos desde el historial usando los IDs recibidos por parametros.
 * Permite navegar entre preguntas (adelante y atras).
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { obtenerHistorialPorArchivo } from '@/src/services';
import { EntradaHistorial, PreguntaGenerada } from '@/src/models';

export default function PantallaRevision() {
  const tema = usarTema();
  const router = useRouter();

  const { entradaId, archivoId } = useLocalSearchParams<{
    entradaId: string;
    archivoId: string;
  }>();

  const [entrada, setEntrada] = useState<EntradaHistorial | null>(null);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [cargando, setCargando] = useState(true);

  const estilos = crearEstilos(tema);

  /* Cargar datos de la prueba desde el historial */
  useEffect(() => {
    const cargar = async () => {
      if (!archivoId || !entradaId) {
        router.back();
        return;
      }

      try {
        const historial = await obtenerHistorialPorArchivo(archivoId);
        const encontrada = historial.find(e => e.id === entradaId);

        if (encontrada) {
          setEntrada(encontrada);
        } else {
          router.back();
        }
      } catch (error) {
        console.error('Error al cargar revision:', error);
        router.back();
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [archivoId, entradaId, router]);

  if (cargando) {
    return (
      <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
        <View style={estilos.centrado}>
          <ActivityIndicator color={tema.primario} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entrada || !entrada.preguntas || entrada.preguntas.length === 0) {
    return (
      <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
        <View style={estilos.centrado}>
          <Text style={[estilos.textoVacio, { color: tema.textoSecundario }]}>
            No se encontraron datos de la prueba
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pregunta: PreguntaGenerada = entrada.preguntas[indicePregunta];
  const respuestaUsuario = entrada.respuestas[indicePregunta] ?? null;
  const respuestaCorrecta = pregunta.respuestaCorrecta;
  const totalPreguntas = entrada.preguntas.length;
  const usuarioAcerto = respuestaUsuario === respuestaCorrecta;

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra superior */}
      <View style={estilos.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[estilos.textoVolverBtn, { color: tema.primarioClaro }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[estilos.progreso, { color: tema.texto }]}>
          {indicePregunta + 1} de {totalPreguntas}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Barra de progreso visual */}
      <View style={[estilos.barraProgreso, { backgroundColor: tema.borde }]}>
        <View
          style={[
            estilos.barraProgresoRelleno,
            {
              backgroundColor: tema.primario,
              width: `${((indicePregunta + 1) / totalPreguntas) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Indicador de resultado */}
      <View style={[
        estilos.indicadorResultado,
        { backgroundColor: usuarioAcerto ? tema.exito + '15' : tema.error + '15' },
      ]}>
        <Text style={[
          estilos.textoIndicador,
          { color: usuarioAcerto ? tema.exito : tema.error },
        ]}>
          {usuarioAcerto ? 'Respuesta correcta' : 'Respuesta incorrecta'}
        </Text>
      </View>

      <ScrollView style={estilos.scrollContenido} contentContainerStyle={estilos.contenidoScroll}>
        {/* Pregunta */}
        <View style={estilos.contenidoPregunta}>
          <Text style={[estilos.textoPregunta, { color: tema.texto }]}>
            {pregunta.pregunta}
          </Text>
        </View>

        {/* Opciones con colores */}
        <View style={estilos.zonaOpciones}>
          {pregunta.opciones.map((opcion, indice) => {
            const esRespuestaUsuario = indice === respuestaUsuario;
            const esRespuestaCorrecta = indice === respuestaCorrecta;

            let colorFondo = tema.superficie;
            let colorBorde = tema.borde;
            let etiqueta = '';
            let colorEtiqueta = tema.textoSecundario;

            if (esRespuestaCorrecta) {
              colorFondo = tema.exito + '15';
              colorBorde = tema.exito;
              etiqueta = 'Correcta';
              colorEtiqueta = tema.exito;
            }

            if (esRespuestaUsuario && !usuarioAcerto) {
              colorFondo = tema.error + '15';
              colorBorde = tema.error;
              etiqueta = 'Tu respuesta';
              colorEtiqueta = tema.error;
            }

            if (esRespuestaUsuario && usuarioAcerto) {
              etiqueta = 'Tu respuesta (correcta)';
            }

            if (respuestaUsuario === null && esRespuestaCorrecta) {
              etiqueta = 'Correcta (no respondida)';
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
                {etiqueta.length > 0 && (
                  <Text style={[estilos.etiquetaOpcion, { color: colorEtiqueta }]}>
                    {etiqueta}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

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
          onPress={() => {
            if (indicePregunta > 0) setIndicePregunta(indicePregunta - 1);
          }}
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
          onPress={() => {
            if (indicePregunta < totalPreguntas - 1) setIndicePregunta(indicePregunta + 1);
          }}
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
    centrado: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: espaciado.lg,
    },
    textoVacio: {
      fontSize: fuentes.md,
    },
    textoVolver: {
      fontSize: fuentes.md,
      fontWeight: '500',
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
    textoVolverBtn: {
      fontSize: fuentes.md,
      fontWeight: '500',
    },
    progreso: {
      fontSize: fuentes.md,
      fontWeight: '600',
    },
    barraProgreso: {
      height: 4,
      marginHorizontal: espaciado.lg,
      marginTop: espaciado.md,
      borderRadius: bordes.completo,
      overflow: 'hidden',
    },
    barraProgresoRelleno: {
      height: '100%',
      borderRadius: bordes.completo,
    },
    indicadorResultado: {
      marginHorizontal: espaciado.lg,
      marginTop: espaciado.md,
      padding: espaciado.sm,
      borderRadius: bordes.md,
      alignItems: 'center',
    },
    textoIndicador: {
      fontSize: fuentes.sm,
      fontWeight: '600',
    },
    scrollContenido: {
      flex: 1,
    },
    contenidoScroll: {
      paddingBottom: espaciado.xxl,
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
    etiquetaOpcion: {
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
