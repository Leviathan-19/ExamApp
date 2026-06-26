/**
 * Componente reutilizable de encabezado de pantalla.
 * Proporciona barra superior consistente con boton de volver y titulo.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usarTema } from '@/src/tema';
import { espaciado, fuentes } from '@/src/tema/colores';

interface PropsEncabezado {
  /** Titulo que se muestra en el centro */
  titulo: string;
  /** Texto del boton izquierdo (por defecto "Volver") */
  textoVolver?: string;
  /** Accion personalizada al presionar volver (por defecto router.back()) */
  alPresionarVolver?: () => void;
  /** Si se muestra el boton de volver */
  mostrarVolver?: boolean;
}

export default function Encabezado({
  titulo,
  textoVolver = 'Volver',
  alPresionarVolver,
  mostrarVolver = true,
}: PropsEncabezado) {
  const tema = usarTema();
  const router = useRouter();

  const manejarVolver = () => {
    if (alPresionarVolver) {
      alPresionarVolver();
    } else {
      router.back();
    }
  };

  return (
    <View style={[estilos.contenedor, { borderBottomColor: tema.borde }]}>
      {mostrarVolver ? (
        <TouchableOpacity onPress={manejarVolver} style={estilos.botonVolver} activeOpacity={0.7}>
          <Text style={[estilos.textoVolver, { color: tema.primarioClaro }]}>{textoVolver}</Text>
        </TouchableOpacity>
      ) : (
        <View style={estilos.espaciador} />
      )}
      <Text style={[estilos.titulo, { color: tema.texto }]} numberOfLines={1}>
        {titulo}
      </Text>
      <View style={estilos.espaciador} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderBottomWidth: 1,
  },
  botonVolver: {
    minWidth: 60,
  },
  textoVolver: {
    fontSize: fuentes.md,
    fontWeight: '500',
  },
  titulo: {
    fontSize: fuentes.lg,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  espaciador: {
    minWidth: 60,
  },
});
