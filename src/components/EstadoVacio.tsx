/**
 * Componente de estado vacio reutilizable.
 * Muestra un mensaje centrado cuando una lista no tiene elementos.
 */

import { View, Text, StyleSheet } from 'react-native';
import { usarTema } from '@/src/tema';
import { espaciado, fuentes } from '@/src/tema/colores';

interface PropsEstadoVacio {
  /** Titulo del estado vacio */
  titulo: string;
  /** Descripcion o instrucciones adicionales */
  descripcion?: string;
}

export default function EstadoVacio({ titulo, descripcion }: PropsEstadoVacio) {
  const tema = usarTema();

  return (
    <View style={estilos.contenedor}>
      <Text style={[estilos.titulo, { color: tema.textoSecundario }]}>{titulo}</Text>
      {descripcion && (
        <Text style={[estilos.descripcion, { color: tema.textoDeshabilitado }]}>
          {descripcion}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: espaciado.xxxl,
  },
  titulo: {
    fontSize: fuentes.lg,
    fontWeight: '500',
    marginBottom: espaciado.sm,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: fuentes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
