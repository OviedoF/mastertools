import {
  Activity,
  ClipboardList,
  DraftingCompass,
  Factory,
  FileCheck2,
  Gauge,
  HardHat,
  LifeBuoy,
  Power,
  RadioTower,
  Scale,
  SearchCheck,
  Sun,
  TriangleAlert,
  UtilityPole,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Íconos disponibles para el contenido (servicios y pasos). Las claves son
 * las que se eligen en el panel de edición; el componente se resuelve aquí.
 */
export const ICONS = {
  "drafting-compass": DraftingCompass,
  factory: Factory,
  zap: Zap,
  activity: Activity,
  gauge: Gauge,
  "radio-tower": RadioTower,
  scale: Scale,
  power: Power,
  sun: Sun,
  "utility-pole": UtilityPole,
  wrench: Wrench,
  "triangle-alert": TriangleAlert,
  "search-check": SearchCheck,
  "clipboard-list": ClipboardList,
  "hard-hat": HardHat,
  "file-check": FileCheck2,
  "life-buoy": LifeBuoy,
} as const satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export function getIcon(key: string | null | undefined, fallback: IconKey = "zap"): LucideIcon {
  return (ICONS as Record<string, LucideIcon>)[key ?? ""] ?? ICONS[fallback];
}
