/** Preguntas predefinidas de Manta en el portal. Sin IA: cada pregunta tiene una respuesta fija o una consulta fija a la base. */

export type PreguntaManta = { id: string; grupo: "datos" | "ayuda"; texto: string };

export const PREGUNTAS_MANTA: PreguntaManta[] = [
  { id: "sin_contactar", grupo: "datos", texto: "¿Qué solicitudes siguen sin contactar?" },
  { id: "emergencias", grupo: "datos", texto: "¿Qué emergencias están abiertas?" },
  { id: "mis_casos", grupo: "datos", texto: "¿Cuáles son mis casos abiertos?" },
  { id: "mis_seguimientos", grupo: "datos", texto: "¿Qué seguimientos tengo pendientes?" },
  { id: "sin_responsable", grupo: "datos", texto: "¿Qué casos no tienen responsable?" },
  { id: "vencidas", grupo: "datos", texto: "¿Qué casos pasaron el plazo de primer contacto?" },
  { id: "semana", grupo: "datos", texto: "¿Cuántas solicitudes llegaron esta semana?" },
  { id: "ganadas_mes", grupo: "datos", texto: "¿Cuántas cotizaciones se ganaron este mes?" },
  { id: "estados", grupo: "ayuda", texto: "¿Qué significa cada estado?" },
  { id: "cerrar", grupo: "ayuda", texto: "¿Cómo cierro un caso?" },
  { id: "seguimiento", grupo: "ayuda", texto: "¿Cómo programo un seguimiento?" },
  { id: "adjuntar", grupo: "ayuda", texto: "¿Cómo adjunto un documento?" },
  { id: "vistas", grupo: "ayuda", texto: "¿Cómo guardo una búsqueda?" },
  { id: "avisos", grupo: "ayuda", texto: "¿Cuándo me llegan avisos?" },
  { id: "roles", grupo: "ayuda", texto: "¿Qué puede hacer cada rol?" },
  { id: "plazos", grupo: "ayuda", texto: "¿Qué plazo hay para el primer contacto?" },
];

export type RespuestaManta = { texto: string; items?: { label: string; href: string }[]; enlace?: { label: string; href: string } };
