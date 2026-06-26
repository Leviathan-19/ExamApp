/**
 * Layout raiz de la aplicacion.
 * Configura la navegacion Stack principal y el proveedor de tema.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { TemaProveedor } from '@/src/tema';

export default function LayoutRaiz() {
  return (
    <TemaProveedor forzarOscuro={true}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="archivos" />
        <Stack.Screen name="configuracion" />
        <Stack.Screen name="examen" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="resultados" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="revision" />
        <Stack.Screen name="historial" />
        <Stack.Screen name="ejemplos" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </TemaProveedor>
  );
}
