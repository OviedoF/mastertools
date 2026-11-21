/**
 * Horario de oficina del equipo comercial: lunes a viernes de 8:00 a 16:00,
 * hora de Colombia. Fuera de ese horario Manta aclara que la solicitud queda
 * registrada y se contacta el próximo día hábil (documento de estructura, 6.4).
 */
export function isOfficeHours(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const laborable = !["Sat", "Sun"].includes(weekday);
  return laborable && hour >= 8 && hour < 16;
}
