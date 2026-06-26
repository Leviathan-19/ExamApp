/**
 * Pantalla de inicio (HomeScreen).
 * Menu principal de la aplicacion con acceso a todas las funcionalidades.
 * Integra carga de archivos y deteccion de examen en progreso.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { VERSION_APP, TAMANO_MAXIMO_ARCHIVO } from '@/src/utils/constants';
import {
  parsearArchivo,
  validarExamen,
  guardarArchivo,
  obtenerExamenEnProgreso,
  limpiarExamenEnProgreso,
} from '@/src/services';
import { ArchivoExamen, SesionExamen } from '@/src/models';

export default function PantallaInicio() {
  const tema = usarTema();
  const router = useRouter();

  const [cargando, setCargando] = useState(false);
  const [examenEnProgreso, setExamenEnProgreso] = useState<SesionExamen | null>(null);
  const [verificandoProgreso, setVerificandoProgreso] = useState(true);

  const estilos = crearEstilos(tema);

  /* Verificar si hay un examen en progreso al montar el componente */
  const verificarExamenEnProgreso = useCallback(async () => {
    try {
      const sesion = await obtenerExamenEnProgreso();
      setExamenEnProgreso(sesion);
    } catch (error) {
      console.error('Error al verificar examen en progreso:', error);
    } finally {
      setVerificandoProgreso(false);
    }
  }, []);

  useEffect(() => {
    verificarExamenEnProgreso();
  }, [verificarExamenEnProgreso]);

  /* Flujo de carga de archivo */
  const manejarCargarArchivo = async () => {
    try {
      setCargando(true);

      /* 1. Abrir selector de archivos */
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/markdown', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
        setCargando(false);
        return;
      }

      const archivo = resultado.assets[0];

      /* Validar extension */
      const extension = archivo.name?.toLowerCase().split('.').pop();
      if (extension !== 'json' && extension !== 'md' && extension !== 'markdown') {
        Alert.alert(
          'Error de formato',
          'Solo se aceptan archivos con extension .json o .md',
        );
        setCargando(false);
        return;
      }

      /* Validar tamano */
      if (archivo.size && archivo.size > TAMANO_MAXIMO_ARCHIVO) {
        Alert.alert(
          'Error de archivo',
          `El archivo es demasiado grande (maximo ${TAMANO_MAXIMO_ARCHIVO / (1024 * 1024)}MB).`,
        );
        setCargando(false);
        return;
      }

      /* 2. Leer contenido del archivo */
      const contenido = await FileSystem.readAsStringAsync(archivo.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      /* 3. Parsear contenido */
      const resultadoParsing = parsearArchivo(archivo.name || 'archivo', contenido);

      if (!resultadoParsing.exito || !resultadoParsing.examen) {
        Alert.alert('Error al procesar archivo', resultadoParsing.error || 'Error desconocido');
        setCargando(false);
        return;
      }

      /* 4. Validar examen */
      const resultadoValidacion = validarExamen(resultadoParsing.examen);

      if (!resultadoValidacion.valido) {
        Alert.alert(
          'Error de validacion',
          resultadoValidacion.errores.join('\n\n'),
        );
        setCargando(false);
        return;
      }

      /* 5. Generar hash del contenido para ID unico */
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        contenido,
      );

      /* 6. Guardar archivo */
      const archivoExamen: ArchivoExamen = {
        id: hash,
        nombre: archivo.name || 'Sin nombre',
        totalPreguntas: resultadoParsing.examen.preguntas.length,
        fechaCarga: Date.now(),
        contenido: resultadoParsing.examen,
      };

      await guardarArchivo(archivoExamen);

      /* 7. Navegar a configuracion del examen */
      setCargando(false);
      router.push({
        pathname: '/configuracion',
        params: { archivoId: hash },
      });
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      Alert.alert(
        'Error inesperado',
        'Ocurrio un error al procesar el archivo. Por favor, intenta de nuevo.',
      );
      setCargando(false);
    }
  };

  /* Continuar examen en progreso */
  const manejarContinuarExamen = () => {
    router.push({
      pathname: '/examen',
      params: { continuar: 'true' },
    });
  };

  /* Descartar examen en progreso */
  const manejarDescartarExamen = () => {
    Alert.alert(
      'Descartar examen',
      'Se perdera todo el progreso del examen actual. Esta seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            await limpiarExamenEnProgreso();
            setExamenEnProgreso(null);
          },
        },
      ],
    );
  };

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

        {/* Banner de examen en progreso */}
        {!verificandoProgreso && examenEnProgreso && (
          <View style={[estilos.bannerProgreso, { backgroundColor: tema.primario + '15', borderColor: tema.primario }]}>
            <Text style={[estilos.bannerTitulo, { color: tema.primarioClaro }]}>
              Examen en progreso
            </Text>
            <Text style={[estilos.bannerInfo, { color: tema.textoSecundario }]}>
              {examenEnProgreso.examen.nombreArchivo} - Pregunta {examenEnProgreso.preguntaActual + 1} de {examenEnProgreso.examen.preguntas.length}
            </Text>
            <View style={estilos.bannerBotones}>
              <TouchableOpacity
                style={[estilos.bannerBoton, { backgroundColor: tema.primario }]}
                onPress={manejarContinuarExamen}
                activeOpacity={0.8}
              >
                <Text style={estilos.bannerBotonTexto}>Continuar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.bannerBoton, { backgroundColor: tema.error + '30', borderColor: tema.error, borderWidth: 1 }]}
                onPress={manejarDescartarExamen}
                activeOpacity={0.8}
              >
                <Text style={[estilos.bannerBotonTexto, { color: tema.error }]}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botones principales */}
        <View style={estilos.zonaBotones}>
          <TouchableOpacity
            style={[estilos.botonPrincipal, { backgroundColor: tema.primario }]}
            onPress={manejarCargarArchivo}
            activeOpacity={0.8}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotonPrincipal}>Cargar nuevo archivo</Text>
            )}
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
    bannerProgreso: {
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1,
      marginBottom: espaciado.xxl,
    },
    bannerTitulo: {
      fontSize: fuentes.lg,
      fontWeight: '600',
      marginBottom: espaciado.xs,
    },
    bannerInfo: {
      fontSize: fuentes.sm,
      marginBottom: espaciado.md,
    },
    bannerBotones: {
      flexDirection: 'row',
      gap: espaciado.md,
    },
    bannerBoton: {
      flex: 1,
      paddingVertical: espaciado.sm,
      borderRadius: bordes.md,
      alignItems: 'center',
    },
    bannerBotonTexto: {
      color: '#FFFFFF',
      fontSize: fuentes.sm,
      fontWeight: '600',
    },
    zonaBotones: {
      gap: espaciado.lg,
    },
    botonPrincipal: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
      minHeight: 52,
      justifyContent: 'center',
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
