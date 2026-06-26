/**
 * Pantalla de ejemplos de formato (EjemplosScreen).
 * Modal que muestra ejemplos de archivos JSON y Markdown validos.
 * Ayuda al usuario a entender como estructurar sus archivos de preguntas.
 */

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

const EJEMPLO_JSON = `{
  "titulo": "Examen de Geografia",
  "descripcion": "Preguntas sobre capitales",
  "preguntas": [
    {
      "id": 1,
      "pregunta": "Cual es la capital de Francia?",
      "tipo": "multiple",
      "opciones": [
        "Madrid",
        "Londres",
        "Paris",
        "Berlin"
      ],
      "respuestaCorrecta": 2
    },
    {
      "id": 2,
      "pregunta": "La Tierra es plana",
      "tipo": "verdadero_falso",
      "opciones": ["Verdadero", "Falso"],
      "respuestaCorrecta": 1
    }
  ]
}`;

const EJEMPLO_MARKDOWN = `# Examen de Geografia
Descripcion: Preguntas sobre capitales

## Pregunta 1
Cual es la capital de Francia?
- Madrid
- Londres
- **Paris**
- Berlin

## Pregunta 2
La Tierra es plana
- Verdadero
- **Falso**`;

export default function PantallaEjemplos() {
  const tema = usarTema();
  const router = useRouter();

  const estilos = crearEstilos(tema);

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: tema.fondo }]}>
      {/* Barra superior */}
      <View style={estilos.barraSuperior}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>Cerrar</Text>
        </TouchableOpacity>
        <Text style={[estilos.tituloSeccion, { color: tema.texto }]}>Ejemplos de formato</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoScroll}>
        {/* Ejemplo JSON */}
        <Text style={[estilos.tituloFormato, { color: tema.primarioClaro }]}>
          Formato JSON (.json)
        </Text>
        <Text style={[estilos.descripcionFormato, { color: tema.textoSecundario }]}>
          Usa respuestaCorrecta con el indice (base 0) de la opcion correcta.
        </Text>
        <View style={[estilos.bloquecodigo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Text style={[estilos.codigo, { color: tema.texto }]}>
            {EJEMPLO_JSON}
          </Text>
        </View>

        {/* Ejemplo Markdown */}
        <Text style={[estilos.tituloFormato, { color: tema.primarioClaro }]}>
          Formato Markdown (.md)
        </Text>
        <Text style={[estilos.descripcionFormato, { color: tema.textoSecundario }]}>
          Marca la respuesta correcta con **negrita** (doble asterisco).
        </Text>
        <View style={[estilos.bloquecodigo, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Text style={[estilos.codigo, { color: tema.texto }]}>
            {EJEMPLO_MARKDOWN}
          </Text>
        </View>
      </ScrollView>
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
      paddingBottom: espaciado.xxxl * 2,
    },
    tituloFormato: {
      fontSize: fuentes.xl,
      fontWeight: '600',
      marginTop: espaciado.xxl,
      marginBottom: espaciado.sm,
    },
    descripcionFormato: {
      fontSize: fuentes.sm,
      marginBottom: espaciado.md,
    },
    bloquecodigo: {
      padding: espaciado.lg,
      borderRadius: bordes.lg,
      borderWidth: 1,
      marginBottom: espaciado.xxl,
    },
    codigo: {
      fontSize: fuentes.xs,
      fontFamily: 'monospace',
      lineHeight: 18,
    },
  });
}
