/**
 * Pantalla de inicio (HomeScreen).
 * Menu principal de la aplicacion con acceso a todas las funcionalidades.
 * Muestra banner de "Continuar examen" si hay uno en progreso.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { VERSION_APP } from '@/src/utils/constants';

export default function PantallaInicio() {
  const tema = usarTema();
  const router = useRouter();

  const estilos = crearEstilos(tema);

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      <View style={estilos.contenido}>
        {/* Encabezado */}
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: tema.texto }]}>
            Examen Offline
          </Text>
          <Text style={[estilos.subtitulo, { color: tema.textoSecundario }]}>
            Simulador de examenes sin conexion
          </Text>
        </View>

        {/* Zona de banner para examen en progreso (se activara en Fase 12) */}

        {/* Botones principales */}
        <View style={estilos.zonaBotones}>
          <TouchableOpacity
            style={[estilos.botonPrincipal, { backgroundColor: tema.primario }]}
            onPress={() => {
              /* Se implementara en Fase 5: carga de archivos */
            }}
            activeOpacity={0.8}
          >
            <Text style={estilos.textoBotonPrincipal}>Cargar nuevo archivo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botonSecundario, { backgroundColor: tema.superficie, borderColor: tema.borde }]}
            onPress={() => router.push('/archivos')}
            activeOpacity={0.8}
          >
            <Text style={[estilos.textoBotonSecundario, { color: tema.texto }]}>
              Archivos guardados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botonSecundario, { backgroundColor: tema.superficie, borderColor: tema.borde }]}
            onPress={() => router.push('/ejemplos')}
            activeOpacity={0.8}
          >
            <Text style={[estilos.textoBotonSecundario, { color: tema.texto }]}>
              Ejemplos de formato
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pie */}
        <Text style={[estilos.version, { color: tema.textoDeshabilitado }]}>
          Version {VERSION_APP}
        </Text>
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
      paddingHorizontal: espaciado.xl,
      paddingTop: espaciado.xxxl * 2,
      paddingBottom: espaciado.xl,
      justifyContent: 'space-between',
    },
    encabezado: {
      alignItems: 'center',
      marginBottom: espaciado.xxxl,
    },
    titulo: {
      fontSize: fuentes.xxxl,
      fontWeight: '700',
      marginBottom: espaciado.sm,
    },
    subtitulo: {
      fontSize: fuentes.md,
    },
    zonaBotones: {
      gap: espaciado.lg,
    },
    botonPrincipal: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
    },
    textoBotonPrincipal: {
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
    version: {
      textAlign: 'center',
      fontSize: fuentes.xs,
      marginTop: espaciado.xxxl,
    },
  });
}
