-- Datos Semilla de Demostración (Seed Data) para NutreIA
-- Fecha: 2026-11-05
-- Base de Datos: PostgreSQL / Supabase

-- 1. Alérgenos Oficiales (Reglamento UE 1169/2011)
INSERT INTO public.allergens (id, code, name) VALUES
('00000000-0000-0000-0000-000000000001', 'gluten', 'Gluten'),
('00000000-0000-0000-0000-000000000002', 'crustaceos', 'Crustáceos'),
('00000000-0000-0000-0000-000000000003', 'huevos', 'Huevos'),
('00000000-0000-0000-0000-000000000004', 'pescado', 'Pescado'),
('00000000-0000-0000-0000-000000000005', 'cacahuetes', 'Cacahuetes'),
('00000000-0000-0000-0000-000000000006', 'soja', 'Soja'),
('00000000-0000-0000-0000-000000000007', 'lacteos', 'Lácteos'),
('00000000-0000-0000-0000-000000000008', 'frutos_cascara', 'Frutos de cáscara'),
('00000000-0000-0000-0000-000000000009', 'apio', 'Apio'),
('00000000-0000-0000-0000-000000000010', 'mostaza', 'Mostaza'),
('00000000-0000-0000-0000-000000000011', 'sesamo', 'Sésamo'),
('00000000-0000-0000-0000-000000000012', 'sulfitos', 'Sulfitos'),
('00000000-0000-0000-0000-000000000013', 'altramuces', 'Altramuces'),
('00000000-0000-0000-0000-000000000014', 'moluscos', 'Moluscos')
ON CONFLICT (code) DO NOTHING;

-- 2. Ingredientes Mediterráneos Contrastados
INSERT INTO public.ingredients (id, name, default_unit, food_group, nutrition_source) VALUES
('10000000-0000-0000-0000-000000000001', 'Aceite de oliva virgen extra', 'ml', 'grasas', 'BEDCA'),
('10000000-0000-0000-0000-000000000002', 'Pechuga de pollo', 'g', 'carnes', 'BEDCA'),
('10000000-0000-0000-0000-000000000003', 'Salmón fresco', 'g', 'pescados', 'BEDCA'),
('10000000-0000-0000-0000-000000000004', 'Lentejas cocidas', 'g', 'legumbres', 'BEDCA'),
('10000000-0000-0000-0000-000000000005', 'Arroz integral', 'g', 'cereales', 'BEDCA'),
('10000000-0000-0000-0000-000000000006', 'Huevos camperos', 'unidad', 'huevos', 'BEDCA'),
('10000000-0000-0000-0000-000000000007', 'Espinacas frescas', 'g', 'verduras', 'BEDCA'),
('10000000-0000-0000-0000-000000000008', 'Tomate maduro', 'g', 'verduras', 'BEDCA'),
('10000000-0000-0000-0000-000000000009', 'Aguacate', 'g', 'frutas_grasas', 'BEDCA'),
('10000000-0000-0000-0000-000000000010', 'Copos de avena integral', 'g', 'cereales', 'BEDCA'),
('10000000-0000-0000-0000-000000000011', 'Yogur natural sin azúcar', 'g', 'lacteos', 'BEDCA'),
('10000000-0000-0000-0000-000000000012', 'Nueces peladas', 'g', 'frutos_secos', 'BEDCA'),
('10000000-0000-0000-0000-000000000013', 'Calabacín', 'g', 'verduras', 'BEDCA'),
('10000000-0000-0000-0000-000000000014', 'Manzana', 'g', 'frutas', 'BEDCA')
ON CONFLICT (name) DO NOTHING;

-- Nutrientes por cada 100g de alimento
INSERT INTO public.ingredient_nutrients (ingredient_id, basis_quantity, basis_unit, energy_kcal, protein_g, carbs_g, fat_g, fiber_g) VALUES
('10000000-0000-0000-0000-000000000001', 100, 'ml', 884, 0, 0, 100, 0),
('10000000-0000-0000-0000-000000000002', 100, 'g', 120, 22.5, 0, 2.6, 0),
('10000000-0000-0000-0000-000000000003', 100, 'g', 182, 18.4, 0, 12.0, 0),
('10000000-0000-0000-0000-000000000004', 100, 'g', 116, 9.0, 20.1, 0.4, 7.9),
('10000000-0000-0000-0000-000000000005', 100, 'g', 354, 7.5, 73.0, 2.8, 3.5),
('10000000-0000-0000-0000-000000000006', 100, 'g', 143, 12.6, 0.7, 9.5, 0),
('10000000-0000-0000-0000-000000000007', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2),
('10000000-0000-0000-0000-000000000008', 100, 'g', 18, 0.9, 3.9, 0.2, 1.2),
('10000000-0000-0000-0000-000000000009', 100, 'g', 160, 2.0, 8.5, 14.7, 6.7),
('10000000-0000-0000-0000-000000000010', 100, 'g', 368, 13.5, 58.7, 7.0, 10.0),
('10000000-0000-0000-0000-000000000011', 100, 'g', 61, 3.5, 4.7, 3.3, 0),
('10000000-0000-0000-0000-000000000012', 100, 'g', 654, 15.2, 13.7, 65.2, 6.7),
('10000000-0000-0000-0000-000000000013', 100, 'g', 17, 1.2, 3.1, 0.3, 1.0),
('10000000-0000-0000-0000-000000000014', 100, 'g', 52, 0.3, 13.8, 0.2, 2.4)
ON CONFLICT (ingredient_id) DO NOTHING;

-- Alérgenos por ingrediente
INSERT INTO public.ingredient_allergens (ingredient_id, allergen_id) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004'), -- Salmón -> Pescado
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003'), -- Huevo -> Huevos
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001'), -- Avena -> Gluten
('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000007'), -- Yogur -> Lácteos
('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000008')  -- Nueces -> Frutos de cáscara
ON CONFLICT DO NOTHING;

-- 3. Máquinas de Gimnasio (según documento GIMNASIO.docx)
INSERT INTO public.gym_machines (id, name, machine_type, muscle_groups_primary, muscle_groups_secondary, min_load, max_load, load_increment, load_unit) VALUES
('20000000-0000-0000-0000-000000000001', 'Prensa Inclinada de Piernas', 'placas_o_discos', ARRAY['cuadriceps', 'gluteos'], ARRAY['isquiotibiales'], 20, 250, 5.0, 'kg'),
('20000000-0000-0000-0000-000000000002', 'Extensión de Cuádriceps', 'selectorizada', ARRAY['cuadriceps'], ARRAY[]::TEXT[], 5, 100, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000003', 'Curl Femoral Tumbado/Sentado', 'selectorizada', ARRAY['isquiotibiales'], ARRAY['gemelos'], 5, 80, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000004', 'Máquina de Abductores / Aductores', 'selectorizada', ARRAY['abductores', 'aductores', 'gluteo_medio'], ARRAY[]::TEXT[], 5, 75, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000005', 'Jalón al Pecho (Lat Pulldown)', 'polea', ARRAY['dorsales', 'espalda_alta'], ARRAY['biceps'], 10, 100, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000006', 'Remo Sentado en Polea Baja', 'polea', ARRAY['espalda_media', 'dorsales'], ARRAY['biceps', 'deltoides_posterior'], 10, 95, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000007', 'Press de Pecho en Máquina (Chest Press)', 'selectorizada', ARRAY['pecho'], ARRAY['triceps', 'deltoides_anterior'], 10, 90, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000008', 'Peck Deck / Contractora de Pectoral', 'selectorizada', ARRAY['pecho'], ARRAY['deltoides_anterior'], 5, 70, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000009', 'Press de Hombros en Máquina', 'selectorizada', ARRAY['deltoides'], ARRAY['triceps'], 5, 60, 2.5, 'kg'),
('20000000-0000-0000-0000-000000000010', 'Polea Regulable para Brazos y Hombros', 'polea', ARRAY['triceps', 'biceps', 'deltoides_lateral'], ARRAY[]::TEXT[], 2.5, 50, 1.25, 'kg')
ON CONFLICT (id) DO NOTHING;

-- 4. Ejercicios Asociados
INSERT INTO public.exercises (id, name, description, primary_muscle_group, secondary_muscle_groups, machine_id, difficulty, technique_cues, common_mistakes) VALUES
('30000000-0000-0000-0000-000000000001', 'Prensa inclinada a 45º', 'Empuje controlado de piernas con espalda pegada al respaldo.', 'cuadriceps', ARRAY['gluteos'], '20000000-0000-0000-0000-000000000001', 'beginner', '["Pies al ancho de caderas", "Bajar controlando sin despegar la zona lumbar", "No bloquear rodillas al subir"]'::jsonb, '["Despegar el glúteo del respaldo", "Cerrar rodillas hacia adentro"]'::jsonb),
('30000000-0000-0000-0000-000000000002', 'Extensión de cuádriceps en máquina', 'Aislamiento de la musculatura anterior del muslo.', 'cuadriceps', ARRAY[]::TEXT[], '20000000-0000-0000-0000-000000000002', 'beginner', '["Alinear el eje de la rodilla con la articulación de la máquina", "Pausa de 1 segundo arriba"]'::jsonb, '["Dar tirones con la espalda", "Excesivo rebote"]'::jsonb),
('30000000-0000-0000-0000-000000000003', 'Curl femoral sentado', 'Flexión de rodilla para aislar isquiotibiales.', 'isquiotibiales', ARRAY[]::TEXT[], '20000000-0000-0000-0000-000000000003', 'beginner', '["Ajustar almohadilla sobre los gemelos bajos", "Movimiento lento y sin inercia"]'::jsonb, '["Mover el tronco hacia adelante"]'::jsonb),
('30000000-0000-0000-0000-000000000004', 'Jalón al pecho con agarre prono', 'Tracción vertical para el desarrollo de dorsales.', 'dorsales', ARRAY['biceps'], '20000000-0000-0000-0000-000000000005', 'beginner', '["Pecho erguido apuntando a la barra", "Llevar los codos hacia abajo y atrás"]'::jsonb, '["Balancearse excesivamente", "Bajar la barra detrás de la nuca"]'::jsonb),
('30000000-0000-0000-0000-000000000005', 'Remo sentado en polea baja', 'Tracción horizontal para densidad de espalda y postura.', 'espalda_media', ARRAY['dorsales', 'biceps'], '20000000-0000-0000-0000-000000000006', 'beginner', '["Mantener pecho alto y hombros alejados de orejas", "Juntar escápulas al final de la tracción"]'::jsonb, '["Redondear la espalda lumbar", "Tirar sólo con los brazos"]'::jsonb),
('30000000-0000-0000-0000-000000000006', 'Press de pecho sentado en máquina', 'Empuje horizontal para desarrollo seguro de pectoral.', 'pecho', ARRAY['triceps'], '20000000-0000-0000-0000-000000000007', 'beginner', '["Asiento regulado a la altura del esternón", "Codos a 45 grados del torso"]'::jsonb, '["Subir los codos hacia los hombros (riesgo articular)"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
