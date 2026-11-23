/**
 * Deja solo dígitos con indicativo. Un celular colombiano de 10 dígitos (3xx…) recibe el 57 delante.
 * Un celular argentino (54 + 10 dígitos) recibe el 9 que WhatsApp usa para móviles (549…): sin él, Meta
 * acepta el envío pero puede no entregarlo.
 */
export function normalizarNumero(v: string): string | null {
  let n = v.replace(/\D/g, "");
  if (n.length === 10 && n.startsWith("3")) n = `57${n}`;
  if (n.length === 12 && n.startsWith("54") && !n.startsWith("549")) n = `549${n.slice(2)}`;
  return /^\d{11,15}$/.test(n) ? n : null;
}

/** +57 300 123 4567 */
export const numeroLegible = (n: string) => (n.startsWith("57") && n.length === 12 ? `+57 ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}` : `+${n}`);
