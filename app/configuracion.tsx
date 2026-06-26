/**
 * Pantalla de configuracion del examen (ConfigScreen).
 * Permite al usuario configurar los parametros antes de iniciar el examen:
 * cantidad de preguntas, tiempo, aleatoriedad.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

export default function PantallaConfiguracion() {
  const tema = usarTema();
  const router = useRouter();

  /* Estado de la configuracion - los valores reales vendran de la Fase 9 */
  const [cantidadPreguntas, setCantidadPreguntas] = useState('10');
  const [tiempoLimitado, setTiempoLimitado] = useState(false);
  const [segundosPorPregunta, setSegundosPorPregunta] = useState('60');
  const [aleatorizarPreguntas, setAleatorizarPreguntas] = useState(true);
  const [aleatorizarOpciones, setAleatorizarOpciones] = useState(true);

  const totalDisponible = 0; /* Se conectara en Fase 9 */

  const estilos = crearEstilos(tema);

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

      <View style={estilos.contenido}>
        {/* Total disponible */}
        <Text style={[estilos.infoTotal, { color: tema.textoSecundario }]}>
          Total de preguntas disponibles: {totalDisponible}
        </Text>

        {/* Cantidad de preguntas */}
        <View style={[estilos.campo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Text style={[estilos.etiqueta, { color: tema.texto }]}>Cantidad de preguntas</Text>
          <TextInput
            style={[estilos.input, { color: tema.texto, borderColor: tema.borde }]}
            value={cantidadPreguntas}
            onChangeText={setCantidadPreguntas}
            keyboardType="number-pad"
            placeholderTextColor={tema.textoDeshabilitado}
            placeholder="10"
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
                Segundos por pregunta (30-120)
              </Text>
              <TextInput
                style={[estilos.input, { color: tema.texto, borderColor: tema.borde }]}
                value={segundosPorPregunta}
                onChangeText={setSegundosPorPregunta}
                keyboardType="number-pad"
                placeholderTextColor={tema.textoDeshabilitado}
                placeholder="60"
              />
              <Text style={[estilos.tiempoTotal, { color: tema.secundario }]}>
                Tiempo total: {Math.floor((parseInt(cantidadPreguntas) || 0) * (parseInt(segundosPorPregunta) || 0) / 60)}m {((parseInt(cantidadPreguntas) || 0) * (parseInt(segundosPorPregunta) || 0)) % 60}s
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
      </View>

      {/* Boton iniciar */}
      <View style={estilos.piePagina}>
        <TouchableOpacity
          style={[estilos.botonIniciar, { backgroundColor: tema.primario }]}
          onPress={() => {
            /* Se implementara en Fase 9/10 */
            router.push('/examen');
          }}
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
      padding: espaciado.lg,
      gap: espaciado.lg,
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
