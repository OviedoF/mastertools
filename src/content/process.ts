import type { IconKey } from "@/components/ui/icon-map";

export type ProcessStep = {
  n: number;
  title: string;
  text: string;
  detail: string;
  icon: IconKey;
};

/** "Así trabajamos en cada proyecto" (Inicio, bloque 5; Nosotros, metodología). */
export const processSteps: ProcessStep[] = [
  {
    n: 1,
    title: "Diagnóstico",
    text: "Evaluamos la instalación y lo que necesita.",
    detail:
      "Visita técnica o revisión de la información que nos comparte, para entender el estado real de la instalación.",
    icon: "search-check",
  },
  {
    n: 2,
    title: "Planeación",
    text: "Definimos alcance, tiempos y recursos.",
    detail:
      "Propuesta técnica con el alcance, los equipos, el personal y los tiempos estimados de cada actividad.",
    icon: "clipboard-list",
  },
  {
    n: 3,
    title: "Ejecución",
    text: "Intervenimos en campo con personal certificado.",
    detail:
      "Personal con matrícula CONTE vigente, EPP completo y zona de trabajo señalizada.",
    icon: "hard-hat",
  },
  {
    n: 4,
    title: "Pruebas",
    text: "Verificamos y validamos con equipos calibrados.",
    detail:
      "Mediciones y ensayos con instrumentación calibrada antes de energizar o entregar.",
    icon: "gauge",
  },
  {
    n: 5,
    title: "Entrega",
    text: "Le entregamos un informe técnico.",
    detail:
      "Informe con las pruebas realizadas, los resultados, el registro fotográfico y las recomendaciones.",
    icon: "file-check",
  },
  {
    n: 6,
    title: "Soporte",
    text: "Lo acompañamos después de la entrega.",
    detail:
      "Resolvemos dudas y seguimos disponibles para el mantenimiento y las próximas etapas.",
    icon: "life-buoy",
  },
];
