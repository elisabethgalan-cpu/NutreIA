# Especificación funcional y técnica para Antigravity
## Aplicación familiar de alimentación y entrenamiento

**Versión:** 1.0  
**Fecha:** 5 de noviembre de 2026  
**Estado:** Especificación inicial para construir un MVP extensible  
**Idioma de la interfaz:** Español  
**Nombre provisional:** Asistente Familiar

---

# 1. Instrucciones principales para Antigravity

Construye una aplicación web full-stack, responsive y en español, para gestionar dos áreas relacionadas pero funcionalmente independientes:

1. **Alimentación familiar:** planificación semanal de menús mediterráneos, recetas, información nutricional, valoraciones individuales de los miembros y ranking de platos.
2. **Entrenamiento de gimnasio:** inventario de máquinas disponibles, selección de grupos musculares, generación de rutinas, registro del rendimiento y recomendaciones prudentes de progresión de cargas.

La aplicación debe admitir inicialmente una familia de tres miembros, pero la arquitectura no debe limitarse a tres usuarios. Debe permitir añadir miembros en el futuro sin rediseñar la base de datos.

No construyas todo en un único componente ni concentres la lógica en el frontend. Separa interfaz, backend, reglas de negocio, persistencia y servicios de IA.

## Reglas de trabajo para Antigravity

- Antes de programar, inspecciona el repositorio y conserva los archivos o decisiones existentes que sean válidos.
- Si el repositorio está vacío, inicializa el proyecto con la arquitectura propuesta en este documento.
- Crea primero un plan de implementación y una estructura de carpetas.
- Implementa por fases y verifica cada fase antes de continuar.
- No simules persistencia con datos locales como solución final. Usa la base de datos.
- No inventes información nutricional ni ejercicios como si fueran datos verificados. Identifica los datos de ejemplo como demostrativos.
- No permitas que el modelo de IA decida por sí solo restricciones de seguridad, permisos, cálculos nutricionales o incrementos de cargas.
- Las reglas críticas deben implementarse en código, validarse en backend y probarse.
- No expongas claves de API en el frontend ni las guardes en el repositorio.
- Añade un archivo `.env.example` con los nombres de las variables necesarias, nunca con secretos reales.
- Incluye migraciones, datos semilla de demostración y pruebas automatizadas.
- Si falta una decisión de producto, utiliza los valores configurables indicados aquí y documenta la decisión; no detengas el desarrollo por detalles no esenciales.
- No marques una funcionalidad como terminada si no está conectada a la persistencia y no supera sus criterios de aceptación.

---

# 2. Objetivos del producto

## 2.1 Objetivo general

Crear un asistente familiar que facilite la organización de la alimentación y el entrenamiento, reduzca el trabajo de planificación y utilice las valoraciones e historial para mejorar las recomendaciones.

## 2.2 Objetivos del módulo de alimentación

- Crear menús de lunes a domingo.
- Incluir tres comidas diarias: desayuno, comida y cena.
- Seguir un patrón de dieta mediterránea.
- Incluir verduras diariamente y promover fruta, legumbres, cereales integrales, pescado, frutos secos y aceite de oliva virgen extra.
- Calcular y mostrar cantidades e información nutricional por ración y por miembro.
- Adaptar las raciones a las necesidades individuales.
- Permitir que cada miembro valore cada plato.
- Mostrar los platos y menús mejor valorados al final de cada semana.
- Aprender de las preferencias sin sacrificar variedad y equilibrio nutricional.
- Generar una lista de la compra consolidada.

## 2.3 Objetivos del módulo de gimnasio

- Registrar las máquinas disponibles en el gimnasio.
- Asociar máquinas y ejercicios a los grupos musculares que trabajan.
- Permitir seleccionar zona corporal, objetivo, duración y nivel.
- Generar rutinas usando únicamente equipamiento disponible y adecuado.
- Recomendar series, repeticiones, descansos y una carga inicial prudente.
- Registrar la carga realmente utilizada y el rendimiento.
- Recomendar la carga o ajuste de la siguiente sesión según el desempeño.
- Guardar el historial y mostrar la evolución.

## 2.4 Principios de diseño

- Interfaz sencilla, clara y priorizada para móvil.
- Accesibilidad y legibilidad.
- Datos individuales separados y privados cuando corresponda.
- La familia puede compartir menús, recetas y rankings.
- Las métricas deportivas y los datos personales solo serán visibles para quien tenga permiso.
- Recomendaciones explicables: mostrar por qué se propone un plato o ejercicio.
- La seguridad y la calidad de los datos tienen prioridad sobre la generación automática.

---

# 3. Alcance inicial y decisiones configurables

## 3.1 Usuarios

La primera instalación debe permitir crear una familia y añadir tres perfiles. No codificar el número tres como límite técnico.

Roles:

- **Administrador familiar:** gestiona la familia, invita o crea miembros, configura preferencias y consulta informes compartidos.
- **Miembro:** consulta menús y rutinas asignadas, registra sus valoraciones y sus sesiones.
- **Administrador técnico:** opcional, reservado para mantenimiento de la aplicación; no es necesario para el MVP.

Un miembro no debe poder editar el perfil privado ni los registros de otro miembro salvo que tenga permiso explícito.

## 3.2 Calorías y seguridad nutricional

El requisito inicial contempla un máximo de 1.500 kcal, pero no debe aplicarse automáticamente a todos los miembros.

Implementar estas reglas:

- El objetivo energético es individual y configurable.
- 1.500 kcal puede guardarse como límite solicitado para un perfil adulto, sujeto a validación.
- No aplicar objetivos hipocalóricos ni límites de 1.500 kcal a menores.
- Si un perfil es menor de edad, desactivar la generación de dietas de adelgazamiento y mostrar que sus necesidades deben ser valoradas por pediatría o un dietista-nutricionista.
- No calcular objetivos energéticos para menores mediante fórmulas de adultos.
- En adultos, las estimaciones son orientativas y deben advertir que no sustituyen una valoración profesional.
- Si faltan datos esenciales, no inventar calorías objetivo: pedir que se completen o dejar el objetivo sin definir.
- No presentar una cifra de calorías como prescripción médica.
- No recomendar compensar automáticamente con comida las calorías estimadas por el ejercicio.

La aplicación debe permitir configurar alergias, intolerancias, alimentos excluidos y preferencias. Los ingredientes excluidos por alergia deben bloquear la receta y cualquier sustitución que los contenga. La información de alérgenos debe conservarse en cada ingrediente y receta.

## 3.3 Entrenamiento y seguridad

Edad y peso corporal no son suficientes para calcular una carga segura. Las recomendaciones deben considerar también:

- Experiencia y nivel.
- Objetivo de entrenamiento.
- Historial de ese ejercicio.
- Rango de movimiento y técnica declarada.
- Repeticiones completadas.
- Esfuerzo percibido.
- Dolor, molestias o limitaciones.
- Incrementos disponibles en la máquina.

No recomendar pruebas máximas ni cargas máximas como requisito del MVP. No diagnosticar lesiones. Si el usuario registra dolor, mareo u otra señal de alarma, detener la recomendación del ejercicio y mostrar un aviso para parar y consultar con un profesional sanitario cuando proceda.

---

# 4. Navegación y pantallas

## 4.1 Navegación principal

Menú principal:

1. Inicio
2. Alimentación
   - Menú semanal
   - Recetas
   - Valoraciones
   - Ranking e informes
   - Lista de la compra
3. Gimnasio
   - Mi gimnasio y máquinas
   - Ejercicios
   - Crear entrenamiento
   - Sesión activa
   - Historial y progresión
4. Familia y perfiles
5. Ajustes

## 4.2 Panel de inicio

Mostrar:

- Semana actual y acceso a la semana anterior/siguiente.
- Resumen del menú de hoy.
- Valoraciones pendientes.
- Próximo entrenamiento o última sesión.
- Resumen semanal de actividad.
- Accesos rápidos a generar menú, valorar comida y comenzar entrenamiento.
- Avisos de alergias, objetivos sin configurar o datos incompletos.

No mostrar datos sensibles de otros miembros en el panel si el usuario no tiene permiso.

## 4.3 Perfiles

Cada perfil debe incluir:

- Nombre visible o alias.
- Fecha de nacimiento o edad.
- Altura.
- Peso actual y fecha de medición.
- Objetivo alimentario.
- Nivel de actividad.
- Preferencias y exclusiones.
- Alergias e intolerancias.
- Objetivo deportivo.
- Nivel de experiencia.
- Días disponibles para entrenar.
- Limitaciones o advertencias relevantes aportadas por el usuario.

Los datos deben poder actualizarse y conservar historial cuando tenga sentido, especialmente peso y objetivos.

---

# 5. Módulo de alimentación

## 5.1 Generación del menú semanal

Permitir generar un menú para una semana concreta, de lunes a domingo, con tres comidas por día:

- Desayuno.
- Comida.
- Cena.

El menú debe mostrar para cada plato:

- Nombre.
- Descripción breve.
- Imagen opcional.
- Ingredientes.
- Cantidad de cada ingrediente en gramos o unidades.
- Cantidad por miembro.
- Preparación.
- Tiempo aproximado.
- Información nutricional por ración.
- Alérgenos.
- Etiquetas: vegetariano, sin gluten (solo si está verificado), alto en fibra, etc.

La aplicación debe distinguir entre peso en crudo y peso cocinado cuando afecte al cálculo nutricional. Las cantidades deben ser inequívocas.

## 5.2 Reglas del patrón mediterráneo

El generador debe priorizar:

- Verduras variadas diariamente, en comida y/o cena.
- Fruta entera diariamente.
- Legumbres de forma regular.
- Cereales preferentemente integrales.
- Aceite de oliva virgen extra como grasa culinaria principal.
- Frutos secos naturales o tostados sin sal, cuando sean adecuados y no exista alergia.
- Pescado y marisco dentro de una frecuencia equilibrada.
- Huevos, aves y otras fuentes de proteína variadas.
- Carne roja y procesada en cantidades moderadas.
- Agua como bebida habitual.

Debe limitar:

- Bebidas azucaradas.
- Exceso de sal.
- Azúcares añadidos.
- Carnes procesadas.
- Productos ultraprocesados de consumo habitual.

La aplicación debe permitir definir frecuencias semanales configurables, no fijarlas de forma rígida para todas las personas.

## 5.3 Cálculo nutricional

Guardar por ingrediente y receta:

- Energía (kcal).
- Proteínas (g).
- Hidratos de carbono (g).
- Grasas totales (g).
- Grasas saturadas (g), si existe el dato.
- Fibra (g), si existe el dato.
- Azúcares (g), si existe el dato.
- Sal o sodio, si existe el dato.
- Alérgenos.

Los cálculos deben derivarse de cantidades y datos nutricionales de ingredientes procedentes de una fuente identificada. Guardar la fuente, fecha y versión de los datos nutricionales cuando estén disponibles.

No inventar nutrientes ausentes. Marcar los datos incompletos y no presentar totales como exactos si faltan ingredientes o cantidades.

La suma diaria debe calcularse para cada miembro según su ración. Mostrar kcal y macronutrientes estimados, con nota de que son estimaciones.

## 5.4 Adaptación de raciones

Un mismo plato puede servirse a toda la familia con cantidades diferentes.

La receta base define ingredientes y cantidades para una ración de referencia. La aplicación calcula la cantidad de cada miembro mediante un factor de ración configurable, validado por el administrador y sin vulnerar restricciones individuales.

No alterar la composición de una receta para un miembro si existe riesgo de alergia o incompatibilidad. En ese caso, proponer una receta alternativa segura.

## 5.5 Catálogo de recetas

Funciones:

- Crear, editar, archivar y duplicar recetas.
- Buscar por nombre, ingrediente, categoría o tiempo de preparación.
- Filtrar por preferencias y restricciones.
- Añadir receta a favoritos.
- Ver historial de veces que se ha servido.
- Mostrar puntuación familiar y puntuación por miembro.
- Marcar recetas pendientes de revisar por información nutricional incompleta.

## 5.6 Valoración individual

Cada miembro puede valorar cada comida que haya probado, con una escala de 1 a 5.

Campos:

- Usuario.
- Plato o receta.
- Menú y fecha.
- Puntuación de 1 a 5.
- Comentario opcional.
- Indicador opcional: repetiría / no repetiría.

Reglas:

- Un miembro puede tener una valoración por plato y servicio; puede editarla.
- Las valoraciones de otros miembros no deben sobrescribir la propia.
- No valorar automáticamente una comida no registrada como probada.
- Mostrar quién ha valorado y quién tiene valoración pendiente, respetando permisos.
- Permitir que el administrador familiar configure si las valoraciones son visibles para todos.

## 5.7 Informe semanal y ranking

Al terminar la semana o cuando el administrador lo solicite, generar:

- Ranking de platos por media familiar.
- Ranking por miembro.
- Número de valoraciones.
- Distribución de puntuaciones.
- Platos mejor y peor valorados.
- Platos con alta aceptación de los tres miembros.
- Platos nuevos con pocas valoraciones, claramente identificados.
- Recetas que conviene repetir.
- Alternativas saludables a platos poco aceptados.

No considerar una receta ganadora por una única valoración sin indicar el tamaño de muestra. Mostrar siempre la cantidad de valoraciones junto a la media.

La puntuación familiar debe calcularse como media de las valoraciones disponibles, pero el informe debe indicar cuántos miembros han puntuado. No imputar valoraciones que no existen.

## 5.8 Lista de la compra

Generar una lista consolidada a partir del menú semanal:

- Sumar cantidades de ingredientes repetidos.
- Agrupar por categorías: verdura y fruta, carnes y pescados, lácteos, despensa, etc.
- Permitir marcar productos comprados.
- Permitir editar cantidades.
- Mantener unidades coherentes y mostrar conversiones cuando sean seguras.
- No sumar ingredientes que no sean comparables sin conversión válida.

---

# 6. Módulo de gimnasio

## 6.1 Perfil deportivo

Por miembro, registrar:

- Edad.
- Peso y altura, si el usuario decide aportarlos.
- Nivel: principiante, intermedio o avanzado.
- Objetivo: salud general, fuerza, hipertrofia, resistencia o movilidad.
- Días disponibles.
- Duración objetivo de la sesión.
- Experiencia con ejercicios.
- Limitaciones o ejercicios que debe evitar.
- Preferencias de entrenamiento.

No deducir el nivel deportivo exclusivamente por edad o peso.

## 6.2 Inventario del gimnasio

Permitir crear uno o varios gimnasios y asociar equipamiento a cada uno.

Cada máquina debe tener:

- Nombre y alias.
- Fabricante/modelo, opcional.
- Tipo de máquina.
- Grupos musculares principales y secundarios.
- Ejercicios compatibles.
- Peso mínimo y máximo, si se conocen.
- Incremento de carga.
- Tipo de unidad (kg/lb).
- Imagen o fotografía opcional.
- Instrucciones y advertencias.
- Estado: disponible, temporalmente no disponible o retirada.

El usuario puede añadir máquinas manualmente, editar sus características y registrar una máquina a partir de una fotografía como ayuda. La identificación por imagen debe confirmarse manualmente; no asumir modelo, pesos o incrementos sin verificación.

## 6.3 Catálogo de ejercicios

Cada ejercicio debe incluir:

- Nombre.
- Grupo muscular principal.
- Grupos secundarios.
- Máquina o equipamiento requerido.
- Descripción paso a paso.
- Ajustes iniciales de la máquina.
- Puntos técnicos importantes.
- Errores frecuentes.
- Variantes o alternativas.
- Nivel de dificultad.
- Contraindicaciones o advertencias generales cuando estén documentadas.
- Imagen o vídeo demostrativo, si existe una fuente autorizada.

No recomendar ejercicios que requieran equipamiento que no esté disponible, salvo que se proponga explícitamente una alternativa.

## 6.4 Creación de entrenamiento

El usuario selecciona:

- Grupo muscular o cuerpo completo.
- Objetivo.
- Duración disponible.
- Nivel.
- Máquinas disponibles (por defecto, las del gimnasio elegido).
- Restricciones o ejercicios excluidos.

El motor de recomendación debe:

1. Filtrar ejercicios por equipamiento disponible.
2. Excluir ejercicios incompatibles con restricciones registradas.
3. Evitar concentrar excesivamente el trabajo en el mismo grupo muscular.
4. Considerar el historial y la recuperación entre sesiones.
5. Proponer orden de ejercicios.
6. Proponer series, repeticiones y descansos adecuados al objetivo y nivel.
7. Proponer una carga inicial prudente solo si existen datos suficientes.
8. Explicar el motivo de cada recomendación.

Si no hay datos suficientes para estimar la carga, solicitar una carga inicial conservadora que el usuario pueda realizar con técnica correcta o recomendar supervisión profesional. No presentar una carga calculada como garantía de seguridad.

## 6.5 Sesión activa y registro

Para cada ejercicio, registrar:

- Carga sugerida.
- Carga realmente utilizada.
- Unidad.
- Series previstas.
- Repeticiones previstas.
- Series completadas.
- Repeticiones reales por serie.
- Descanso real, opcional.
- Esfuerzo percibido (RPE o escala sencilla).
- Técnica: correcta / necesita revisión / no completada.
- Dolor o molestias: sí/no y comentario.
- Observaciones.

La sesión debe poder pausarse, finalizarse y guardarse parcialmente. No perder registros si se cierra o recarga la pantalla.

## 6.6 Progresión de cargas

Implementar una progresión conservadora basada en el rendimiento real.

Reglas orientativas configurables:

- Si completa todas las series y repeticiones con técnica correcta y esfuerzo moderado o bajo en sesiones consistentes, considerar un incremento pequeño.
- Si completa el objetivo con esfuerzo adecuado, mantener la carga.
- Si el esfuerzo es alto o la técnica se deteriora, mantener o reducir carga y revisar volumen.
- Si no completa las repeticiones, no aumentar la carga.
- Si registra dolor, detener la recomendación de progresión y recomendar no continuar ese ejercicio hasta aclararlo.
- Ajustar siempre al incremento real disponible en la máquina.
- No aumentar carga y volumen simultáneamente por defecto.
- No recomendar aumentos bruscos.
- Permitir al usuario aceptar, modificar o rechazar la sugerencia.

La recomendación debe mostrar su explicación, por ejemplo: “Mantener 35 kg: completaste las series, pero el esfuerzo fue alto”. Guardar tanto la recomendación como la decisión final del usuario.

No calcular cargas a partir de edad y peso corporal exclusivamente. No usar fórmulas de 1RM como mecanismo obligatorio para principiantes.

## 6.7 Historial y estadísticas

Mostrar:

- Sesiones por semana.
- Ejercicios realizados.
- Evolución de cargas por ejercicio.
- Repeticiones y series completadas.
- Esfuerzo percibido.
- Grupos musculares trabajados.
- Días de descanso.
- Récords personales registrados por el usuario, sin promover pruebas máximas.
- Tendencias y estancamientos.

Las gráficas deben distinguir carga utilizada de carga sugerida y mostrar unidades.

---

# 7. Motor de inteligencia artificial

## 7.1 Responsabilidades permitidas

La IA puede:

- Proponer recetas y combinaciones de menús.
- Redactar instrucciones de preparación.
- Proponer sustituciones de ingredientes.
- Explicar el equilibrio de un menú.
- Sugerir ejercicios a partir de un catálogo validado.
- Adaptar explicaciones al nivel del usuario.
- Resumir preferencias y valoraciones.
- Explicar tendencias de entrenamiento.

## 7.2 Responsabilidades que no debe asumir

La IA no debe:

- Inventar datos nutricionales exactos.
- Ignorar alergias, intolerancias o exclusiones.
- Asignar 1.500 kcal automáticamente a todos los perfiles.
- Aplicar dietas de adelgazamiento a menores.
- Diagnosticar enfermedades o lesiones.
- Determinar cargas seguras únicamente por edad y peso.
- Recomendar entrenar con dolor.
- Cambiar objetivos, cargas o perfiles sin confirmación del usuario.
- Ejecutar operaciones de base de datos sin pasar por las validaciones del backend.

## 7.3 Flujo de generación de menús

1. Backend recupera perfiles, restricciones, preferencias y objetivos.
2. Backend obtiene recetas e ingredientes permitidos.
3. IA propone un menú estructurado.
4. Backend valida que haya siete días y tres comidas diarias.
5. Backend comprueba exclusiones y alérgenos.
6. Backend calcula los nutrientes desde los ingredientes y cantidades verificadas.
7. Backend valida los objetivos configurados y las reglas de seguridad.
8. Si falla una validación, rechaza o solicita regeneración.
9. El usuario revisa y confirma el menú.
10. Solo entonces se guarda como menú activo.

## 7.4 Flujo de recomendación de entrenamiento

1. Backend obtiene perfil deportivo y restricciones.
2. Recupera máquinas disponibles y ejercicios asociados.
3. Recupera historial y última sesión de cada ejercicio.
4. IA puede ordenar o explicar opciones dentro del catálogo autorizado.
5. Backend valida equipamiento, descanso, restricciones y reglas de progresión.
6. Usuario revisa y confirma la rutina.
7. Se registra el entrenamiento y su rendimiento.
8. La siguiente recomendación usa los datos confirmados.

## 7.5 Contratos de salida

Las respuestas de IA deben usar JSON estructurado validado mediante esquemas. No parsear texto libre para ejecutar operaciones críticas.

Ejemplo conceptual de un plato:

```json
{
  "name": "Pescado al horno con verduras",
  "meal_type": "lunch",
  "ingredients": [
    {
      "ingredient_id": "INGREDIENT_ID",
      "quantity": 150,
      "unit": "g",
      "state": "raw"
    }
  ],
  "instructions": ["Preparar los ingredientes", "Hornear hasta su cocción adecuada"],
  "servings": 1
}
```

Ejemplo conceptual de una propuesta de ejercicio:

```json
{
  "exercise_id": "EXERCISE_ID",
  "machine_id": "MACHINE_ID",
  "sets": 3,
  "target_reps": 10,
  "rest_seconds": 90,
  "suggested_load": null,
  "load_reason": "No hay historial suficiente para estimar una carga.",
  "requires_user_confirmation": true
}
```

Estos ejemplos son contratos de formato, no datos nutricionales o prescripciones.

---

# 8. Arquitectura técnica recomendada

## 8.1 Stack propuesto

- **IDE/agente de desarrollo:** Google Antigravity.
- **Frontend:** React + TypeScript.
- **Build:** Vite.
- **Estilos:** Tailwind CSS.
- **Componentes:** biblioteca accesible y consistente, por ejemplo shadcn/ui.
- **Backend y API:** Supabase (PostgreSQL, Auth, Storage y Edge Functions) o backend equivalente si el proyecto existente lo requiere.
- **Validación:** Zod.
- **Formularios:** React Hook Form.
- **Gráficas:** Recharts.
- **Pruebas unitarias:** Vitest.
- **Pruebas de interfaz:** Playwright.
- **Control de versiones:** Git.

No acoplar la lógica de negocio a Supabase de forma que sea imposible sustituirlo. Usar una capa de servicios/repositorios.

## 8.2 Estructura de carpetas sugerida

```text
src/
  app/
    routes/
    providers/
    layouts/
  components/
    ui/
    shared/
    charts/
  features/
    auth/
    family/
    profiles/
    nutrition/
      menus/
      recipes/
      ratings/
      shopping-list/
      reports/
    training/
      gyms/
      machines/
      exercises/
      workout-plans/
      sessions/
      progression/
    dashboard/
    settings/
  lib/
    api/
    auth/
    validation/
    nutrition/
    training/
    dates/
  hooks/
  types/
  styles/
supabase/
  migrations/
  seed.sql
  functions/
tests/
  unit/
  integration/
  e2e/
docs/
  architecture.md
  data-model.md
  decisions.md
```

## 8.3 Separación de capas

- **Presentación:** páginas, componentes y formularios.
- **Aplicación:** casos de uso y coordinación de procesos.
- **Dominio:** reglas nutricionales, validación de menús, progresión y permisos.
- **Infraestructura:** Supabase, almacenamiento, proveedor de IA y fuentes de datos.

Toda operación sensible debe comprobar permisos y validaciones en backend. Ocultar un botón en frontend no es una medida de seguridad suficiente.

---

# 9. Modelo de datos inicial

Usar UUID como identificador principal, timestamps de creación y actualización, claves foráneas e índices. Aplicar restricciones y políticas de acceso a nivel de base de datos.

## 9.1 Familia y usuarios

### `families`
- `id`
- `name`
- `created_at`
- `created_by`

### `family_members`
- `id`
- `family_id`
- `user_id` (nullable si se permite perfil gestionado por tutor)
- `display_name`
- `role` (admin/member)
- `status`
- `created_at`

### `member_profiles`
- `id`
- `family_member_id`
- `birth_date`
- `height_cm`
- `activity_level`
- `nutrition_goal`
- `energy_target_kcal` (nullable)
- `training_goal`
- `training_level`
- `training_days_per_week`
- `session_duration_minutes`
- `created_at`
- `updated_at`

No almacenar edad como único dato permanente si se dispone de fecha de nacimiento; calcular edad en el momento necesario.

### `body_measurements`
- `id`
- `family_member_id`
- `measured_at`
- `weight_kg`
- `height_cm` (nullable)
- `notes`

### `food_preferences`
- `id`
- `family_member_id`
- `item_name`
- `preference_type` (like/dislike/avoid/allergy/intolerance)
- `severity` (nullable)
- `notes`

### `member_restrictions`
- `id`
- `family_member_id`
- `restriction_type`
- `description`
- `is_active`
- `created_at`

## 9.2 Ingredientes y recetas

### `ingredients`
- `id`
- `name`
- `default_unit`
- `food_group`
- `allergens` (relación normalizada preferible)
- `nutrition_source`
- `nutrition_source_reference`
- `nutrition_checked_at`

### `ingredient_nutrients`
- `id`
- `ingredient_id`
- `basis_quantity`
- `basis_unit`
- `energy_kcal`
- `protein_g`
- `carbs_g`
- `fat_g`
- `saturated_fat_g`
- `fiber_g`
- `sugars_g`
- `salt_g`
- `data_completeness`

### `allergens`
- `id`
- `code`
- `name`

### `ingredient_allergens`
- `ingredient_id`
- `allergen_id`

### `recipes`
- `id`
- `name`
- `description`
- `instructions`
- `prep_time_minutes`
- `cook_time_minutes`
- `category`
- `image_path`
- `created_by`
- `is_archived`
- `created_at`
- `updated_at`

### `recipe_ingredients`
- `id`
- `recipe_id`
- `ingredient_id`
- `quantity`
- `unit`
- `ingredient_state` (raw/cooked/other)
- `optional`

### `recipe_tags`
- `id`
- `recipe_id`
- `tag`

## 9.3 Menús y valoraciones

### `weekly_menus`
- `id`
- `family_id`
- `week_start_date`
- `status` (draft/active/completed/archived)
- `created_by`
- `created_at`
- `approved_at`

### `menu_meals`
- `id`
- `weekly_menu_id`
- `service_date`
- `meal_type` (breakfast/lunch/dinner)
- `recipe_id`
- `display_name`
- `notes`
- `sort_order`

### `meal_servings`
- `id`
- `menu_meal_id`
- `family_member_id`
- `servings_factor`
- `portion_notes`

### `menu_ratings`
- `id`
- `menu_meal_id`
- `family_member_id`
- `rating` (1-5)
- `comment`
- `would_repeat`
- `rated_at`
- Restricción única: `menu_meal_id + family_member_id`

### `shopping_list_items`
- `id`
- `weekly_menu_id`
- `ingredient_id`
- `quantity`
- `unit`
- `category`
- `is_purchased`
- `notes`

## 9.4 Gimnasio y ejercicios

### `gyms`
- `id`
- `family_id`
- `name`
- `location_description`
- `created_at`

### `gym_machines`
- `id`
- `name`
- `machine_type`
- `muscle_groups_primary`
- `muscle_groups_secondary`
- `manufacturer`
- `model`
- `min_load`
- `max_load`
- `load_increment`
- `load_unit`
- `instructions`
- `image_path`
- `status`

### `gym_equipment`
- `id`
- `gym_id`
- `machine_id`
- `availability_status`
- `notes`

### `exercises`
- `id`
- `name`
- `description`
- `primary_muscle_group`
- `secondary_muscle_groups`
- `equipment_type`
- `machine_id` (nullable)
- `difficulty`
- `instructions`
- `technique_cues`
- `common_mistakes`
- `media_url`
- `source_reference`
- `is_active`

### `member_exercise_restrictions`
- `id`
- `family_member_id`
- `exercise_id` (nullable)
- `muscle_group` (nullable)
- `restriction_reason`
- `is_active`

### `workout_plans`
- `id`
- `family_member_id`
- `gym_id`
- `name`
- `goal`
- `target_muscle_groups`
- `duration_minutes`
- `status`
- `created_at`

### `workout_plan_exercises`
- `id`
- `workout_plan_id`
- `exercise_id`
- `sort_order`
- `target_sets`
- `target_reps_min`
- `target_reps_max`
- `rest_seconds`
- `suggested_load`
- `load_unit`
- `load_reason`

### `workout_sessions`
- `id`
- `family_member_id`
- `workout_plan_id` (nullable)
- `gym_id`
- `started_at`
- `finished_at`
- `status`
- `session_notes`

### `exercise_performance`
- `id`
- `workout_session_id`
- `exercise_id`
- `machine_id` (nullable)
- `suggested_load`
- `actual_load`
- `load_unit`
- `target_sets`
- `completed_sets`
- `target_reps`
- `reps_per_set` (JSON estructurado o tabla hija)
- `rpe`
- `technique_status`
- `pain_reported`
- `pain_notes`
- `notes`

### `load_recommendations`
- `id`
- `family_member_id`
- `exercise_id`
- `based_on_performance_id`
- `previous_load`
- `recommended_load`
- `load_unit`
- `reason`
- `status` (pending/accepted/modified/rejected)
- `created_at`

---

# 10. Seguridad, privacidad y permisos

- Usar autenticación segura.
- Activar Row Level Security (RLS) en todas las tablas con datos familiares o personales.
- Un miembro solo accede a su información privada y a los datos compartidos de su familia.
- El administrador familiar gestiona miembros y menús compartidos.
- Las valoraciones deben respetar la configuración de visibilidad.
- No exponer datos de una familia a otra.
- Validar `family_id` y permisos en cada operación del backend.
- No confiar en identificadores enviados por el cliente sin comprobar su pertenencia.
- Guardar secretos solo en variables de entorno o secret manager.
- Registrar errores técnicos sin incluir información sensible innecesaria.
- Permitir exportar los datos del usuario y solicitar su eliminación según la política de privacidad aplicable.
- Aplicar minimización de datos: pedir únicamente los datos necesarios.
- Incluir consentimiento y avisos apropiados antes de tratar datos personales, especialmente cuando haya menores.
- No enviar datos identificables a un proveedor de IA si no es necesario.
- Documentar qué datos se envían a servicios externos.

---

# 11. Diseño visual y experiencia de usuario

## 11.1 Estilo

- Diseño moderno, limpio y familiar.
- Navegación clara.
- Responsive desde móvil.
- Tarjetas para comidas y ejercicios.
- Tablas solo cuando faciliten la comparación.
- Colores diferenciados para alimentación y entrenamiento, manteniendo coherencia visual.
- Contraste suficiente y tamaños legibles.
- Estados visibles: borrador, pendiente, completado, error.
- Formularios con validación y mensajes comprensibles.

## 11.2 Componentes reutilizables

Crear componentes para:

- Selector de miembro.
- Selector de semana.
- Tarjeta de receta.
- Tarjeta de comida.
- Valoración de 1 a 5.
- Resumen nutricional.
- Etiquetas de alérgenos.
- Selector de grupo muscular.
- Tarjeta de máquina.
- Registro de series y repeticiones.
- Campo de carga y unidad.
- Gráfico de progresión.
- Confirmación de acciones.
- Mensajes de error y avisos de seguridad.

## 11.3 Accesibilidad

- Etiquetas asociadas a controles.
- Navegación por teclado.
- Estados no comunicados únicamente por color.
- Texto alternativo en imágenes.
- Mensajes de validación claros.
- Contraste WCAG AA como objetivo.

---

# 12. Validaciones y reglas críticas

## Alimentación

- Un menú semanal activo debe tener siete días y tres comidas por día.
- No permitir activar un menú con ingredientes incompatibles con alergias activas.
- No generar objetivos hipocalóricos para menores.
- No mostrar totales nutricionales como exactos si faltan datos.
- No permitir cantidades negativas o unidades incompatibles.
- No duplicar valoraciones del mismo miembro para la misma comida.
- Mostrar el número de valoraciones junto a las medias.
- El ranking debe excluir o identificar claramente platos sin suficientes valoraciones.

## Gimnasio

- No recomendar máquinas no disponibles.
- No aceptar cargas negativas.
- Validar que la carga respete unidad e incrementos conocidos.
- No aumentar carga si no se completó el objetivo o hubo dolor.
- No proponer progresión automática si la técnica fue incorrecta o desconocida.
- No usar el peso corporal o la edad como único criterio de carga.
- Exigir confirmación del usuario antes de guardar una rutina generada.
- Conservar el registro real aunque el usuario modifique la recomendación.
- No borrar el historial al cambiar de rutina.

---

# 13. Pruebas y criterios de aceptación

La aplicación no se considera lista hasta superar, como mínimo, estas pruebas.

## 13.1 Familia y permisos

- Se puede crear una familia y añadir tres miembros.
- Se puede añadir un cuarto miembro sin cambiar el esquema.
- Un miembro no puede leer o modificar los datos privados de otro.
- Un usuario de otra familia no puede acceder a menús ni entrenamientos.
- El administrador puede gestionar los datos compartidos.

## 13.2 Alimentación

- Se genera una semana de lunes a domingo.
- Cada día contiene desayuno, comida y cena.
- Se muestran ingredientes y cantidades por miembro.
- Se incluyen verduras diariamente según las reglas configuradas.
- Las alergias activas bloquean ingredientes incompatibles.
- El objetivo energético se gestiona individualmente.
- Un perfil menor no recibe un objetivo hipocalórico automático.
- Los cálculos nutricionales se basan en datos identificados.
- Los tres miembros pueden valorar una comida independientemente.
- El usuario puede editar su propia valoración.
- El ranking semanal calcula medias y número de votos correctamente.
- La lista de compra suma ingredientes equivalentes sin duplicarlos.

## 13.3 Gimnasio

- Se pueden registrar máquinas y disponibilidad.
- El generador solo usa máquinas disponibles.
- Se puede seleccionar un grupo muscular.
- Se genera una rutina con ejercicios, series, repeticiones y descansos.
- Se puede registrar la carga real y el rendimiento.
- La siguiente recomendación considera el historial.
- Una sesión fácil y completada puede permitir valorar un pequeño incremento.
- Una sesión incompleta no genera aumento de carga.
- Un registro de dolor impide recomendar progresión para ese ejercicio.
- Se puede consultar el historial y la evolución.

## 13.4 Calidad técnica

- La aplicación funciona en móvil y escritorio.
- Las operaciones principales persisten tras recargar.
- No hay secretos en el frontend.
- RLS está activado y probado.
- Hay pruebas unitarias para cálculos y reglas críticas.
- Hay pruebas de integración para generación y guardado de menús y rutinas.
- Hay pruebas E2E de los flujos principales.
- Los errores de IA o de red no provocan pérdida de datos.

---

# 14. Fases de implementación

Antigravity debe implementar en este orden. Al final de cada fase, ejecutar pruebas y actualizar la documentación.

## Fase 0 — Análisis y planificación

Entregables:
- Inspección del repositorio.
- Documento de arquitectura.
- Estructura de carpetas.
- Diagrama de entidades y relaciones.
- Lista de variables de entorno.
- Plan de pruebas.

No empezar la implementación completa hasta que el plan esté definido.

## Fase 1 — Base técnica y usuarios

- Inicializar frontend y backend.
- Configurar autenticación.
- Crear familia y perfiles.
- Configurar RLS.
- Crear navegación y panel inicial.
- Añadir datos semilla de demostración.
- Probar aislamiento entre familias.

## Fase 2 — Alimentación

- Ingredientes y alérgenos.
- Datos nutricionales y fuentes.
- Recetas.
- Generación de menús.
- Cálculos y validaciones.
- Raciones individuales.
- Valoraciones.
- Ranking semanal.
- Lista de compra.

## Fase 3 — Gimnasio

- Gimnasios y máquinas.
- Catálogo de ejercicios.
- Selección de grupos musculares.
- Generador de rutinas.
- Registro de sesiones.
- Progresión de cargas.
- Historial y gráficos.

## Fase 4 — IA y recomendaciones

- Integración del proveedor de IA mediante backend.
- Salidas estructuradas.
- Validadores de menús y rutinas.
- Gestión de errores y reintentos.
- Registro de prompts/versiones sin almacenar datos sensibles innecesarios.

## Fase 5 — Integración, seguridad y lanzamiento

- Panel general integrado.
- Pruebas de permisos.
- Pruebas de carga básicas.
- Revisión de accesibilidad.
- Copias de seguridad.
- Documentación de instalación y despliegue.
- Revisión de privacidad y tratamiento de datos.

---

# 15. Entregables técnicos obligatorios

Al terminar el MVP, el repositorio debe incluir:

1. Aplicación funcional.
2. Código organizado por módulos.
3. Migraciones de base de datos.
4. Políticas RLS.
5. Datos semilla de demostración claramente identificados.
6. `.env.example`.
7. README con instalación y ejecución local.
8. Instrucciones para configurar Supabase.
9. Instrucciones para configurar el proveedor de IA.
10. Pruebas automatizadas.
11. Documento de arquitectura.
12. Diccionario de datos.
13. Registro de decisiones técnicas.
14. Instrucciones de despliegue.
15. Limitaciones conocidas y mejoras pendientes.

El README debe explicar paso a paso cómo ejecutar el proyecto desde un entorno limpio.

---

# 16. Funcionalidades futuras, fuera del MVP

Diseñar la arquitectura para que posteriormente se puedan incorporar:

- Notificaciones y recordatorios.
- Calendario familiar.
- Integración con Google Calendar.
- Importación de recetas desde enlaces.
- Escáner de códigos de barras.
- Reconocimiento asistido de máquinas mediante fotografías.
- Sincronización con dispositivos de actividad, si existe una integración fiable y autorizada.
- Exportación de informes PDF.
- Presupuesto y coste estimado de la compra.
- Planificación de sobras y aprovechamiento de alimentos.
- Rutinas por días y periodización.
- Comparación de progreso mensual.
- Aplicación móvil nativa o instalable (PWA).

No implementar estas funciones antes de completar y probar el MVP.

---

# 17. Prompt operativo para iniciar el proyecto en Antigravity

Utiliza este documento como especificación principal del producto.

**Primera tarea:** analiza el repositorio y esta especificación. No intentes construir todos los módulos de una sola vez. Devuelve un plan de ejecución por fases, identifica dependencias y riesgos, propone el esquema inicial de base de datos y explica cómo garantizarás la seguridad y las reglas nutricionales/de entrenamiento.

Después de definir el plan, implementa únicamente la Fase 0 y la Fase 1. Ejecuta las pruebas, corrige los errores y documenta el resultado. No avances a la fase siguiente hasta que la fase actual esté funcional y verificada.

Mantén este documento como referencia del proyecto. Si una decisión técnica obliga a modificarlo, registra el cambio en `docs/decisions.md` y actualiza la documentación correspondiente.

**Criterio prioritario:** una aplicación segura, mantenible y con datos fiables es más importante que una aplicación que genere muchas recomendaciones rápidamente.
