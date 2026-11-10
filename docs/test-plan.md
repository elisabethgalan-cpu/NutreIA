# Plan de Pruebas: Asistente Familiar NutreIA

## 1. Niveles de Pruebas

### 1.1 Pruebas Unitarias (Vitest)
- **Cálculo Nutricional:**
  - Suma de macronutrientes por ración individual (`servings_factor`).
  - Detección y bloqueo inmediato de alérgenos cruzando ingredientes y preferencias del miembro.
  - Validación de regla de menores: rechazo de dietas hipocalóricas o límites de 1.500 kcal si `edad < 18`.
- **Progresión de Cargas:**
  - Mantener carga si RPE > 7 o técnica no completada.
  - Bloquear progresión si `pain_reported == true`.
  - Aumento prudente (+1 salto de la máquina) solo tras rendimiento consistente y sin dolor.
- **Lista de la compra:**
  - Consolidación y suma correcta de cantidades con unidades homogéneas (g + g, kg + kg con conversión).

### 1.2 Pruebas de Integración (Supabase RLS)
- Usuario A (Familia 1) no puede leer ni modificar menús, perfiles o rutinas de Familia 2.
- Miembro no administrador no puede modificar el perfil privado de otro miembro sin permiso.
- Integridad referencial: no se puede valorar dos veces el mismo plato por el mismo miembro en el mismo servicio (`UNIQUE(menu_meal_id, family_member_id)`).

### 1.3 Pruebas de Interfaz y E2E
- Creación de familia e incorporación de 3 miembros iniciales.
- Navegación fluida por calendario semanal (desayuno, comida, cena).
- Registro de una sesión de entrenamiento con temporizador y guardado de rendimiento.
