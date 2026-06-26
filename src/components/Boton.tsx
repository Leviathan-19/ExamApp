/**
 * Componente de boton principal reutilizable.
 * Soporta estados de carga, deshabilitado y variantes de estilo.
 */

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { usarTema } from '@/src/tema';
import { espaciado, bordes, fuentes } from '@/src/tema/colores';

interface PropsBoton {
  /** Texto del boton */
  texto: string;
  /** Callback al presionar */
  alPresionar: () => void;
  /** Variante visual del boton */
  variante?: 'primario' | 'secundario' | 'peligro';
  /** Si el boton esta deshabilitado */
  deshabilitado?: boolean;
  /** Si el boton muestra indicador de carga */
  cargando?: boolean;
  /** Estilos adicionales para el contenedor */
  estiloContenedor?: ViewStyle;
}

export default function Boton({
  texto,
  alPresionar,
  variante = 'primario',
  deshabilitado = false,
  cargando = false,
  estiloContenedor,
}: PropsBoton) {
  const tema = usarTema();

  const obtenerColores = () => {
    if (deshabilitado) {
      return { fondo: tema.borde, textoColor: tema.textoDeshabilitado };
    }

    switch (variante) {
      case 'primario':
        return { fondo: tema.primario, textoColor: '#FFFFFF' };
      case 'secundario':
        return { fondo: tema.superficie, textoColor: tema.texto, borde: tema.borde };
      case 'peligro':
        return { fondo: tema.error + '20', textoColor: tema.error, borde: tema.error };
    }
  };

  const colores = obtenerColores();

  return (
    <TouchableOpacity
      style={[
        estilos.contenedor,
        {
          backgroundColor: colores.fondo,
          borderColor: colores.borde || colores.fondo,
          borderWidth: variante !== 'primario' ? 1 : 0,
        },
        estiloContenedor,
      ]}
      onPress={alPresionar}
      disabled={deshabilitado || cargando}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color={colores.textoColor} />
      ) : (
        <Text style={[estilos.texto, { color: colores.textoColor }]}>{texto}</Text>
      )}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingVertical: espaciado.lg,
    borderRadius: bordes.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  texto: {
    fontSize: fuentes.lg,
    fontWeight: '600',
  },
});
