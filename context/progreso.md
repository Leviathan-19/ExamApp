# Progreso del Proyecto: Examen Offline App

**Ultima actualizacion:** 26 de Junio de 2026

---

## Estado General

El proyecto se encuentra en la **Fase 14 en progreso** de 19 fases totales.
Las Fases 1-13 estan completadas (Bloques A, B y C). Se esta finalizando el Bloque D (Pantallas Finales).

---

## Fases Completadas

### Fase 1: Preparacion del Proyecto

**Estado:** Completada

Se partio de un proyecto Expo SDK 54 con TypeScript ya inicializado.
Se instalaron las dependencias adicionales necesarias:

- `@react-native-async-storage/async-storage` - Almacenamiento local persistente
- `expo-document-picker` - Selector de archivos del dispositivo
- `expo-file-system` - Lectura de contenido de archivos
- `expo-crypto` - Generacion de hashes SHA-256 para identificar archivos

---

### Fase 2: Arquitectura General

**Estado:** Completada

Se creo la estructura de carpetas `src/` con modelos, utilidades y sistema de temas.

#### Modelos creados (`src/models/`)

| Archivo | Contenido |
|---|---|
| `Exam.ts` | Interfaces `Pregunta`, `Examen`, tipo `TipoPregunta` |
| `ExamSession.ts` | Interfaces `ConfiguracionExamen`, `PreguntaGenerada`, `ExamenGenerado`, `SesionExamen` |
| `HistoryEntry.ts` | Interfaces `ArchivoExamen`, `Estadisticas`, `EntradaHistorial` |
| `index.ts` | Barrel export de todos los modelos |

#### Utilidades creadas (`src/utils/`)

| Archivo | Contenido |
|---|---|
| `constants.ts` | Constantes globales: limites de opciones (2-6), preguntas (1-1000), tiempo (30-120s), escala (20 pts), claves de AsyncStorage, etc. |
| `helpers.ts` | Funciones: `barajar()` (Fisher-Yates), `generarId()`, `formatearTiempo()`, `formatearFecha()`, `redondearUnDecimal()` |

#### Sistema de temas (`src/tema/`)

| Archivo | Contenido |
|---|---|
| `colores.ts` | Paleta completa basada en `paleta.json`: primarios (violeta), secundarios (cyan), retroalimentacion (verde/rojo/amarillo/azul), neutrales (grises), temas oscuro y claro, tokens de espaciado, bordes y fuentes |
| `TemaProveedor.tsx` | Contexto React + hook `usarTema()` para acceso global al tema. Soporta deteccion automatica del esquema del sistema o tema forzado |
| `index.ts` | Barrel export |

---

### Fase 3: Skeleton de Interfaz

**Estado:** Completada y verificada (compilacion exitosa)

#### Cambios en la navegacion

- Se elimino la estructura de tabs por defecto (`app/(tabs)/`)
- Se elimino el archivo `app/modal.tsx`
- Se eliminaron componentes por defecto no usados (`hello-wave`, `parallax-scroll-view`, `external-link`)
- Se reemplazo `app/_layout.tsx` con un Stack navigator raiz
- La app usa tema oscuro forzado con animacion `slide_from_right`
- Las pantallas de examen y resultados no permiten gesto de retroceso

#### Pantallas creadas (8 rutas)

| Archivo | Pantalla | Ruta |
|---|---|---|
| `app/index.tsx` | Inicio (Home) | `/` |
| `app/archivos.tsx` | Archivos guardados | `/archivos` |
| `app/configuracion.tsx` | Configuracion | `/configuracion` |
| `app/examen.tsx` | Examen | `/examen` |
| `app/resultados.tsx` | Resultados | `/resultados` |
| `app/revision.tsx` | Revision | `/revision` |
| `app/historial.tsx` | Historial | `/historial` |
| `app/ejemplos.tsx` | Ejemplos (modal) | `/ejemplos` |

#### Verificacion

Compilacion exitosa con `npx expo export --platform web`:
- 10 rutas estaticas generadas
- 1006 modulos web empaquetados
- Sin errores de compilacion

---

### Fase 4: Persistencia Local (StorageService)

**Estado:** Completada

Se implemento `src/services/StorageService.ts` con CRUD completo:

**Gestion de archivos:**
- `obtenerArchivos()` - Obtiene todos los archivos guardados
- `listarArchivos()` - Lista ordenada por fecha (mas reciente primero)
- `obtenerArchivoPorId()` - Busca un archivo por su hash
- `guardarArchivo()` - Guarda o actualiza un archivo
- `eliminarArchivo()` - Elimina archivo y su historial asociado

**Gestion de examen en progreso:**
- `guardarExamenEnProgreso()` - Persiste el estado actual de la sesion
- `obtenerExamenEnProgreso()` - Recupera sesion con verificacion de expiracion (7 dias)
- `limpiarExamenEnProgreso()` - Elimina la sesion guardada

**Gestion de historial:**
- `obtenerHistorialPorArchivo()` - Historial de un archivo especifico
- `guardarEnHistorial()` - Guarda nueva entrada (limite 10 por archivo)
- `eliminarEntradaHistorial()` - Elimina una prueba del historial

**Utilidades:**
- `limpiarTodosLosDatos()` - Borra todo el almacenamiento de la app

---

### Fase 5: Carga de Archivos

**Estado:** Completada

Integrada directamente en la pantalla de inicio (`app/index.tsx`):

1. Abre `expo-document-picker` filtrando por `.json` y `.md`
2. Valida extension y tamano (max 10MB)
3. Lee contenido con `expo-file-system` (codificacion UTF-8)
4. Parsea con `ParserService`
5. Valida con `ValidationService`
6. Genera hash SHA-256 con `expo-crypto` para ID unico
7. Guarda en AsyncStorage con `StorageService`
8. Navega a pantalla de configuracion con el ID del archivo

---

### Fase 6: Parser (JSON y Markdown)

**Estado:** Completada

Se implemento `src/services/ParserService.ts` con dos parsers independientes:

**Parser JSON (`parsearJSON`):**
- Usa `JSON.parse()` nativo
- Mapea a modelo `Examen` validando cada campo
- Valida: texto, opciones (2-6), tipo, respuesta correcta (indice valido), duplicados
- Mensajes de error especificos por pregunta

**Parser Markdown (`parsearMarkdown`):**
- Parser personalizado linea por linea
- Detecta titulo (`# Titulo`) y descripcion (`Descripcion: ...`)
- Detecta preguntas (`## Pregunta N`)
- Extrae opciones (`- texto`)
- Detecta respuesta correcta (`- **texto**`)
- Valida multiples respuestas correctas, opciones duplicadas, etc.

**Deteccion automatica (`detectarFormato`):**
- Por extension del archivo (.json, .md)
- Por contenido si la extension no es reconocida

---

### Fase 7: Validacion de Archivos

**Estado:** Completada

Se implemento `src/services/ValidationService.ts`:

- `validarExamen()` - Valida examen completo, reporta TODOS los errores (no se detiene en el primero)
- `validarPregunta()` - Valida pregunta individual
- `validarOpciones()` - Valida opciones de una pregunta

Validaciones implementadas:
1. Array de preguntas no vacio
2. Limite maximo de 1000 preguntas
3. IDs unicos
4. Texto de pregunta presente
5. Opciones presentes (2-6)
6. Tipo coherente (verdadero_falso = 2 opciones)
7. Respuesta correcta con indice valido
8. Opciones no vacias
9. Sin opciones duplicadas

---

### Fase 8: Gestion de Archivos Guardados

**Estado:** Completada

Se actualizo `app/archivos.tsx` con funcionalidad real:

- Lista de archivos desde AsyncStorage, ordenados por fecha
- Cada tarjeta muestra: nombre, total preguntas, fecha de carga
- Boton "Historial" por archivo (navega a `/historial`)
- Boton "Eliminar" con confirmacion (Alert)
- Al tocar un archivo navega a `/configuracion`
- Recarga automatica al volver a la pantalla (`useFocusEffect`)
- Estado de carga con `ActivityIndicator`
- Estado vacio con mensaje informativo

---

### Fase 9: Configuracion del Examen

**Estado:** Completada

Se actualizo `app/configuracion.tsx` con funcionalidad real:

- Carga informacion del archivo por ID (parametro de navegacion)
- Muestra nombre del archivo y total de preguntas disponibles
- Input numerico para cantidad de preguntas (validado contra total)
- Switch para tiempo limitado + input segundos por pregunta (30-120)
- Calculo automatico de tiempo total con `formatearTiempo()`
- Switches para aleatorizar preguntas y opciones (por defecto ON)
- Validaciones al presionar "Iniciar examen"
- Genera examen con `ExamGeneratorService`
- Inicia sesion con `ExamEngineService`
- Guarda sesion en progreso
- Navega a pantalla de examen

---

### Fase 10: Generador del Examen

**Estado:** Completada

Se implemento `src/services/ExamGeneratorService.ts`:

- `generarExamen()` - Funcion principal que recibe examen + configuracion
- Selecciona N preguntas aleatorias del pool (Fisher-Yates parcial)
- Baraja orden de preguntas si esta habilitado
- Aleatoriza opciones dentro de cada pregunta:
  - Reordena opciones
  - Ajusta `respuestaCorrecta` para que siga apuntando a la opcion correcta
  - Guarda `mapeoOpciones` para reconstruir el orden original
- Genera `ExamenGenerado` con metadatos (archivoId, nombre, fecha, configuracion)

---

### Fase 11: Motor del Examen

**Estado:** Completada

Se implemento `src/services/ExamEngineService.ts` (funciones puras e inmutables):

- `iniciarSesion()` - Crea nueva sesion con respuestas inicializadas en null
- `registrarRespuesta()` - Guarda la opcion seleccionada para la pregunta actual
- `avanzarPregunta()` - Avanza a la siguiente o marca como finalizado
- `finalizarPorTiempo()` - Finaliza por tiempo agotado
- `actualizarTiempo()` - Actualiza tiempo restante
- `esSesionFinalizada()` - Verifica si el examen termino
- `obtenerPreguntaActual()` - Retorna la pregunta en curso

Se actualizo `app/examen.tsx` con funcionalidad completa:

- Carga sesion desde AsyncStorage (nueva o reanudada)
- Muestra pregunta actual con indicador "X de Y"
- Radio buttons para opciones (violeta al seleccionar)
- Barra de progreso visual animada
- Temporizador con `setInterval` (actualiza cada segundo)
- Advertencia visual cuando quedan menos de 30 segundos
- Auto-guardado periodico del tiempo cada 5 segundos
- Finalizacion automatica cuando el tiempo se agota
- Boton "Siguiente" deshabilitado sin seleccion
- Boton cambia a "Finalizar" en la ultima pregunta
- Al finalizar: calcula estadisticas, guarda en historial, limpia progreso

---

### Fase 12: Persistencia Automatica y Recuperacion

**Estado:** Completada (integrada en Fases 11 y HomeScreen)

- Auto-guardado cada vez que el usuario responde una pregunta
- Auto-guardado periodico del tiempo restante (cada 5s)
- Deteccion de examen en progreso al abrir la app (HomeScreen)
- Banner con opciones "Continuar" y "Descartar"
- Descarte con confirmacion (Alert)
- Limpieza automatica de examenes con mas de 7 dias

---

### Fase 13: Motor de Calificacion

**Estado:** Completada

Se implemento `src/services/ScoringService.ts`:

- `evaluarRespuesta()` - Compara respuesta del usuario con la correcta
- `calcularCalificacion()` - Formula: (correctas / total) * 20, redondeado a 1 decimal
- `calcularPorcentaje()` - (correctas / total) * 100
- `generarEstadisticas()` - Estadisticas completas de una sesion finalizada:
  - Total preguntas, correctas, incorrectas
  - Porcentaje de acierto
  - Calificacion final sobre 20
  - Tiempo utilizado (si aplica)
- Preguntas sin contestar se cuentan como incorrectas

---

### Fase 14: Pantalla de Resultados

**Estado:** Completada

Se actualizo `app/resultados.tsx` con funcionalidad real:

- Recibe datos por parametros de navegacion (calificacion, correctas, incorrectas, porcentaje, tiempo)
- Calificacion grande con color dinamico:
  - Verde si >= 14/20
  - Amarillo si >= 10/20
  - Rojo si < 10/20
- Tarjetas de estadisticas: correctas (verde), incorrectas (rojo), porcentaje (azul)
- Tiempo utilizado formateado (si habia limite)
- Boton "Revisar prueba" (navega a `/revision` con IDs)
- Boton "Menu principal" (reemplaza navegacion con `/`)

---

## Fases En Progreso / Pendientes

### Fase 15: Revision de Respuestas - PENDIENTE
Falta actualizar `app/revision.tsx` para conectarla con datos reales del historial.

### Fase 16: Historial de Examenes - PENDIENTE
Falta actualizar `app/historial.tsx` para conectarla con StorageService.

### Fase 17: Recuperacion de Examenes - COMPLETADA (integrada en Fase 12)

### Fase 18: Optimizacion y UX - PENDIENTE
- Animaciones con react-native-reanimated
- Memoizacion de componentes
- Dark mode / light mode
- Responsividad

### Fase 19: Testing y Pulido Final - PENDIENTE

---

## Estructura Actual del Proyecto

```
ExamSimulator/
  app/
    _layout.tsx          -- Layout raiz (Stack navigator, tema oscuro)
    index.tsx            -- Pantalla inicio (carga archivos, deteccion examen en progreso)
    archivos.tsx         -- Pantalla archivos guardados (lista, eliminar, historial)
    configuracion.tsx    -- Pantalla configuracion (pool, tiempo, aleatoriedad)
    examen.tsx           -- Pantalla examen (temporizador, auto-guardado, radio buttons)
    resultados.tsx       -- Pantalla resultados (calificacion, estadisticas)
    revision.tsx         -- Pantalla revision (skeleton, pendiente conectar)
    historial.tsx        -- Pantalla historial (skeleton, pendiente conectar)
    ejemplos.tsx         -- Pantalla ejemplos formato (modal, JSON + Markdown)
  src/
    models/
      Exam.ts            -- Modelos Pregunta y Examen
      ExamSession.ts     -- Modelos de sesion, configuracion, examen generado
      HistoryEntry.ts    -- Modelos de historial, archivo, estadisticas
      index.ts           -- Barrel export
    services/
      StorageService.ts  -- CRUD AsyncStorage (archivos, sesiones, historial)
      ParserService.ts   -- Parsers JSON y Markdown
      ValidationService.ts -- Validacion exhaustiva de examenes
      ExamGeneratorService.ts -- Generacion de examen (seleccion, aleatorizacion)
      ExamEngineService.ts -- Motor del flujo del examen
      ScoringService.ts  -- Calificacion y estadisticas
      index.ts           -- Barrel export
    tema/
      colores.ts         -- Paleta y tokens de diseno
      TemaProveedor.tsx  -- Contexto y hook de tema
      index.ts           -- Barrel export
    utils/
      constants.ts       -- Constantes globales
      helpers.ts         -- Funciones auxiliares
  context/
    paleta.json          -- Paleta de colores de referencia
    progreso.md          -- Este documento
    Especificacion...md  -- Especificacion completa del proyecto
```

---

## Servicios Implementados

| Servicio | Archivo | Funciones |
|---|---|---|
| Storage | `StorageService.ts` | 11 funciones (CRUD archivos, sesiones, historial) |
| Parser | `ParserService.ts` | 4 funciones (JSON, Markdown, deteccion, principal) |
| Validacion | `ValidationService.ts` | 3 funciones (examen, pregunta, opciones) |
| Generador | `ExamGeneratorService.ts` | 1 funcion publica + 2 privadas |
| Motor | `ExamEngineService.ts` | 7 funciones (sesion, respuestas, avance, tiempo) |
| Calificacion | `ScoringService.ts` | 4 funciones (evaluar, calificar, porcentaje, estadisticas) |

---

## Notas Tecnicas

- **Idioma:** Toda la UI, codigo, comentarios y nombres de variables estan en espanol
- **Tema:** Oscuro por defecto, basado en la paleta de `paleta.json` (violeta #7F00FF / cyan #00D9FF)
- **Sin emojis:** No se usan emojis en la interfaz ni en el codigo
- **Expo SDK:** 54.0.34 con React Native 0.81.5 y TypeScript 5.9.2
- **Navegacion:** expo-router 6.0.23 con Stack navigator
- **Arquitectura:** Servicios puros e inmutables, pantallas solo consumen servicios
- **Persistencia:** AsyncStorage con 3 claves: archivos, examen_en_progreso, historial
