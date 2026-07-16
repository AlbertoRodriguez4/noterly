import type { AISettings } from '../types';

export const DEFAULT_AI_SETTINGS: AISettings = {
  highPriorityKeywords: [
    'urgente', 'urgencia', 'importante', 'crítico', 'deadline', 'hoy', 'ahora',
    'inmediato', 'prioridad', 'entrega', 'reunión', 'reunion', 'presentación', 'presentar',
    'cliente', 'jefe', 'llamada', 'entrevista',
  ],
  lowPriorityKeywords: [
    'comprar', 'compra', 'limpiar', 'ordenar', 'opcional', 'cuando pueda',
  ],
  durationKeywords: {
    'reunión': 60, 'reunion': 60, 'call': 30, 'llamada': 30, 'presentar': 45, 'presentación': 45,
    'revisar': 30, 'review': 30, 'revisión': 30, 'escribir': 45, 'redactar': 40, 'documento': 30,
    'correo': 15, 'email': 15, 'responder': 15, 'gym': 60, 'comprar': 20, 'compra': 20,
    'preparar': 40, 'planificar': 30, 'leer': 25, 'estudiar': 45, 'diseñar': 60, 'design': 60,
    'programar': 60, 'code': 60, 'deploy': 20, 'bug': 30, 'fix': 20, 'arreglar': 25, 'organizar': 25,
    'llamar': 15, 'agendar': 10, 'actualizar': 20, 'subir': 10, 'post': 20, 'publicar': 20,
    'entrevista': 60, 'training': 45, 'capacitación': 45, 'configurar': 30, 'instalar': 20,
    'meditar': 15, 'meditación': 15, 'ejercicio': 30, 'entrenar': 45, 'gimnasio': 60,
    'cocinar': 40, 'limpieza': 45, 'pasear': 30, 'caminar': 30,
    'proyecto': 120, 'desarrollo': 90, 'código': 45,
  },
  routineSignals: [
    'cada día', 'todos los días', 'diariamente', 'a diario',
    'cada mañana', 'cada noche', 'por las mañanas', 'por las noches',
    'cada semana', 'semanalmente', 'cada lunes', 'cada martes', 'cada miércoles',
    'cada jueves', 'cada viernes', 'cada sábado', 'cada domingo',
    'entre semana', 'días laborables', 'fines de semana', 'fin de semana',
    'cada mes', 'mensualmente', 'rutina', 'hábito', 'hábito de',
    'antes de dormir', 'al despertar', 'al levantarme', 'al acostarme',
    'regularmente', 'ejercicio diario', 'meditación diaria',
    'de lunes a', 'de martes a', 'de miércoles a', 'de jueves a', 'de viernes a',
    'de sábado a', 'de domingo a',
  ],
};
