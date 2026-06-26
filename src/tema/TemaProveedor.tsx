/**
 * Hook y contexto para manejar el tema de la aplicacion.
 * Proporciona acceso al tema actual (oscuro/claro) en toda la app.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { temaOscuro, temaClaro, Tema } from './colores';

/** Contexto del tema */
const ContextoTema = createContext<Tema>(temaOscuro);

/** Props del proveedor de tema */
interface PropsTemaProveedor {
  children: React.ReactNode;
  /** Forzar un tema especifico, independiente del sistema */
  forzarOscuro?: boolean;
}

/**
 * Proveedor del tema que envuelve la aplicacion.
 * Detecta el esquema de color del sistema y provee el tema correspondiente.
 */
export function TemaProveedor({ children, forzarOscuro }: PropsTemaProveedor) {
  const esquemaColor = useColorScheme();

  const tema = useMemo(() => {
    if (forzarOscuro !== undefined) {
      return forzarOscuro ? temaOscuro : temaClaro;
    }
    return esquemaColor === 'dark' ? temaOscuro : temaClaro;
  }, [esquemaColor, forzarOscuro]);

  return (
    <ContextoTema.Provider value={tema}>
      {children}
    </ContextoTema.Provider>
  );
}

/**
 * Hook para acceder al tema actual desde cualquier componente.
 * Retorna el objeto Tema con todos los colores y tokens de diseno.
 */
export function usarTema(): Tema {
  return useContext(ContextoTema);
}
