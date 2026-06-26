/**
 * Pantalla de configuracion del examen (ConfigScreen).
 * Permite al usuario configurar los parametros antes de iniciar el examen:
 * cantidad de preguntas, tiempo limitado, aleatoriedad.
 * Genera el examen y navega a la pantalla de examen.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';
import { MIN_SEGUNDOS_POR_PREGUNTA, MAX_SEGUNDOS_POR_PREGUNTA } from '@/src/utils/constants';
import { formatearTiempo } from '@/src/utils/helpers';
import { obtenerArchivoPorId, generarExamen, iniciarSesion, guardarExamenEnProgreso } from '@/src/services';
import { ArchivoExamen, ConfiguracionExamen } from '@/src/models';

export default function PantallaConfiguracion() {
  const tema = usarTema();
  const router = useRouter();
  const { archivoId } = useLocalSearchParams<{ archivoId: string }>();

  const [archivo, setArchivo] = useState<ArchivoExamen | null>(null);
  const [cantidadPreguntas, setCantidadPreguntas] = useState('');
  const [tiempoLimitado, setTiempoLimitado] = useState(false);
  const [segundosPorPregunta, setSegundosPorPregunta] = useState('60');
  const [aleatorizarPreguntas, setAleatorizarPreguntas] = useState(true);
  const [aleatorizarOpciones, setAleatorizarOpciones] = useState(true);

  const estilos = crearEstilos(tema);

  /* Cargar informacion del archivo */
  useEffect(() => {
    const cargar = async () => {
      if (!archivoId) return;
      const arch = await obtenerArchivoPorId(archivoId);
      if (arch) {
        setArchivo(arch);
        setCantidadPreguntas(String(arch.totalPreguntas));
      } else {
        Alert.alert('Error', 'No se encontro el archivo.');
        router.back();
      }
    };
    cargar();
  }, [archivoId, router]);

  /* Calcular tiempo total */
  const tiempoTotal = useMemo(() => {
    if (!tiempoLimitado) return 0;
    const cantidad = parseInt(cantidadPreguntas) || 0;
    const segundos = parseInt(segundosPorPregunta) || 0;
    return cantidad * segundos;
  }, [cantidadPreguntas, segundosPorPregunta, tiempoLimitado]);

  /* Validar e iniciar examen */
  const manejarIniciar = async () => {
    if (!archivo) return;

    const cantidad = parseInt(cantidadPreguntas);

    /* Validar cantidad de preguntas */
    if (isNaN(cantidad) || cantidad < 1 || cantidad > archivo.totalPreguntas) {
      Alert.alert(
        'Error de configuracion',
        `El numero de preguntas debe ser entre 1 y ${archivo.totalPreguntas} (total disponible).`,
      );
      return;
    }

    /* Validar tiempo por pregunta */
    if (tiempoLimitado) {
      const segundos = parseInt(segundosPorPregunta);
      if (isNaN(segundos) || segundos < MIN_SEGUNDOS_POR_PREGUNTA || segundos > MAX_SEGUNDOS_POR_PREGUNTA) {
        Alert.alert(
          'Error de configuracion',
          `El tiempo por pregunta debe ser entre ${MIN_SEGUNDOS_POR_PREGUNTA} y ${MAX_SEGUNDOS_POR_PREGUNTA} segundos.`,
        );
        return;
      }
    }

    /* Crear configuracion */
    const configuracion: ConfiguracionExamen = {
      cantidadPreguntas: cantidad,
      tiempoLimitado,
      segundosPorPregunta: tiempoLimitado ? parseInt(segundosPorPregunta) : 0,
      tiempoTotal,
      aleatorizarPreguntas,
      aleatorizarOpciones,
    };

    /* Generar examen */
    const examenGenerado = generarExamen(
      archivo.contenido,
      configuracion,
      archivo.id,
      archivo.nombre,
    );

    /* Iniciar sesion */
    const sesion = iniciarSesion(examenGenerado);

    /* Guardar en progreso */
    await guardarExamenEnProgreso(sesion);

    /* Navegar al examen */
    router.push({
      pathname: '/examen',
      params: { sesionId: sesion.id },
    });
  };

  if (!archivo) return null;

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra superior */}
      <View style={estilos.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[estilos.tituloSeccion, { color: tema.texto }]}>Configuracion</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoScroll}>
        {/* Nombre del archivo */}
        <Text style={[estilos.nombreArchivo, { color: tema.texto }]} numberOfLines={1}>
          {archivo.nombre}
        </Text>

        {/* Total disponible */}
        <Text style={[estilos.infoTotal, { color: tema.textoSecundario }]}>
          Total de preguntas disponibles: {archivo.totalPreguntas}
        </Text>

        {/* Cantidad de preguntas */}
        <View style={[estilos.campo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Text style={[estilos.etiqueta, { color: tema.texto }]}>Cantidad de preguntas</Text>
          <TextInput
            style={[estilos.input, { color: tema.texto, borderColor: tema.borde, backgroundColor: tema.fondo }]}
            value={cantidadPreguntas}
            onChangeText={setCantidadPreguntas}
            keyboardType="number-pad"
            placeholderTextColor={tema.textoDeshabilitado}
            placeholder={`1 - ${archivo.totalPreguntas}`}
          />
        </View>

        {/* Tiempo limitado */}
        <View style={[estilos.campo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <View style={estilos.filaSwitch}>
            <Text style={[estilos.etiqueta, { color: tema.texto }]}>Tiempo limitado</Text>
            <Switch
              value={tiempoLimitado}
              onValueChange={setTiempoLimitado}
              trackColor={{ false: tema.borde, true: tema.primarioClaro }}
              thumbColor={tiempoLimitado ? tema.primario : tema.textoSecundario}
            />
          </View>
          {tiempoLimitado && (
            <View style={estilos.subCampo}>
              <Text style={[estilos.subEtiqueta, { color: tema.textoSecundario }]}>
                Segundos por pregunta ({MIN_SEGUNDOS_POR_PREGUNTA}-{MAX_SEGUNDOS_POR_PREGUNTA})
              </Text>
              <TextInput
                style={[estilos.input, { color: tema.texto, borderColor: tema.borde, backgroundColor: tema.fondo }]}
                value={segundosPorPregunta}
                onChangeText={setSegundosPorPregunta}
                keyboardType="number-pad"
                placeholderTextColor={tema.textoDeshabilitado}
                placeholder="60"
              />
              <Text style={[estilos.tiempoTotal, { color: tema.secundario }]}>
                Tiempo total: {formatearTiempo(tiempoTotal)}
              </Text>
            </View>
          )}
        </View>

        {/* Aleatorizar preguntas */}
        <View style={[estilos.campo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <View style={estilos.filaSwitch}>
            <Text style={[estilos.etiqueta, { color: tema.texto }]}>Aleatorizar preguntas</Text>
            <Switch
              value={aleatorizarPreguntas}
              onValueChange={setAleatorizarPreguntas}
              trackColor={{ false: tema.borde, true: tema.primarioClaro }}
              thumbColor={aleatorizarPreguntas ? tema.primario : tema.textoSecundario}
            />
          </View>
        </View>

        {/* Aleatorizar opciones */}
        <View style={[estilos.campo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <View style={estilos.filaSwitch}>
            <Text style={[estilos.etiqueta, { color: tema.texto }]}>Aleatorizar opciones</Text>
            <Switch
              value={aleatorizarOpciones}
              onValueChange={setAleatorizarOpciones}
              trackColor={{ false: tema.borde, true: tema.primarioClaro }}
              thumbColor={aleatorizarOpciones ? tema.primario : tema.textoSecundario}
            />
          </View>
        </View>
      </ScrollView>

      {/* Boton iniciar */}
      <View style={estilos.piePagina}>
        <TouchableOpacity
          style={[estilos.botonIniciar, { backgroundColor: tema.primario }]}
          onPress={manejarIniciar}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotonIniciar}>Iniciar examen</Text>
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
    contenido: {
      flex: 1,
    },
    contenidoScroll: {
      padding: espaciado.lg,
      gap: espaciado.lg,
    },
    nombreArchivo: {
      fontSize: fuentes.xl,
      fontWeight: '600',
      textAlign: 'center',
    },
    infoTotal: {
      fontSize: fuentes.sm,
      textAlign: 'center',
      marginBottom: espaciado.sm,
    },
    campo: {
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1,
    },
    etiqueta: {
      fontSize: fuentes.md,
      fontWeight: '500',
      marginBottom: espaciado.sm,
    },
    subEtiqueta: {
      fontSize: fuentes.sm,
      marginBottom: espaciado.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: bordes.md,
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      fontSize: fuentes.md,
    },
    filaSwitch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subCampo: {
      marginTop: espaciado.md,
    },
    tiempoTotal: {
      fontSize: fuentes.sm,
      marginTop: espaciado.sm,
      fontWeight: '600',
    },
    piePagina: {
      padding: espaciado.lg,
      borderTopWidth: 1,
      borderTopColor: tema.borde,
    },
    botonIniciar: {
      paddingVertical: espaciado.lg,
      borderRadius: bordes.lg,
      alignItems: 'center',
    },
    textoBotonIniciar: {
      color: '#FFFFFF',
      fontSize: fuentes.lg,
      fontWeight: '600',
    },
  });
}
