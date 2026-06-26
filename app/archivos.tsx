/**
 * Pantalla de archivos guardados (FilesScreen).
 * Muestra la lista de archivos de examenes cargados previamente.
 * Permite seleccionar un archivo para iniciar un nuevo examen, ver historial o eliminarlo.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { listarArchivos, eliminarArchivo } from '@/src/services';
import { ArchivoExamen } from '@/src/models';
import { formatearFecha } from '@/src/utils/helpers';

export default function PantallaArchivos() {
  const tema = usarTema();
  const router = useRouter();

  const [archivos, setArchivos] = useState<ArchivoExamen[]>([]);
  const [cargando, setCargando] = useState(true);

  const estilos = crearEstilos(tema);

  /* Cargar archivos cada vez que la pantalla obtiene foco */
  const cargarArchivos = useCallback(async () => {
    try {
      setCargando(true);
      const lista = await listarArchivos();
      setArchivos(lista);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarArchivos();
    }, [cargarArchivos])
  );

  /* Eliminar archivo con confirmacion */
  const manejarEliminar = (archivo: ArchivoExamen) => {
    Alert.alert(
      'Eliminar archivo',
      `Se eliminara "${archivo.nombre}" y todo su historial de pruebas. Esta seguro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarArchivo(archivo.id);
              await cargarArchivos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el archivo.');
            }
          },
        },
      ],
    );
  };

  /* Renderizar un item de archivo */
  const renderizarArchivo = ({ item }: { item: ArchivoExamen }) => (
    <View style={[estilos.tarjetaArchivo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
      <TouchableOpacity
        style={estilos.contenidoTarjeta}
        onPress={() => router.push({ pathname: '/configuracion', params: { archivoId: item.id } })}
        activeOpacity={0.7}
      >
        <Text style={[estilos.nombreArchivo, { color: tema.texto }]} numberOfLines={1}>
          {item.nombre}
        </Text>
        <Text style={[estilos.infoArchivo, { color: tema.textoSecundario }]}>
          {item.totalPreguntas} preguntas
        </Text>
        <Text style={[estilos.fechaArchivo, { color: tema.textoDeshabilitado }]}>
          Cargado: {formatearFecha(item.fechaCarga)}
        </Text>
      </TouchableOpacity>

      <View style={estilos.accionesTarjeta}>
        <TouchableOpacity
          style={[estilos.botonAccion, { borderColor: tema.borde }]}
          onPress={() => router.push({ pathname: '/historial', params: { archivoId: item.id, nombreArchivo: item.nombre } })}
          activeOpacity={0.7}
        >
          <Text style={[estilos.textoAccion, { color: tema.primarioClaro }]}>Historial</Text>
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
        <Text style={[estilos.tituloSeccion, { color: tema.texto }]}>Archivos guardados</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Contenido */}
      {cargando ? (
        <View style={estilos.vacio}>
          <ActivityIndicator color={tema.primario} size="large" />
        </View>
      ) : archivos.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={[estilos.textoVacio, { color: tema.textoSecundario }]}>
            No hay archivos guardados
          </Text>
          <Text style={[estilos.textoVacioSub, { color: tema.textoDeshabilitado }]}>
            Carga un archivo desde la pantalla de inicio para comenzar
          </Text>
        </View>
      ) : (
        <FlatList
          data={archivos}
          keyExtractor={(item) => item.id}
          renderItem={renderizarArchivo}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={{ height: espaciado.md }} />}
        />
      )}

      {/* Boton cargar nuevo */}
      <View style={estilos.piePagina}>
        <TouchableOpacity
          style={[estilos.botonCargar, { backgroundColor: tema.primario }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotonCargar}>Cargar nuevo archivo</Text>
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
    tituloSeccion: {
      fontSize: fuentes.lg,
      fontWeight: '600',
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
    tarjetaArchivo: {
      borderRadius: bordes.lg,
      borderWidth: 1,
      overflow: 'hidden',
    },
    contenidoTarjeta: {
      padding: espaciado.lg,
    },
    nombreArchivo: {
      fontSize: fuentes.lg,
      fontWeight: '600',
      marginBottom: espaciado.xs,
    },
    infoArchivo: {
      fontSize: fuentes.sm,
      marginBottom: espaciado.xs,
    },
    fechaArchivo: {
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
    piePagina: {
      padding: espaciado.lg,
      borderTopWidth: 1,
      borderTopColor: tema.borde,
    },
    botonCargar: {
      paddingVertical: espaciado.md,
      borderRadius: bordes.lg,
      alignItems: 'center',
    },
    textoBotonCargar: {
      color: '#FFFFFF',
      fontSize: fuentes.md,
      fontWeight: '600',
    },
  });
}
