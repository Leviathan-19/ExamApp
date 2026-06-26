/**
 * Pantalla de historial de pruebas (HistoryScreen).
 * Muestra las pruebas anteriores de un archivo especifico (maximo 10).
 * Permite revisar o eliminar pruebas pasadas.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

export default function PantallaHistorial() {
  const tema = usarTema();
  const router = useRouter();

  /* Datos skeleton - se conectaran en Fase 16 */
  const historialEjemplo: never[] = [];

  const estilos = crearEstilos(tema);

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

      {/* Contenido */}
      {historialEjemplo.length === 0 ? (
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
          data={historialEjemplo}
          keyExtractor={() => ''}
          renderItem={() => null}
          contentContainerStyle={estilos.lista}
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
  });
}
