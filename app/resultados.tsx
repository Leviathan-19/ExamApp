/**
 * Pantalla de resultados (ResultsScreen).
 * Muestra la calificacion final, estadisticas y opciones post-examen.
 * Recibe datos por parametros de navegacion desde la pantalla de examen.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { formatearTiempo } from '@/src/utils/helpers';

export default function PantallaResultados() {
  const tema = usarTema();
  const router = useRouter();

  const params = useLocalSearchParams<{
    calificacion: string;
    correctas: string;
    incorrectas: string;
    porcentaje: string;
    tiempoUtilizado: string;
    entradaId: string;
    archivoId: string;
  }>();

  const calificacion = parseFloat(params.calificacion) || 0;
  const correctas = parseInt(params.correctas) || 0;
  const incorrectas = parseInt(params.incorrectas) || 0;
  const porcentaje = parseFloat(params.porcentaje) || 0;
  const tiempoUtilizado = params.tiempoUtilizado ? parseInt(params.tiempoUtilizado) : null;

  const estilos = crearEstilos(tema);

  /* Determinar color de calificacion segun resultado */
  const colorCalificacion = calificacion >= 14 ? tema.exito : calificacion >= 10 ? tema.advertencia : tema.error;

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      <View style={estilos.contenido}>
        {/* Titulo */}
        <Text style={[estilos.titulo, { color: tema.texto }]}>
          Examen finalizado
        </Text>

        {/* Calificacion principal */}
        <View style={[estilos.tarjetaCalificacion, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Text style={[estilos.calificacionNumero, { color: colorCalificacion }]}>
            {calificacion.toFixed(1)}
          </Text>
          <Text style={[estilos.calificacionEscala, { color: tema.textoSecundario }]}>
            / 20
          </Text>
        </View>

        {/* Estadisticas */}
        <View style={estilos.estadisticas}>
          <View style={[estilos.tarjetaEstadistica, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
            <Text style={[estilos.estadisticaValor, { color: tema.exito }]}>{correctas}</Text>
            <Text style={[estilos.estadisticaEtiqueta, { color: tema.textoSecundario }]}>Correctas</Text>
          </View>
          <View style={[estilos.tarjetaEstadistica, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
            <Text style={[estilos.estadisticaValor, { color: tema.error }]}>{incorrectas}</Text>
            <Text style={[estilos.estadisticaEtiqueta, { color: tema.textoSecundario }]}>Incorrectas</Text>
          </View>
          <View style={[estilos.tarjetaEstadistica, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
            <Text style={[estilos.estadisticaValor, { color: tema.info }]}>{porcentaje}%</Text>
            <Text style={[estilos.estadisticaEtiqueta, { color: tema.textoSecundario }]}>Acierto</Text>
          </View>
        </View>

        {/* Tiempo utilizado */}
        {tiempoUtilizado !== null && (
          <Text style={[estilos.tiempo, { color: tema.textoSecundario }]}>
            Tiempo utilizado: {formatearTiempo(tiempoUtilizado)}
          </Text>
        )}
      </View>

      {/* Botones */}
      <View style={estilos.zonaBotones}>
        <TouchableOpacity
          style={[estilos.botonPrimario, { backgroundColor: tema.primario }]}
          onPress={() => router.push({
            pathname: '/revision',
            params: {
              entradaId: params.entradaId,
              archivoId: params.archivoId,
            },
          })}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotonPrimario}>Revisar prueba</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.botonSecundario, { backgroundColor: tema.superficie, borderColor: tema.borde }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={[estilos.textoBotonSecundario, { color: tema.texto }]}>
            Menu principal
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
    contenido: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: espaciado.xl,
    },
    titulo: {
      fontSize: fuentes.encabezado,
      fontWeight: '600',
      marginBottom: espaciado.xxxl,
    },
    tarjetaCalificacion: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      padding: espaciado.xxxl,
      borderRadius: bordes.xl,
      borderWidth: 1,
      marginBottom: espaciado.xxxl,
      width: '100%',
    },
    calificacionNumero: {
      fontSize: 64,
      fontWeight: '700',
    },
    calificacionEscala: {
      fontSize: fuentes.xxl,
      fontWeight: '400',
      marginLeft: espaciado.sm,
    },
    estadisticas: {
      flexDirection: 'row',
      gap: espaciado.md,
      width: '100%',
      marginBottom: espaciado.xxl,
    },
    tarjetaEstadistica: {
      flex: 1,
      alignItems: 'center',
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1,
    },
    estadisticaValor: {
      fontSize: fuentes.xxl,
      fontWeight: '700',
      marginBottom: espaciado.xs,
    },
    estadisticaEtiqueta: {
      fontSize: fuentes.xs,
    },
    tiempo: {
      fontSize: fuentes.sm,
    },
    zonaBotones: {
      padding: espaciado.lg,
      gap: espaciado.md,
    },
    botonPrimario: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
    },
    textoBotonPrimario: {
      color: '#FFFFFF',
      fontSize: fuentes.lg,
      fontWeight: '600',
    },
    botonSecundario: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
      borderWidth: 1,
    },
    textoBotonSecundario: {
      fontSize: fuentes.lg,
      fontWeight: '500',
    },
  });
}
