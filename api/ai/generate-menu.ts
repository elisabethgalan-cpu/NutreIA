import { GoogleGenerativeAI } from '@google/generative-ai';

interface RequestBody {
  familyId: string;
  members: {
    name: string;
    birthDate: string;
    nutritionGoal: string;
    allergies: string[];
    excludedFoods: string[];
  }[];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          warning: 'GEMINI_API_KEY no configurada. Generando propuesta de menú demostrativa.',
          menu: generateFallbackMenu(body.members),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
Actúa como un dietista profesional especializado en patrón dietético mediterráneo.
Genera un menú semanal estructurado para una familia con los siguientes miembros:
${JSON.stringify(body.members, null, 2)}

REGLAS CRÍTICAS INFRANQUEABLES:
1. Siete días (Lunes a Domingo).
2. Tres comidas diarias: Desayuno, Comida y Cena.
3. Patrón mediterráneo auténtico: Verduras variadas todos los días, aceite de oliva virgen extra, legumbres, fruta entera, cereales integrales y pescado.
4. ALÉRGENOS: BLOQUEO TOTAL. No incluyas ningún ingrediente listado en las alergias de ningún miembro.
5. MENORES: Si hay menores de edad (<18 años), no propongas restricciones calóricas ni dietas hipocalóricas para ellos.

Devuelve estrictamente un JSON con esta estructura:
{
  "week_overview": "Resumen nutricional de la semana",
  "days": [
    {
      "day_name": "Lunes",
      "meals": [
        {
          "type": "breakfast",
          "recipe_name": "Nombre de la receta",
          "description": "Descripción breve",
          "approx_time_minutes": 15,
          "ingredients": [
            { "name": "Ingrediente", "quantity": 100, "unit": "g" }
          ],
          "instructions": ["Paso 1", "Paso 2"]
        }
      ]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return new Response(JSON.stringify({ menu: parsedData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Error procesando solicitud con Gemini',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function generateFallbackMenu(members: RequestBody['members']) {
  return {
    week_overview: 'Menú semanal mediterráneo equilibrado de respaldo',
    days: [
      {
        day_name: 'Lunes',
        meals: [
          {
            type: 'breakfast',
            recipe_name: 'Tostada de pan de centeno con aguacate y huevo pochado',
            description: 'Grasas saludables monoinsaturadas y proteína de alto valor biológico',
            approx_time_minutes: 10,
          },
          {
            type: 'lunch',
            recipe_name: 'Salmón al horno con verduras y patatas al vapor',
            description: 'Rico en Omega-3 y antioxidantes de verduras frescas',
            approx_time_minutes: 25,
          },
          {
            type: 'dinner',
            recipe_name: 'Tortilla de espinacas y queso fresco con ensalada mixta',
            description: 'Cena ligera de fácil digestión',
            approx_time_minutes: 15,
          },
        ],
      },
    ],
  };
}
