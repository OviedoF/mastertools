/**
 * Genera src/components/map/colombia.ts a partir de los límites departamentales
 * del DANE (paquete @john-guerra/geo-colombia, MIT). Proyección equirectangular
 * corregida por latitud, geometría simplificada con Douglas-Peucker.
 * Uso: node scripts/build-map.mjs
 */
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const geo = require("@john-guerra/geo-colombia/geojson/departments");

const NAMES = {
  "05": "Antioquia", "08": "Atlántico", "11": "Bogotá, D.C.", "13": "Bolívar", "15": "Boyacá",
  "17": "Caldas", "18": "Caquetá", "19": "Cauca", "20": "Cesar", "23": "Córdoba", "25": "Cundinamarca",
  "27": "Chocó", "41": "Huila", "44": "La Guajira", "47": "Magdalena", "50": "Meta", "52": "Nariño",
  "54": "Norte de Santander", "63": "Quindío", "66": "Risaralda", "68": "Santander", "70": "Sucre",
  "73": "Tolima", "76": "Valle del Cauca", "81": "Arauca", "85": "Casanare", "86": "Putumayo",
  "88": "San Andrés y Providencia", "91": "Amazonas", "94": "Guainía", "95": "Guaviare", "97": "Vaupés", "99": "Vichada",
};
const CITIES = [
  ["Barranquilla", -74.7964, 10.9639], ["Puerto Colombia", -74.9547, 10.9878], ["Galapa", -74.8869, 10.8978],
  ["Cartagena", -75.5144, 10.3910], ["Santa Marta", -74.1990, 11.2408], ["Montería", -75.8814, 8.7479],
  ["Cereté", -75.7906, 8.8853], ["Valledupar", -73.2532, 10.4631], ["Chimichagua", -73.8142, 9.2578], ["Sincelejo", -75.3978, 9.3047],
];

const mainland = geo.features.filter((f) => f.properties.DPTO_CCDGO !== "88");
// Extensión continental. Los islotes lejanos (Malpelo, Serranilla, Bajo Nuevo)
// quedan fuera del encuadre y de la geometría.
const LIMITS = { minLon: -79.2, maxLon: -66.8, minLat: -4.3, maxLat: 12.6 };
const inside = ([lon, lat]) => lon >= LIMITS.minLon && lon <= LIMITS.maxLon && lat >= LIMITS.minLat && lat <= LIMITS.maxLat;
let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
const walk = (c, fn) => (typeof c[0] === "number" ? fn(c) : c.forEach((x) => walk(x, fn)));
mainland.forEach((f) => walk(f.geometry.coordinates, (pt) => {
  if (!inside(pt)) return;
  const [lon, lat] = pt;
  if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon; if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
}));
const PAD = 10, W = 1000;
const cos = Math.cos((4.6 * Math.PI) / 180);
const k = (W - 2 * PAD) / ((maxLon - minLon) * cos);
const H = Math.round((maxLat - minLat) * k + 2 * PAD);
const proj = ([lon, lat]) => [PAD + (lon - minLon) * cos * k, PAD + (maxLat - lat) * k];

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  let best = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const d = L ? Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L : Math.hypot(x - x1, y - y1);
    if (d > best) { best = d; idx = i; }
  }
  if (best > eps) return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
  return [pts[0], pts[pts.length - 1]];
}
const area = (r) => Math.abs(r.reduce((s, [x, y], i) => { const [nx, ny] = r[(i + 1) % r.length]; return s + x * ny - nx * y; }, 0) / 2);
const EPS = 1.1, MIN_AREA = 6;
let total = 0;
const departments = geo.features.filter((f) => f.properties.DPTO_CCDGO !== "88").map((f) => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = [];
  polys.forEach((poly) => poly.forEach((ring, ri) => {
    if (!ring.some(inside)) return; // anillo fuera del encuadre continental
    const p = ring.map(proj);
    const a = area(p);
    if (ri > 0 && a < MIN_AREA * 4) return; // agujeros diminutos
    if (ri === 0 && a < MIN_AREA && polys.length > 1) return; // islotes diminutos
    const s = rdp(p, EPS);
    if (s.length < 4) return;
    rings.push(s);
  }));
  if (!rings.length) { const p = polys[0][0].map(proj); rings.push(rdp(p, EPS)); }
  total += rings.reduce((n, r) => n + r.length, 0);
  const d = rings.map((r) => "M" + r.slice(0, -1).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z").join("");
  const [cx, cy] = proj([f.properties.LONGITUD, f.properties.LATITUD]);
  return { code: f.properties.DPTO_CCDGO, name: NAMES[f.properties.DPTO_CCDGO] ?? f.properties.DPTO_CNMBR, d, cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
}).sort((a, b) => a.name.localeCompare(b.name, "es"));

const cities = CITIES.map(([name, lon, lat]) => { const [x, y] = proj([lon, lat]); return { name, x: +x.toFixed(1), y: +y.toFixed(1) }; });

const out = `/* Generado por scripts/build-map.mjs. No editar a mano.
 * Límites departamentales: DANE, Marco Geoestadístico Nacional, vía @john-guerra/geo-colombia (MIT).
 * San Andrés y Providencia se representa aparte, en un recuadro, sin geometría. */
export type Department = { code: string; name: string; d: string; cx: number; cy: number };
export const MAP = { width: ${W}, height: ${H} } as const;
export const DEPARTMENTS: Department[] = ${JSON.stringify(departments)};
export const CITIES: { name: string; x: number; y: number }[] = ${JSON.stringify(cities)};
`;
fs.writeFileSync("src/components/map/colombia.ts", out);
console.log(`departamentos: ${departments.length}, puntos: ${total}, viewBox ${W}x${H}, bytes: ${Buffer.byteLength(out)}`);
