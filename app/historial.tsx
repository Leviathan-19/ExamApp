/**
 * Pantalla de historial de pruebas (HistoryScreen).
 * Muestra las pruebas anteriores de un archivo especifico (maximo 10).
 * Permite revisar o eliminar pruebas pasadas.
 * Recibe archivoId y nombreArchivo por parametros de navegacion.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { obtenerHistorialPorArchivo, eliminarEntradaHistorial } from '@/src/services';
import { EntradaHistorial } from '@/src/models';
import { formatearFecha, formatearTiempo } from '@/src/utils/helpers';

export default function PantallaHistorial() {
  const tema = usarTema();
  const router = useRouter();

  const { archivoId, nombreArchivo } = useLocalSearchParams<{
    archivoId: string;
    nombreArchivo: string;
  }>();

  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);

  const estilos = crearEstilos(tema);

  /* Cargar historial cada vez que la pantalla obtiene foco */
  const cargarHistorial = useCallback(async () => {
    if (!archivoId) return;
    try {
      setCargando(true);
      const entradas = await obtenerHistorialPorArchivo(archivoId);
      setHistorial(entradas);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setCargando(false);
    }
  }, [archivoId]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  /* Eliminar entrada con confirmacion */
  const manejarEliminar = (entrada: EntradaHistorial) => {
    Alert.alert(
      'Eliminar prueba',
      `Se eliminara la prueba del ${formatearFecha(entrada.fecha)}. Esta seguro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarEntradaHistorial(archivoId!, entrada.id);
              await cargarHistorial();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la prueba.');
            }
          },
        },
      ],
    );
  };

  /* Determinar color de calificacion */
  const colorCalificacion = (cal: number) => {
    if (cal >= 14) return tema.exito;
    if (cal >= 10) return tema.advertencia;
    return tema.error;
  };

  /* Renderizar un item de historial */
  const renderizarEntrada = ({ item, index }: { item: EntradaHistorial; index: number }) => (
    <View style={[estilos.tarjetaPrueba, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
      <View style={estilos.encabezadoTarjeta}>
        <Text style={[estilos.numeroPrueba, { color: tema.textoSecundario }]}>
          Prueba #{historial.length - index}
        </Text>
        <Text style={[estilos.fechaPrueba, { color: tema.textoDeshabilitado }]}>
          {formatearFecha(item.fecha)}
        </Text>
      </View>

      <View style={estilos.cuerpoTarjeta}>
        {/* Calificacion */}
        <View style={estilos.calificacionContenedor}>
          <Text style={[estilos.calificacionValor, { color: colorCalificacion(item.calificacion) }]}>
            {item.calificacion.toFixed(1)}
          </Text>
          <Text style={[estilos.calificacionEscala, { color: tema.textoDeshabilitado }]}>/20</Text>
        </View>

        {/* Detalles */}
        <View style={estilos.detallesContenedor}>
          <Text style={[estilos.detalle, { color: tema.exito }]}>
            {item.respuestasCorrectas} correctas
          </Text>
          <Text style={[estilos.detalle, { color: tema.error }]}>
            {item.respuestasIncorrectas} incorrectas
          </Text>
          {item.tiempoUtilizado !== null && (
            <Text style={[estilos.detalle, { color: tema.textoSecundario }]}>
              Tiempo: {formatearTiempo(item.tiempoUtilizado)}
            </Text>
          )}
        </View>
      </View>

      {/* Acciones */}
      <View style={estilos.accionesTarjeta}>
        <TouchableOpacity
          style={[estilos.botonAccion, { borderColor: tema.borde }]}
          onPress={() => router.push({
            pathname: '/revision',
            params: { entradaId: item.id, archivoId: archivoId },
          })}
          activeOpacity={0.7}
        >
          <Text style={[estilos.textoAccion, { color: tema.primarioClaro }]}>Revisar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.botonAccion, { borderColor: tema.error + '40' }]}
          onPress={() => manejarEliminar(item)}
          activeOpacity={0.7}
        >
          <Text style={[estilos.textoAccion, { color: tema.error }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra superior */}
      <View style={estilos.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[estilos.tituloSeccion, { color: tema.texto }]}>Historial</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Nombre del archivo */}
      {nombreArchivo && (
        <View style={estilos.infoArchivo}>
          <Text style={[estilos.nombreArchivo, { color: tema.texto }]} numberOfLines={1}>
            {nombreArchivo}
          </Text>
          <Text style={[estilos.cantidadPruebas, { color: tema.textoSecundario }]}>
            {historial.length} {historial.length === 1 ? 'prueba' : 'pruebas'} registradas
          </Text>
        </View>
      )}

      {/* Contenido */}
      {cargando ? (
        <View style={estilos.vacio}>
          <ActivityIndicator color={tema.primario} size="large" />
        </View>
      ) : historial.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={[estilos.textoVacio, { color: tema.textoSecundario }]}>
            No hay pruebas anteriores
          </Text>
          <Text style={[estilos.textoVacioSub, { color: tema.textoDeshabilitado }]}>
            Completa un examen para que aparezca en el historial
          </Text>
        </View>
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.id}
          renderItem={renderizarEntrada}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={{ height: espaciado.md }} />}
        />
      )}
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
    tituloSeccion: {
      fontSize: fuentes.lg,
      fontWeight: '600',
    },
    infoArchivo: {
      padding: espaciado.lg,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: tema.borde,
    },
    nombreArchivo: {
      fontSize: fuentes.lg,
      fontWeight: '600',
      marginBottom: espaciado.xs,
    },
    cantidadPruebas: {
      fontSize: fuentes.sm,
    },
    vacio: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: espaciado.xxxl,
    },
    textoVacio: {
      fontSize: fuentes.lg,
      fontWeight: '500',
      marginBottom: espaciado.sm,
    },
    textoVacioSub: {
      fontSize: fuentes.sm,
      textAlign: 'center',
    },
    lista: {
      padding: espaciado.lg,
    },
    tarjetaPrueba: {
      borderRadius: bordes.lg,
      borderWidth: 1,
      overflow: 'hidden',
    },
    encabezadoTarjeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: espaciado.lg,
      paddingTop: espaciado.md,
      paddingBottom: espaciado.sm,
    },
    numeroPrueba: {
      fontSize: fuentes.sm,
      fontWeight: '600',
    },
    fechaPrueba: {
      fontSize: fuentes.xs,
    },
    cuerpoTarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espaciado.lg,
      paddingBottom: espaciado.md,
      gap: espaciado.xl,
    },
    calificacionContenedor: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    calificacionValor: {
      fontSize: fuentes.xxxl,
      fontWeight: '700',
    },
    calificacionEscala: {
      fontSize: fuentes.sm,
      marginLeft: 2,
    },
    detallesContenedor: {
      flex: 1,
      gap: 2,
    },
    detalle: {
      fontSize: fuentes.xs,
    },
    accionesTarjeta: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: tema.borde,
    },
    botonAccion: {
      flex: 1,
      paddingVertical: espaciado.md,
      alignItems: 'center',
      borderRightWidth: 1,
    },
    textoAccion: {
      fontSize: fuentes.sm,
      fontWeight: '500',
    },
  });
}
