import type { AISettings, AIParseResult, Task, Routine } from '../types';

export async function parseAndRankItems(
  input: string,
  settings: AISettings,
  currentTasks: Task[],
  currentRoutines: Routine[]
): Promise<AIParseResult | null> {
  const lines = input.trim();
  if (!lines) return null;

  // Simplificamos el contexto para la IA para no gastar demasiados tokens
  const contextTasks = currentTasks.map(t => ({ id: t.id, text: t.text, priority: t.priority }));
  const contextRoutines = currentRoutines.map(r => ({ id: r.id, title: r.title, frequency: r.frequency }));

  const prompt = `
Eres un asistente experto de planificación. Analiza el texto proporcionado por el usuario, que puede contener solicitudes para añadir, editar o borrar tareas y rutinas.

Aquí tienes el estado actual de las tareas y rutinas del usuario:
Tareas Actuales:
${JSON.stringify(contextTasks, null, 2)}
Rutinas Actuales:
${JSON.stringify(contextRoutines, null, 2)}

Reglas de clasificación para NUEVOS elementos o EDICIONES:
- Tareas: "text" (nombre), "priority" ('high', 'medium' o 'low'), "minutes" (estimación en mins, ej. 15, 30), "startTime" (HH:MM o null), "endTime" (HH:MM o null), "reason" (razón corta de la prioridad o cambio).
- Rutinas: "title" (nombre), "frequency" ('daily', 'weekdays', 'weekends', 'weekly', 'monthly' o 'custom'), "days" (array de números 0-6 donde 0=domingo), "startTime" (HH:MM o null), "endTime" (HH:MM o null), "reason" (razón).

Para EDITAR, usa el "id" de la tarea/rutina actual y proporciona solo los campos que cambian (más la "reason").
Para BORRAR, incluye solo el "id" en el array de eliminación correspondiente.

DEVUELVE EXCLUSIVAMENTE UN JSON VÁLIDO CON ESTA ESTRUCTURA, SIN NINGÚN TEXTO ADICIONAL:
{
  "tasksToAdd": [ { "text": "...", "priority": "high", "minutes": 30, "startTime": "08:15", "endTime": "10:00", "reason": "..." } ],
  "tasksToEdit": [ { "id": "...", "text": "...", "reason": "..." } ],
  "tasksToDelete": [ "id1", "id2" ],
  "routinesToAdd": [ { "title": "...", "frequency": "daily", "days": [], "startTime": "08:15", "endTime": "10:00", "reason": "..." } ],
  "routinesToEdit": [ { "id": "...", "frequency": "weekends", "reason": "..." } ],
  "routinesToDelete": [ "id3" ],
  "summary": "Resumen en markdown de los cambios que vas a realizar."
}

Texto del usuario:
${lines}
`;

  try {
    const response = await puter.ai.chat(prompt);
    
    let textResponse = typeof response === 'string' 
      ? response 
      : (response?.message?.content || response?.text || String(response));
      
    let cleanedText = textResponse.trim();
    if (cleanedText.startsWith('\`\`\`json')) {
      cleanedText = cleanedText.substring(7);
      if (cleanedText.endsWith('\`\`\`')) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    } else if (cleanedText.startsWith('\`\`\`')) {
      cleanedText = cleanedText.substring(3);
      if (cleanedText.endsWith('\`\`\`')) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    
    cleanedText = cleanedText.trim();
    const result: AIParseResult = JSON.parse(cleanedText);
    
    // Asegurar arrays vacíos si el LLM omite alguno
    result.tasksToAdd = result.tasksToAdd || [];
    result.tasksToEdit = result.tasksToEdit || [];
    result.tasksToDelete = result.tasksToDelete || [];
    result.routinesToAdd = result.routinesToAdd || [];
    result.routinesToEdit = result.routinesToEdit || [];
    result.routinesToDelete = result.routinesToDelete || [];

    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;
    if (result.tasksToAdd.length) {
      result.tasksToAdd.sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return diff !== 0 ? diff : b.minutes - a.minutes;
      });
    }

    return result;
  } catch (error) {
    console.error('Error al usar Puter AI:', error);
    return null;
  }
}
