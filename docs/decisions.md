# Registro de Decisiones Técnicas (ADR): NutreIA

## ADR-001: Persistencia y Autenticación con Supabase
- **Fecha:** 2026-11-05
- **Estado:** Aceptado
- **Contexto:** Se requiere soporte multi-inquilino familiar con permisos diferenciados, RLS en base de datos y backend serverless.
- **Decisión:** Usar PostgreSQL a través de Supabase con Row Level Security activado en todas las tablas familiares. La autenticación se maneja vía Supabase Auth.
- **Consecuencias:** Permite aislar familias de manera nativa e infranqueable en la base de datos sin depender únicamente de filtros en frontend.

## ADR-002: Despliegue en Vercel y Protección de la API de Gemini
- **Fecha:** 2026-11-05
- **Estado:** Aceptado
- **Contexto:** La aplicación se desplegará en Vercel y requiere integración con Gemini para generación de menús y entrenamientos.
- **Decisión:** La `GEMINI_API_KEY` se almacenará como variable de entorno secreta en Vercel. Las peticiones del cliente se dirigirán a endpoints Serverless en `/api/ai/*`. El backend valida los contratos de entrada y salida con esquemas Zod antes de persistir cualquier dato.
- **Consecuencias:** Cero exposición de claves en el navegador, control total de cuotas, validación estricta de formato JSON.

## ADR-003: Determinismo Nutricional y Deportivo vs Asistencia de IA
- **Fecha:** 2026-11-05
- **Estado:** Aceptado
- **Contexto:** La IA generativa puede alucinar o ignorar alérgenos y generar progresiones peligrosas.
- **Decisión:** El cálculo de calorías, la verificación de alérgenos, las advertencias a menores (<18 años) y los incrementos de carga de gimnasio están programados en código TypeScript determinista con pruebas unitarias exhaustivas. La IA solo genera propuestas compositivas y redacción dentro de las reglas preestablecidas.
- **Consecuencias:** Garantía estricta de seguridad médica y deportiva.
