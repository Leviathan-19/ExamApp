# Especificación Completa: Examen Offline App

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Especificación Finalizada

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Requisitos Funcionales](#requisitos-funcionales)
3. [Requisitos No Funcionales](#requisitos-no-funcionales)
4. [Formato de Datos](#formato-de-datos)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Pantallas y Componentes](#pantallas-y-componentes)
7. [Lógica de Calificación](#lógica-de-calificación)
8. [Persistencia y Almacenamiento](#persistencia-y-almacenamiento)
9. [Manejo de Errores](#manejo-de-errores)
10. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## Descripción General

**Examen Offline App** es una aplicación móvil construida con **React Native + Expo** que permite a los usuarios simular exámenes de forma completamente offline. La aplicación carga preguntas desde archivos locales (JSON o Markdown), permite configurar un pool de preguntas con límite de tiempo opcional, y proporciona una calificación final sobre 20 puntos con la posibilidad de revisar las respuestas.

### Características Principales

- ✅ **Funcionamiento completamente offline** - No requiere conexión a internet
- ✅ **Sin autenticación** - No requiere login ni registro
- ✅ **Carga de archivos flexible** - Soporta JSON y Markdown
- ✅ **Configuración personalizada** - Pool de preguntas y tiempo ajustables
- ✅ **Examen secuencial** - No permite retroceso a preguntas anteriores
- ✅ **Temporizador opcional** - Tiempo limitado o indefinido
- ✅ **Revisión de respuestas** - Mostrar respuestas correctas/incorrectas con colores
- ✅ **Historial de pruebas** - Guardar hasta 10 intentos anteriores
- ✅ **Reanudación de examen** - Continuar donde se quedó si se cierra la app

---

## Requisitos Funcionales

### RF1: Carga de Archivos

**Descripción:** El usuario debe poder cargar archivos de preguntas desde el teléfono.

**Detalles:**
- La app debe permitir seleccionar archivos con extensión `.json` o `.md`
- Al seleccionar un archivo, la app debe:
  1. Leer el contenido del archivo
  2. Detectar automáticamente el formato (JSON o Markdown)
  3. Parsear el contenido según el formato
  4. Validar la estructura del archivo
  5. Si es válido, guardar el archivo en el almacenamiento local
  6. Si hay errores, mostrar un mensaje específico indicando el problema

**Validaciones:**
- El archivo no debe estar vacío
- El archivo debe tener un formato válido (JSON válido o Markdown con estructura correcta)
- Debe contener al menos 1 pregunta
- Cada pregunta debe tener entre 2 y 6 opciones
- Cada pregunta debe tener exactamente una respuesta correcta marcada

---

### RF2: Gestión de Archivos Guardados

**Descripción:** La app debe mantener un registro de archivos cargados anteriormente.

**Detalles:**
- Mostrar lista de archivos guardados con:
  - Nombre del archivo
  - Número total de preguntas
  - Fecha de carga
  - Opción para eliminar
- Permitir cargar un archivo guardado para realizar un nuevo examen
- Generar un ID único para cada archivo (hash del contenido) para identificarlo

---

### RF3: Configuración del Examen

**Descripción:** Antes de iniciar el examen, el usuario debe configurar los parámetros.

**Detalles:**
- **Selección de pool de preguntas:**
  - Mostrar el total de preguntas disponibles en el archivo
  - Permitir al usuario seleccionar cuántas preguntas desea responder (mínimo 1, máximo el total disponible)
  - Opción para usar todas las preguntas del archivo
  - La app debe validar que la cantidad seleccionada no exceda el total disponible

- **Configuración de tiempo:**
  - Opción de "Sin límite de tiempo" (por defecto)
  - Opción de "Tiempo limitado"
  - Si se elige tiempo limitado:
    - Input para seleccionar segundos por pregunta
    - Rango permitido: 30 a 120 segundos por pregunta
    - El tiempo total se calcula automáticamente: (segundos por pregunta) × (número de preguntas)
    - Mostrar el tiempo total calculado al usuario

- **Aleatoriedad:**
  - Opción para aleatorizar el orden de las preguntas
  - Opción para aleatorizar el orden de las opciones en preguntas de selección múltiple
  - Ambas opciones deben estar habilitadas por defecto

---

### RF4: Ejecución del Examen

**Descripción:** Interfaz principal donde el usuario responde las preguntas.

**Detalles:**
- **Presentación de preguntas:**
  - Una pregunta por pantalla
  - Mostrar indicador de progreso: "X de Y" (ej: "5 de 20")
  - Mostrar el texto completo de la pregunta
  - Mostrar todas las opciones disponibles

- **Tipos de preguntas soportados:**
  - **Selección múltiple:** 3 a 6 opciones, una respuesta correcta
  - **Verdadero/Falso:** Exactamente 2 opciones, una respuesta correcta

- **Interacción del usuario:**
  - Permitir seleccionar una opción (radio button o similar)
  - Botón "Siguiente" para avanzar a la siguiente pregunta
  - No permitir retroceder a preguntas anteriores
  - No permitir avanzar sin seleccionar una opción
  - Guardar automáticamente la respuesta al seleccionar una opción

- **Temporizador (si está habilitado):**
  - Mostrar tiempo restante en la parte superior de la pantalla
  - Actualizar cada segundo
  - Mostrar advertencia visual cuando quedan menos de 30 segundos
  - Cuando el tiempo se agota:
    - Finalizar automáticamente el examen
    - Mostrar las respuestas no completadas como incorrectas
    - Ir a la pantalla de resultados

- **Progreso del examen:**
  - Guardar automáticamente cada respuesta en AsyncStorage
  - Guardar el tiempo restante
  - Guardar la pregunta actual
  - Permitir que el usuario cierre la app y reanude después

---

### RF5: Finalización del Examen

**Descripción:** Al finalizar todas las preguntas o agotarse el tiempo, mostrar opciones.

**Detalles:**
- Mostrar pantalla intermedia con dos opciones:
  1. **Ir al menú principal** - Volver a la pantalla de inicio
  2. **Revisar prueba** - Ir a la pantalla de revisión

---

### RF6: Revisión de Respuestas

**Descripción:** Permitir al usuario revisar sus respuestas después de finalizar el examen.

**Detalles:**
- Mostrar todas las preguntas respondidas secuencialmente
- Para cada pregunta, mostrar:
  - El texto de la pregunta
  - Todas las opciones disponibles
  - La opción que el usuario seleccionó (resaltada en **rojo** si es incorrecta)
  - La opción correcta (resaltada en **verde**)
  - Indicador visual claro de correcto/incorrecto

- **Navegación:**
  - Permitir navegar entre preguntas (adelante y atrás)
  - Mostrar indicador de progreso: "X de Y"
  - Botón para volver a la pantalla de resultados

---

### RF7: Pantalla de Resultados

**Descripción:** Mostrar la calificación final y estadísticas del examen.

**Detalles:**
- **Información mostrada:**
  - Calificación final sobre 20 puntos
  - Número de respuestas correctas
  - Número de respuestas incorrectas
  - Porcentaje de acierto
  - Tiempo utilizado (si había límite de tiempo)

- **Cálculo de puntuación:**
  - Fórmula: `(respuestas_correctas / total_preguntas) × 20`
  - Ejemplo: Si hay 50 preguntas y el usuario acierta 40:
    - Cada pregunta vale: 20 ÷ 50 = 0.4 puntos
    - Puntuación final: 40 × 0.4 = 16 puntos

- **Opciones disponibles:**
  - Botón "Revisar prueba" - Ir a la pantalla de revisión
  - Botón "Menú principal" - Volver a la pantalla de inicio

---

### RF8: Historial de Pruebas

**Descripción:** Guardar y acceder a intentos anteriores del mismo archivo.

**Detalles:**
- **Almacenamiento:**
  - Guardar automáticamente cada prueba completada
  - Asociar cada prueba con el archivo de origen (usando su ID único)
  - Guardar máximo 10 pruebas por archivo
  - Si se supera el límite, eliminar la prueba más antigua

- **Información guardada por prueba:**
  - ID de la prueba (timestamp)
  - Archivo de origen (ID)
  - Fecha y hora de realización
  - Calificación final
  - Número de respuestas correctas/incorrectas
  - Tiempo utilizado
  - Todas las respuestas del usuario (para permitir revisión posterior)

- **Acceso al historial:**
  - Mostrar opción "Ver historial" en la pantalla de archivos guardados
  - Listar todas las pruebas anteriores con su calificación
  - Permitir seleccionar una prueba anterior para revisar sus respuestas
  - Permitir eliminar pruebas individuales del historial

---

### RF9: Reanudación de Examen

**Descripción:** Si el usuario cierra la app durante un examen, debe poder continuarlo.

**Detalles:**
- **Detección de examen en progreso:**
  - Al abrir la app, verificar si hay un examen sin completar
  - Si existe, mostrar opciones:
    1. "Continuar examen" - Reanudar donde se quedó
    2. "Descartar examen" - Comenzar uno nuevo

- **Datos a restaurar:**
  - Preguntas seleccionadas para el examen
  - Pregunta actual en la que se encontraba
  - Respuestas ya dadas
  - Tiempo restante (si había límite)
  - Configuración del examen (pool, tiempo, aleatoriedad)

- **Limpieza automática:**
  - Si el usuario no reanuda un examen en 7 días, eliminarlo automáticamente
  - Mostrar advertencia si el examen en progreso está próximo a expirar

---

## Requisitos No Funcionales

### RNF1: Rendimiento

- La app debe responder en menos de 500ms a cualquier interacción del usuario
- La carga de archivos debe completarse en menos de 2 segundos (incluso con 1000+ preguntas)
- El temporizador debe ser preciso (desviación máxima de ±100ms)

### RNF2: Almacenamiento

- La app debe funcionar con archivos de hasta 10MB
- Debe soportar hasta 1000 preguntas por archivo
- El almacenamiento local debe ser eficiente (usar compresión si es necesario)

### RNF3: Compatibilidad

- Soportar Android 8.0 y superior
- Soportar iOS 12 y superior
- Funcionar en dispositivos con pantallas de 4" a 6.7"

### RNF4: Usabilidad

- Interfaz intuitiva y fácil de usar
- Textos claros y mensajes de error descriptivos
- Soporte para caracteres especiales (tildes, ñ, acentos, etc.)
- Diseño responsive para diferentes tamaños de pantalla

### RNF5: Seguridad

- Los archivos cargados deben almacenarse de forma segura en el dispositivo
- No transmitir datos a servidores externos
- Permitir al usuario eliminar todos sus datos en cualquier momento

---

## Formato de Datos

### Formato JSON

**Estructura:**

```json
{
  "titulo": "Nombre del Examen",
  "descripcion": "Descripción breve del examen",
  "preguntas": [
    {
      "id": 1,
      "pregunta": "¿Cuál es la capital de Francia?",
      "tipo": "multiple",
      "opciones": [
        "Madrid",
        "Londres",
        "París",
        "Berlín"
      ],
      "respuestaCorrecta": 2
    },
    {
      "id": 2,
      "pregunta": "La Tierra es plana",
      "tipo": "verdadero_falso",
      "opciones": [
        "Verdadero",
        "Falso"
      ],
      "respuestaCorrecta": 1
    }
  ]
}
```

**Validaciones:**
- `titulo` y `descripcion` son opcionales
- `preguntas` es obligatorio y debe ser un array no vacío
- Cada pregunta debe tener:
  - `id`: número único
  - `pregunta`: string no vacío
  - `tipo`: "multiple" o "verdadero_falso"
  - `opciones`: array con 2-6 elementos (2 para verdadero/falso, 3-6 para múltiple)
  - `respuestaCorrecta`: índice válido (0 a length-1) de la opción correcta
- No debe haber opciones duplicadas en la misma pregunta
- El JSON debe ser válido y bien formado

**Ejemplo de archivo JSON válido:**

```json
{
  "titulo": "Examen de Geografía",
  "descripcion": "Preguntas sobre capitales europeas",
  "preguntas": [
    {
      "id": 1,
      "pregunta": "¿Cuál es la capital de España?",
      "tipo": "multiple",
      "opciones": ["Barcelona", "Madrid", "Valencia", "Sevilla"],
      "respuestaCorrecta": 1
    },
    {
      "id": 2,
      "pregunta": "¿Cuál es la capital de Italia?",
      "tipo": "multiple",
      "opciones": ["Milán", "Roma", "Venecia", "Florencia"],
      "respuestaCorrecta": 1
    },
    {
      "id": 3,
      "pregunta": "París es la capital de Francia",
      "tipo": "verdadero_falso",
      "opciones": ["Verdadero", "Falso"],
      "respuestaCorrecta": 0
    }
  ]
}
```

---

### Formato Markdown

**Estructura:**

```markdown
# Nombre del Examen
Descripción: Descripción breve del examen

## Pregunta 1
¿Cuál es la capital de Francia?
- Madrid
- Londres
- **París**
- Berlín

## Pregunta 2
La Tierra es plana
- **Verdadero**
- Falso
```

**Validaciones:**
- El título (`# Nombre`) es opcional
- Cada pregunta debe estar precedida por un encabezado (`## Pregunta X`)
- Cada pregunta debe tener un texto (la pregunta en sí)
- Cada opción debe estar en una línea separada precedida por `- `
- Exactamente una opción debe estar marcada con `**` (negrita) para indicar la respuesta correcta
- Las preguntas deben tener 2-6 opciones
- No debe haber opciones duplicadas

**Ejemplo de archivo Markdown válido:**

```markdown
# Examen de Geografía
Descripción: Preguntas sobre capitales europeas

## Pregunta 1
¿Cuál es la capital de España?
- Barcelona
- **Madrid**
- Valencia
- Sevilla

## Pregunta 2
¿Cuál es la capital de Italia?
- Milán
- **Roma**
- Venecia
- Florencia

## Pregunta 3
París es la capital de Francia
- **Verdadero**
- Falso
```

---

## Flujos de Usuario

### Flujo 1: Primer uso - Cargar archivo y realizar examen

```
1. Usuario abre la app
   ↓
2. Se muestra pantalla de inicio (sin examen en progreso)
   ↓
3. Usuario toca "Cargar nuevo archivo"
   ↓
4. Se abre selector de archivos
   ↓
5. Usuario selecciona un archivo (.json o .md)
   ↓
6. App valida el archivo
   ├─ Si hay error → Mostrar mensaje y permitir reintentar
   └─ Si es válido → Guardar archivo y continuar
   ↓
7. Se muestra pantalla de configuración del examen
   ├─ Total de preguntas: X
   ├─ Input: ¿Cuántas preguntas? (1-X)
   ├─ Toggle: ¿Tiempo limitado?
   └─ Si sí → Input: Segundos por pregunta (30-120)
   ↓
8. Usuario configura y toca "Iniciar examen"
   ↓
9. Se muestra la primera pregunta
   ├─ Indicador: "1 de X"
   ├─ Temporizador (si aplica)
   └─ Opciones para seleccionar
   ↓
10. Usuario selecciona opciones y avanza
    (Repetir para todas las preguntas)
    ↓
11. Al finalizar todas las preguntas
    ↓
12. Se muestra pantalla de opciones:
    ├─ "Ir al menú principal"
    └─ "Revisar prueba"
    ↓
13. Si elige "Revisar prueba":
    ├─ Mostrar todas las respuestas
    ├─ Indicar correctas (verde) e incorrectas (rojo)
    └─ Permitir navegar entre preguntas
    ↓
14. Se muestra pantalla de resultados
    ├─ Calificación final
    ├─ Estadísticas
    └─ Opciones: "Revisar" o "Menú principal"
    ↓
15. Usuario toca "Menú principal"
    ↓
16. Volver a pantalla de inicio
    (El examen se guarda en historial)
```

---

### Flujo 2: Reanudación de examen interrumpido

```
1. Usuario abre la app
   ↓
2. App detecta examen en progreso
   ↓
3. Se muestra pantalla con opciones:
   ├─ "Continuar examen"
   └─ "Descartar examen"
   ↓
4. Si elige "Continuar examen":
   ├─ Restaurar estado anterior
   ├─ Mostrar la pregunta donde se quedó
   └─ Continuar con el examen
   ↓
5. Si elige "Descartar examen":
   ├─ Eliminar el examen en progreso
   └─ Mostrar pantalla de inicio
```

---

### Flujo 3: Acceso a archivos guardados

```
1. Usuario está en pantalla de inicio
   ↓
2. Usuario toca "Archivos guardados"
   ↓
3. Se muestra lista de archivos cargados anteriormente
   ├─ Nombre del archivo
   ├─ Número de preguntas
   ├─ Fecha de carga
   └─ Opción para eliminar
   ↓
4. Usuario selecciona un archivo
   ↓
5. Se muestra pantalla de configuración del examen
   (Igual que en Flujo 1, paso 7)
   ↓
6. Continuar con el examen
```

---

### Flujo 4: Revisión de historial

```
1. Usuario está viendo un archivo guardado
   ↓
2. Usuario toca "Ver historial"
   ↓
3. Se muestra lista de pruebas anteriores
   ├─ Fecha y hora
   ├─ Calificación
   ├─ Respuestas correctas/incorrectas
   └─ Opción para eliminar
   ↓
4. Usuario selecciona una prueba anterior
   ↓
5. Se muestra pantalla de revisión
   ├─ Todas las respuestas del usuario
   ├─ Respuestas correctas (verde)
   ├─ Respuestas incorrectas (rojo)
   └─ Navegación entre preguntas
   ↓
6. Usuario puede volver al historial o al menú principal
```

---

## Pantallas y Componentes

### Pantalla 1: Inicio

**Elementos:**
- Logo/Título de la app
- Botón: "Cargar nuevo archivo"
- Botón: "Archivos guardados"
- Botón: "Ejemplos de formato" (muestra ejemplos de JSON y Markdown)
- Información: "Versión X.X"

**Lógica:**
- Si hay examen en progreso, mostrar opción "Continuar examen" en la parte superior

---

### Pantalla 2: Selector de Archivo

**Elementos:**
- Selector de archivos del sistema operativo
- Filtrar solo archivos `.json` y `.md`
- Mostrar ruta del archivo seleccionado

**Lógica:**
- Usar `react-native-document-picker` o similar
- Validar el archivo después de seleccionar

---

### Pantalla 3: Configuración del Examen

**Elementos:**
- Mostrar: "Total de preguntas: X"
- Input: "¿Cuántas preguntas deseas responder?" (con validación)
- Toggle: "¿Tiempo limitado?"
- Si toggle está activo:
  - Input: "Segundos por pregunta" (30-120)
  - Mostrar: "Tiempo total: X minutos Y segundos"
- Toggle: "Aleatorizar orden de preguntas" (por defecto activado)
- Toggle: "Aleatorizar opciones en preguntas múltiples" (por defecto activado)
- Botón: "Iniciar examen"

**Validaciones:**
- Número de preguntas debe ser entre 1 y el total disponible
- Segundos por pregunta debe ser entre 30 y 120
- No permitir iniciar sin completar los campos requeridos

---

### Pantalla 4: Examen

**Elementos:**
- Indicador de progreso: "X de Y"
- Temporizador (si aplica): Mostrar tiempo restante
- Texto de la pregunta
- Opciones (radio buttons o similar)
- Botón: "Siguiente" (deshabilitado si no hay opción seleccionada)
- Indicador visual de tiempo bajo (si quedan menos de 30 segundos)

**Lógica:**
- Guardar automáticamente cada respuesta
- Deshabilitar botón "Siguiente" hasta seleccionar una opción
- No permitir retroceso
- Si se agota el tiempo, finalizar automáticamente

---

### Pantalla 5: Opciones Post-Examen

**Elementos:**
- Mensaje: "Examen finalizado"
- Botón: "Ir al menú principal"
- Botón: "Revisar prueba"

---

### Pantalla 6: Revisión de Respuestas

**Elementos:**
- Indicador de progreso: "X de Y"
- Texto de la pregunta
- Todas las opciones con colores:
  - Opción seleccionada por el usuario:
    - Verde si es correcta
    - Rojo si es incorrecta
  - Opción correcta: Verde (si el usuario no la seleccionó)
- Botón: "Anterior"
- Botón: "Siguiente"
- Botón: "Ver resultados"

---

### Pantalla 7: Resultados

**Elementos:**
- Calificación final (grande y destacado): "X.X / 20"
- Estadísticas:
  - Respuestas correctas: X
  - Respuestas incorrectas: Y
  - Porcentaje: Z%
  - Tiempo utilizado: X minutos Y segundos (si aplica)
- Botón: "Revisar prueba"
- Botón: "Menú principal"

---

### Pantalla 8: Archivos Guardados

**Elementos:**
- Lista de archivos guardados
- Para cada archivo:
  - Nombre del archivo
  - Número total de preguntas
  - Fecha de carga
  - Botón: Eliminar (con confirmación)
  - Botón: Ver historial
- Botón: "Cargar nuevo archivo"
- Botón: "Volver"

---

### Pantalla 9: Historial de Pruebas

**Elementos:**
- Lista de pruebas anteriores del archivo seleccionado (máximo 10)
- Para cada prueba:
  - Fecha y hora de realización
  - Calificación final
  - Respuestas correctas/incorrectas
  - Botón: Revisar
  - Botón: Eliminar (con confirmación)
- Botón: "Volver"

---

## Lógica de Calificación

### Fórmula de Puntuación

La puntuación final siempre se calcula sobre 20 puntos, independientemente del número de preguntas en el examen.

**Fórmula:**
```
Puntos por pregunta = 20 / Total de preguntas en el examen
Puntuación final = Respuestas correctas × Puntos por pregunta
```

**Ejemplos:**

| Total preguntas | Respuestas correctas | Puntos por pregunta | Puntuación final |
|---|---|---|---|
| 10 | 8 | 2.0 | 16.0 |
| 20 | 15 | 1.0 | 15.0 |
| 50 | 40 | 0.4 | 16.0 |
| 100 | 85 | 0.2 | 17.0 |

### Precisión

- La puntuación se debe mostrar con un decimal (ej: 16.5)
- Usar redondeo estándar (0.5 hacia arriba)

### Estadísticas

- **Respuestas correctas:** Número de opciones seleccionadas que coinciden con la respuesta correcta
- **Respuestas incorrectas:** Total de preguntas - Respuestas correctas
- **Porcentaje de acierto:** (Respuestas correctas / Total de preguntas) × 100

---

## Persistencia y Almacenamiento

### AsyncStorage (React Native)

Se utiliza AsyncStorage para guardar datos en el dispositivo de forma persistente.

**Estructura de datos guardados:**

```json
{
  "archivos": {
    "archivo_id_1": {
      "id": "archivo_id_1",
      "nombre": "Examen de Matemáticas",
      "totalPreguntas": 50,
      "fechaCarga": 1234567890,
      "contenido": { /* JSON parseado */ }
    }
  },
  "examenEnProgreso": {
    "archivoId": "archivo_id_1",
    "preguntasSeleccionadas": [0, 5, 12, 3, ...],
    "tiempoTotal": 1800,
    "tiempoRestante": 1245,
    "preguntaActual": 3,
    "respuestas": {
      "0": 2,
      "1": null,
      "2": 0,
      "3": null
    },
    "timestamp": 1234567890,
    "estado": "en_progreso"
  },
  "historialPruebas": {
    "archivo_id_1": [
      {
        "id": "prueba_1",
        "fecha": 1234567890,
        "calificacion": 16.5,
        "respuestasCorrectas": 33,
        "respuestasIncorrectas": 17,
        "tiempoUtilizado": 1245,
        "respuestas": { /* Respuestas del usuario */ }
      }
    ]
  }
}
```

### Identificación de Archivos

- Cada archivo se identifica con un hash único basado en su contenido
- Esto permite detectar si el usuario carga el mismo archivo dos veces
- Hash se calcula usando SHA-256 o similar

### Limpieza Automática

- Los exámenes en progreso que no se reanuden en 7 días se eliminan automáticamente
- Se mantiene máximo 10 pruebas por archivo en el historial
- Al superar 10, se elimina la prueba más antigua

---

## Manejo de Errores

### Errores de Carga de Archivo

#### Error 1: Archivo vacío
```
Título: Error de archivo
Mensaje: "El archivo está vacío. Por favor, selecciona un archivo con preguntas."
Acción: Permitir reintentar
```

#### Error 2: Formato no válido
```
Título: Error de formato
Mensaje: "El archivo no tiene un formato válido. Asegúrate de que sea JSON o Markdown correctamente estructurado."
Acción: Permitir reintentar
```

#### Error 3: JSON inválido
```
Título: Error de JSON
Mensaje: "El archivo JSON no es válido. Verifica la sintaxis."
Acción: Permitir reintentar
```

#### Error 4: Falta campo obligatorio
```
Título: Error de estructura
Mensaje: "El archivo no contiene el campo 'preguntas'. Por favor, verifica la estructura."
Acción: Permitir reintentar
```

#### Error 5: Pregunta sin opciones
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X no tiene opciones. Cada pregunta debe tener entre 2 y 6 opciones."
Acción: Permitir reintentar
```

#### Error 6: Demasiadas opciones
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X tiene 7 opciones (máximo 6). Por favor, reduce el número de opciones."
Acción: Permitir reintentar
```

#### Error 7: Verdadero/Falso con opciones incorrectas
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X es de tipo 'verdadero_falso' pero tiene 3 opciones. Debe tener exactamente 2."
Acción: Permitir reintentar
```

#### Error 8: Respuesta correcta no válida
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X no tiene una respuesta correcta válida. El índice debe estar entre 0 y el número de opciones."
Acción: Permitir reintentar
```

#### Error 9: Opciones duplicadas (Markdown)
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X tiene opciones duplicadas. Cada opción debe ser única."
Acción: Permitir reintentar
```

#### Error 10: Múltiples respuestas correctas (Markdown)
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X tiene múltiples respuestas correctas marcadas. Solo una opción debe estar en negrita."
Acción: Permitir reintentar
```

#### Error 11: Sin respuesta correcta (Markdown)
```
Título: Error en pregunta #X
Mensaje: "La pregunta #X no tiene una respuesta correcta marcada. Marca una opción con **negrita**."
Acción: Permitir reintentar
```

### Errores de Configuración

#### Error 12: Pool de preguntas inválido
```
Título: Error de configuración
Mensaje: "El número de preguntas debe ser entre 1 y X (total disponible)."
Acción: Permitir corregir el valor
```

#### Error 13: Tiempo por pregunta inválido
```
Título: Error de configuración
Mensaje: "El tiempo por pregunta debe ser entre 30 y 120 segundos."
Acción: Permitir corregir el valor
```

### Errores de Almacenamiento

#### Error 14: Espacio insuficiente
```
Título: Error de almacenamiento
Mensaje: "No hay suficiente espacio en el dispositivo. Por favor, libera espacio e intenta de nuevo."
Acción: Permitir reintentar
```

#### Error 15: Error al guardar
```
Título: Error de almacenamiento
Mensaje: "No se pudo guardar el archivo. Por favor, intenta de nuevo."
Acción: Permitir reintentar
```

---

## Consideraciones Técnicas

### Stack Tecnológico

- **Framework:** React Native + Expo
- **Lenguaje:** TypeScript
- **Almacenamiento local:** AsyncStorage
- **Acceso a archivos:** react-native-document-picker
- **Parsing JSON:** JSON.parse() nativo
- **Parsing Markdown:** Parser personalizado o librería ligera
- **Temporizador:** React Native Animated + setInterval
- **Hash:** crypto-js o similar

### Parsers Requeridos

#### Parser JSON
- Usar `JSON.parse()` nativo
- Validar estructura después de parsear
- Capturar errores de sintaxis

#### Parser Markdown
- Crear un parser personalizado o usar librería ligera
- Detectar encabezados (`## Pregunta X`)
- Extraer opciones (líneas que comienzan con `- `)
- Detectar respuesta correcta (opción con `**`)
- Validar estructura

### Generación de ID Único para Archivos

```typescript
import CryptoJS from 'crypto-js';

function generarIdArchivo(contenido: string): string {
  return CryptoJS.SHA256(contenido).toString();
}
```

### Almacenamiento de Archivos

- Guardar el contenido parseado en AsyncStorage (no el archivo original)
- Usar JSON.stringify() para serializar
- Usar JSON.parse() para deserializar
- Limitar tamaño total de almacenamiento a 50MB

### Temporizador

- Usar `setInterval()` para actualizar cada segundo
- Guardar tiempo restante en AsyncStorage cada 5 segundos
- Permitir que el temporizador continúe incluso si la app se minimiza (usar background timers)
- Usar `react-native-background-timer` si es necesario

### Aleatoriedad

```typescript
// Barajar array (Fisher-Yates)
function barajar<T>(array: T[]): T[] {
  const resultado = [...array];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}
```

### Validación de Estructura

Crear funciones de validación para cada tipo de error:

```typescript
interface Pregunta {
  id: number;
  pregunta: string;
  tipo: 'multiple' | 'verdadero_falso';
  opciones: string[];
  respuestaCorrecta: number;
}

interface Examen {
  titulo?: string;
  descripcion?: string;
  preguntas: Pregunta[];
}

function validarExamen(examen: any): { valido: boolean; error?: string } {
  if (!examen.preguntas || !Array.isArray(examen.preguntas)) {
    return { valido: false, error: 'El archivo no contiene el campo "preguntas"' };
  }
  
  if (examen.preguntas.length === 0) {
    return { valido: false, error: 'El archivo debe contener al menos una pregunta' };
  }
  
  for (let i = 0; i < examen.preguntas.length; i++) {
    const pregunta = examen.preguntas[i];
    
    if (!pregunta.pregunta || typeof pregunta.pregunta !== 'string') {
      return { valido: false, error: `La pregunta #${i + 1} no tiene texto` };
    }
    
    if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) {
      return { valido: false, error: `La pregunta #${i + 1} no tiene opciones` };
    }
    
    if (pregunta.opciones.length < 2 || pregunta.opciones.length > 6) {
      return { valido: false, error: `La pregunta #${i + 1} tiene ${pregunta.opciones.length} opciones (debe tener entre 2 y 6)` };
    }
    
    if (pregunta.tipo === 'verdadero_falso' && pregunta.opciones.length !== 2) {
      return { valido: false, error: `La pregunta #${i + 1} es verdadero/falso pero tiene ${pregunta.opciones.length} opciones` };
    }
    
    if (typeof pregunta.respuestaCorrecta !== 'number' || pregunta.respuestaCorrecta < 0 || pregunta.respuestaCorrecta >= pregunta.opciones.length) {
      return { valido: false, error: `La pregunta #${i + 1} no tiene una respuesta correcta válida` };
    }
  }
  
  return { valido: true };
}
```

### Rendimiento

- Virtualizar listas largas (si hay muchos archivos o pruebas)
- Lazy load del contenido del archivo
- Usar `React.memo()` para componentes que no cambian frecuentemente
- Optimizar re-renders con `useCallback()` y `useMemo()`

### Accesibilidad

- Usar colores que sean distinguibles para personas con daltonismo
- Proporcionar alternativas textuales a elementos visuales
- Asegurar que el tamaño de fuente sea legible
- Soportar screen readers (TalkBack en Android, VoiceOver en iOS)

### Diseño Responsivo

- Adaptar layout para pantallas pequeñas (4")
- Adaptar layout para pantallas grandes (6.7")
- Usar porcentajes y flexbox en lugar de píxeles fijos
- Probar en múltiples dispositivos

---

## Resumen de Decisiones de Diseño

| Decisión | Opción elegida | Razón |
|---|---|---|
| Formatos de archivo | JSON + Markdown | Balance entre robustez y facilidad de uso |
| Máximo opciones | 6 | Límite UX razonable en móvil |
| Máximo preguntas por archivo | 1000 | Suficiente para la mayoría de casos |
| Máximo pruebas en historial | 10 | Balance entre historial útil y almacenamiento |
| Rango de tiempo | 30-120 segundos | Tiempo razonable para responder preguntas |
| Escala de calificación | 0-20 puntos | Escala estándar internacional |
| Persistencia | AsyncStorage | Solución estándar en React Native |
| Limpieza de exámenes | 7 días | Tiempo razonable para reanudación |
| Navegación en examen | Solo adelante | Evita cambios de respuestas, mantiene integridad |
| Revisión de respuestas | Permitida post-examen | Mejora experiencia de aprendizaje |
| Colores de retroalimentación | Verde (correcto), Rojo (incorrecto) | Estándar universal |

---

## Plan de Desarrollo por Fases

El proyecto se divide en 19 fases bien definidas, cada una validable e independiente. Este enfoque permite detectar problemas temprano y facilita el mantenimiento futuro.

### Fase 1: Preparación del Proyecto

**Objetivo:** Inicializar y configurar el entorno de desarrollo.

**Tareas:**
- Crear proyecto Expo con TypeScript
- Instalar dependencias principales
- Configurar estructura de carpetas
- Configurar ESLint y Prettier
- Crear archivo README

**Entregables:**
- Proyecto funcional que compila sin errores
- Estructura de carpetas lista

---

### Fase 2: Arquitectura General

**Objetivo:** Definir la estructura y organización del código sin implementar funcionalidad.

**Tareas:**
- Crear estructura de carpetas:
  ```
  src/
  ├── screens/
  │   ├── HomeScreen.tsx
  │   ├── FilesScreen.tsx
  │   ├── ConfigScreen.tsx
  │   ├── ExamScreen.tsx
  │   ├── ResultsScreen.tsx
  │   ├── ReviewScreen.tsx
  │   └── HistoryScreen.tsx
  ├── services/
  │   ├── ParserService.ts
  │   ├── ValidationService.ts
  │   ├── ExamGeneratorService.ts
  │   ├── ExamEngineService.ts
  │   ├── ScoringService.ts
  │   └── StorageService.ts
  ├── models/
  │   ├── Exam.ts
  │   ├── Question.ts
  │   ├── ExamSession.ts
  │   └── HistoryEntry.ts
  ├── navigation/
  │   ├── RootNavigator.tsx
  │   └── types.ts
  ├── utils/
  │   ├── constants.ts
  │   ├── helpers.ts
  │   └── validators.ts
  └── App.tsx
  ```
- Definir interfaces y tipos TypeScript
- Crear modelos de datos
- Configurar navegación (estructura sin implementación)

**Entregables:**
- Estructura completa de carpetas
- Tipos e interfaces definidas
- Navegación esqueleto

---

### Fase 3: Skeleton de la Interfaz

**Objetivo:** Crear todas las pantallas sin funcionalidad, solo UI.

**Tareas:**
- Crear 7 pantallas principales:
  1. **HomeScreen** - Menú inicial
  2. **FilesScreen** - Archivos guardados
  3. **ConfigScreen** - Configuración del examen
  4. **ExamScreen** - Ejecución del examen
  5. **ResultsScreen** - Resultados finales
  6. **ReviewScreen** - Revisión de respuestas
  7. **HistoryScreen** - Historial de pruebas
- Todos los botones mostrarán "Pendiente"
- La navegación entre pantallas debe funcionar
- Diseño responsivo para diferentes tamaños de pantalla

**Entregables:**
- 7 pantallas navegables
- Diseño visual consistente
- Navegación funcional

---

### Fase 4: Persistencia Local (AsyncStorage)

**Objetivo:** Implementar el sistema de almacenamiento sin cargar datos aún.

**Tareas:**
- Implementar StorageService con funciones:
  - `guardarArchivo()`
  - `leerArchivo()`
  - `actualizarArchivo()`
  - `eliminarArchivo()`
  - `buscarArchivos()`
  - `limpiarAlmacenamiento()`
- Crear pruebas unitarias para cada función
- Validar que AsyncStorage funciona correctamente

**Entregables:**
- StorageService completamente funcional
- Pruebas pasando

---

### Fase 5: Carga de Archivos

**Objetivo:** Permitir al usuario seleccionar y leer archivos del dispositivo.

**Tareas:**
- Implementar selector de archivos (document-picker)
- Leer contenido del archivo
- Detectar extensión (.json o .md)
- Validar tamaño del archivo
- Validar permisos
- Mostrar errores específicos

**Entregables:**
- Usuario puede seleccionar archivos
- Contenido se lee correctamente
- Errores se manejan apropiadamente

---

### Fase 6: Parser (JSON y Markdown)

**Objetivo:** Convertir archivos en formato estándar.

**Tareas:**
- Implementar ParserService con dos módulos independientes:
  - **ParserJSON**: Parsea archivos JSON
  - **ParserMarkdown**: Parsea archivos Markdown
- Ambos deben devolver el mismo objeto `Exam`
- Manejar errores de parsing
- Crear pruebas exhaustivas

**Entregables:**
- ParserService funcional
- Soporta JSON y Markdown
- Pruebas pasando

---

### Fase 7: Validación de Archivos

**Objetivo:** Validar que el archivo cumple todas las reglas.

**Tareas:**
- Implementar ValidationService que valida:
  - IDs únicos
  - Preguntas válidas
  - Opciones (2-6 por pregunta)
  - Respuestas correctas válidas
  - Tipos de pregunta correctos
  - Longitud de campos
  - Duplicados
- Mensajes de error específicos para cada tipo de error
- Crear pruebas con archivos válidos e inválidos

**Entregables:**
- ValidationService completo
- 15 tipos de errores manejados
- Pruebas pasando

---

### Fase 8: Gestión de Archivos Guardados

**Objetivo:** Mostrar y gestionar archivos cargados anteriormente.

**Tareas:**
- Implementar pantalla FilesScreen
- Listar archivos guardados con:
  - Nombre
  - Cantidad de preguntas
  - Fecha de carga
  - Hash del archivo
- Permitir eliminar archivos
- Permitir ver información del archivo
- Generar hash único para cada archivo

**Entregables:**
- FilesScreen funcional
- Gestión completa de archivos

---

### Fase 9: Configuración del Examen

**Objetivo:** Permitir al usuario configurar los parámetros del examen.

**Tareas:**
- Implementar ConfigScreen con:
  - Input para cantidad de preguntas
  - Toggle para tiempo limitado
  - Input para segundos por pregunta
  - Toggle para aleatorizar preguntas
  - Toggle para aleatorizar opciones
  - Mostrar tiempo total calculado
- Validaciones de entrada
- Mostrar errores claros

**Entregables:**
- ConfigScreen funcional
- Validaciones completas
- Cálculos correctos

---

### Fase 10: Generador del Examen

**Objetivo:** Crear el examen definitivo según la configuración.

**Tareas:**
- Implementar ExamGeneratorService que:
  - Recibe archivo y configuración
  - Selecciona preguntas aleatorias (si aplica)
  - Aleatoriza orden de preguntas
  - Aleatoriza opciones en preguntas múltiples
  - Genera examen final
  - Guarda el examen generado
- Crear pruebas con diferentes configuraciones

**Entregables:**
- ExamGeneratorService funcional
- Examen generado correctamente
- Pruebas pasando

---

### Fase 11: Motor del Examen

**Objetivo:** Implementar la lógica principal del examen.

**Tareas:**
- Implementar ExamScreen con:
  - Mostrar pregunta actual
  - Mostrar indicador de progreso (X de Y)
  - Permitir seleccionar opción
  - Botón "Siguiente" (deshabilitado sin selección)
  - Mostrar temporizador (si aplica)
  - Guardar respuesta automáticamente
  - Avanzar a siguiente pregunta
  - No permitir retroceso
- Implementar ExamEngineService para controlar el flujo

**Entregables:**
- ExamScreen funcional
- Lógica de examen completa
- Respuestas se guardan correctamente

---

### Fase 12: Persistencia Automática y Recuperación

**Objetivo:** Guardar estado del examen para poder reanudarlo.

**Tareas:**
- Guardar automáticamente:
  - Pregunta actual
  - Respuestas dadas
  - Tiempo restante
  - Configuración del examen
- Detectar examen en progreso al abrir app
- Mostrar opciones: "Continuar" o "Descartar"
- Restaurar estado completo
- Limpiar exámenes no reanudados en 7 días

**Entregables:**
- Persistencia automática funcional
- Recuperación de examen funcional
- Limpieza automática implementada

---

### Fase 13: Motor de Calificación

**Objetivo:** Calcular puntuación de forma incremental.

**Tareas:**
- Implementar ScoringService que:
  - Evalúa cada respuesta inmediatamente
  - Marca como correcta/incorrecta
  - Guarda el estado
  - Calcula puntuación final al terminar
  - Calcula porcentaje de acierto
  - Maneja respuestas sin contestar
- Usar fórmula: (correctas / total) × 20

**Entregables:**
- ScoringService funcional
- Calificaciones correctas
- Fórmula implementada correctamente

---

### Fase 14: Pantalla de Resultados

**Objetivo:** Mostrar resultados finales del examen.

**Tareas:**
- Implementar ResultsScreen con:
  - Calificación final (sobre 20)
  - Respuestas correctas
  - Respuestas incorrectas
  - Porcentaje de acierto
  - Tiempo utilizado (si aplica)
  - Botón "Revisar prueba"
  - Botón "Menú principal"

**Entregables:**
- ResultsScreen funcional
- Información mostrada correctamente

---

### Fase 15: Revisión de Respuestas

**Objetivo:** Permitir revisar respuestas después del examen.

**Tareas:**
- Implementar ReviewScreen con:
  - Mostrar todas las preguntas
  - Indicador de progreso (X de Y)
  - Respuesta del usuario (rojo si incorrecta)
  - Respuesta correcta (verde)
  - Navegación anterior/siguiente
  - Botón para volver a resultados
- Usar datos ya guardados (no recalcular)

**Entregables:**
- ReviewScreen funcional
- Colores correctos (rojo/verde)
- Navegación funcional

---

### Fase 16: Historial de Exámenes

**Objetivo:** Guardar y acceder a intentos anteriores.

**Tareas:**
- Implementar HistoryScreen con:
  - Listar pruebas anteriores (máximo 10)
  - Mostrar fecha, calificación, aciertos
  - Permitir revisar prueba anterior
  - Permitir eliminar prueba
  - Eliminar automáticamente la más antigua si se supera 10
- Guardar automáticamente cada prueba completada

**Entregables:**
- HistoryScreen funcional
- Historial guardado correctamente
- Límite de 10 pruebas implementado

---

### Fase 17: Recuperación de Exámenes Interrumpidos

**Objetivo:** Detectar y permitir continuar exámenes interrumpidos.

**Tareas:**
- Al abrir app:
  - Verificar si existe examen en progreso
  - Si existe: mostrar opción "Continuar examen"
  - Si no: mostrar menú normal
- Implementar en HomeScreen
- Validar que el examen no haya expirado

**Entregables:**
- Detección de examen en progreso funcional
- Opción de continuar visible

---

### Fase 18: Optimización

**Objetivo:** Mejorar rendimiento, UX y accesibilidad.

**Tareas:**
- Optimización de rendimiento:
  - Memoización de componentes (React.memo)
  - useCallback para funciones
  - useMemo para cálculos
  - Virtualización de listas largas
- Mejoras de UX:
  - Animaciones suaves
  - Transiciones entre pantallas
  - Feedback visual de acciones
  - Indicadores de carga
- Accesibilidad:
  - Soporte para screen readers
  - Contraste de colores adecuado
  - Tamaño de fuente legible
  - Navegación por teclado
- Dark mode (opcional)

**Entregables:**
- App optimizada
- Mejor rendimiento
- Mejor UX

---

### Fase 19: Testing y Pulido Final

**Objetivo:** Pruebas exhaustivas y ajustes finales.

**Tareas:**
- Pruebas funcionales:
  - Carga de archivos válidos e inválidos
  - Archivos con 1000+ preguntas
  - JSON y Markdown inválidos
  - Archivos duplicados
- Pruebas de robustez:
  - Cerrar app durante examen
  - Rotar pantalla
  - Cambiar tema
  - Tiempo agotado
  - Sin espacio en almacenamiento
- Pruebas de UX:
  - Navegación fluida
  - Mensajes de error claros
  - Tiempos de respuesta aceptables
- Ajustes finales
- Documentación

**Entregables:**
- App completamente funcional
- Todos los bugs corregidos
- Documentación completa
- Listo para publicación

---

## Arquitectura de Servicios (Core del Dominio)

La inteligencia de la aplicación se centraliza en servicios independientes. Las pantallas solo mostrarán información y llamarán a estos servicios.

### ParserService
**Responsabilidad:** Convertir JSON o Markdown en modelo único de examen.

```typescript
interface ParserService {
  parseJSON(content: string): Exam;
  parseMarkdown(content: string): Exam;
  detectFormat(content: string): 'json' | 'markdown';
}
```

### ValidationService
**Responsabilidad:** Validar que el examen cumple todas las reglas.

```typescript
interface ValidationService {
  validate(exam: Exam): { valid: boolean; errors: string[] };
  validateQuestion(question: Question): boolean;
  validateOptions(options: string[], type: QuestionType): boolean;
}
```

### ExamGeneratorService
**Responsabilidad:** Construir examen según configuración.

```typescript
interface ExamGeneratorService {
  generateExam(exam: Exam, config: ExamConfig): GeneratedExam;
  selectRandomQuestions(questions: Question[], count: number): Question[];
  shuffleQuestions(questions: Question[]): Question[];
  shuffleOptions(questions: Question[]): Question[];
}
```

### ExamEngineService
**Responsabilidad:** Controlar el flujo del examen.

```typescript
interface ExamEngineService {
  startExam(exam: GeneratedExam): ExamSession;
  answerQuestion(session: ExamSession, questionId: number, answer: number): void;
  nextQuestion(session: ExamSession): void;
  getCurrentQuestion(session: ExamSession): Question;
  isExamFinished(session: ExamSession): boolean;
}
```

### ScoringService
**Responsabilidad:** Calcular y almacenar puntuaciones.

```typescript
interface ScoringService {
  evaluateAnswer(question: Question, userAnswer: number): boolean;
  calculateScore(session: ExamSession): number;
  calculatePercentage(correct: number, total: number): number;
  getStatistics(session: ExamSession): Statistics;
}
```

### StorageService
**Responsabilidad:** Guardar y recuperar datos.

```typescript
interface StorageService {
  saveFile(file: ExamFile): Promise<void>;
  getFile(fileId: string): Promise<ExamFile>;
  updateFile(fileId: string, file: ExamFile): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
  listFiles(): Promise<ExamFile[]>;
  saveExamSession(session: ExamSession): Promise<void>;
  getExamSession(sessionId: string): Promise<ExamSession>;
  saveHistory(entry: HistoryEntry): Promise<void>;
  getHistory(fileId: string): Promise<HistoryEntry[]>;
}
```

---

## Beneficios de esta Arquitectura

✅ **Separación de responsabilidades** - Cada servicio tiene un propósito único  
✅ **Fácil de probar** - Servicios independientes, pruebas unitarias simples  
✅ **Fácil de mantener** - Cambios aislados en servicios específicos  
✅ **Fácil de extender** - Agregar nuevas funcionalidades sin afectar lo existente  
✅ **Reutilizable** - Servicios pueden usarse en diferentes contextos  
✅ **Escalable** - Estructura preparada para crecimiento futuro  

---

## Resumen de Fases

| Fase | Nombre | Duración estimada |
|---|---|---|
| 1 | Preparación del Proyecto | 1-2 horas |
| 2 | Arquitectura General | 2-3 horas |
| 3 | Skeleton de Interfaz | 4-6 horas |
| 4 | Persistencia Local | 2-3 horas |
| 5 | Carga de Archivos | 2-3 horas |
| 6 | Parser | 3-4 horas |
| 7 | Validación | 2-3 horas |
| 8 | Gestión de Archivos | 2-3 horas |
| 9 | Configuración | 2-3 horas |
| 10 | Generador de Examen | 2-3 horas |
| 11 | Motor del Examen | 4-5 horas |
| 12 | Persistencia Automática | 3-4 horas |
| 13 | Motor de Calificación | 2-3 horas |
| 14 | Pantalla de Resultados | 1-2 horas |
| 15 | Revisión | 2-3 horas |
| 16 | Historial | 2-3 horas |
| 17 | Recuperación | 1-2 horas |
| 18 | Optimización | 4-6 horas |
| 19 | Testing | 6-8 horas |
| **TOTAL** | | **50-80 horas** |

---

---

**Documento versión 1.0 - Junio 2026**
**Especificación completa y lista para desarrollo**
