/**
 * Pantalla de archivos guardados (FilesScreen).
 * Muestra la lista de archivos de examenes cargados previamente.
 * Permite seleccionar un archivo para iniciar un nuevo examen o ver su historial.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

export default function PantallaArchivos() {
  const tema = usarTema();
  const router = useRouter();

  const estilos = crearEstilos(tema);

  /* Los datos reales se conectaran en la Fase 8 */
  const archivosEjemplo: never[] = [];

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
      {archivosEjemplo.length === 0 ? (
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
          data={archivosEjemplo}
          keyExtractor={() => ''}
          renderItem={() => null}
          contentContainerStyle={estilos.lista}
        />
      )}

      {/* Boton cargar nuevo */}
      <View style={estilos.piePagina}>
        <TouchableOpacity
          style={[estilos.botonCargar, { backgroundColor: tema.primario }]}
          onPress={() => router.back()}
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
