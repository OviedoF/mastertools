import "server-only";
import { createSign } from "node:crypto";
import { getSetting } from "../settings";

/**
 * Lectura de Google Analytics 4 con la Data API, sin dependencias: se firma el JWT de la
 * cuenta de servicio con node:crypto. Variables (todas en el servidor, ninguna en el repositorio):
 *   GA4_PROPERTY_ID    número de la propiedad (Administrar > Configuración de la propiedad)
 *   GA4_CLIENT_EMAIL   correo de la cuenta de servicio
 *   GA4_PRIVATE_KEY    clave privada de la cuenta de servicio (con \n literales si va en una línea)
 */

/** Credenciales vigentes: lo guardado en Ajustes manda sobre las variables del servidor. */
async function creds() {
  const [property, email, key] = await Promise.all(["GA4_PROPERTY_ID", "GA4_CLIENT_EMAIL", "GA4_PRIVATE_KEY"].map(getSetting));
  return { property, email, key };
}

export async function ga4Configured() {
  const c = await creds();
  return Boolean(c.property && c.email && c.key);
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");

let token: { value: string; exp: number; email: string } | null = null;

async function accessToken(): Promise<string> {
  const c = await creds();
  if (token && token.email === c.email && token.exp > Date.now() + 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const head = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64(
    JSON.stringify({
      iss: c.email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = (c.key).replace(/\\n/g, "\n");
  const sig = createSign("RSA-SHA256").update(`${head}.${claims}`).sign(key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claims}.${sig}` }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google rechazó las credenciales (${res.status})`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000, email: c.email };
  return token.value;
}

type Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
type Report = { rows?: Row[] };

async function batch(requests: object[]): Promise<Report[]> {
  const { property } = await creds();
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ requests }),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GA4 respondió ${res.status}: ${t.slice(0, 200)}`);
  }
  return ((await res.json()) as { reports: Report[] }).reports;
}

export type Trafico = {
  usuarios: number; usuariosAnt: number;
  nuevos: number;
  sesiones: number; sesionesAnt: number;
  vistas: number; vistasAnt: number;
  duracion: number; duracionAnt: number; // segundos por sesión
  interaccion: number; // tasa de interacción 0..1
  porDia: { dia: string; sesiones: number }[];
  paginas: { ruta: string; vistas: number; usuarios: number }[];
  fuentes: { canal: string; sesiones: number }[];
  dispositivos: { tipo: string; sesiones: number }[];
  ciudades: { ciudad: string; usuarios: number }[];
  clics: { cta: string; n: number }[];
};

const cache = new Map<string, { at: number; data: Trafico }>();
/** Fuerza a releer Google Analytics (después de cambiar las credenciales). */
export const olvidarTrafico = () => {
  cache.clear();
  token = null;
};
const TTL = 30 * 60 * 1000; // media hora: cuida la cuota de la API

const f = (r: Row | undefined, i: number) => Number(r?.metricValues?.[i]?.value ?? 0);
const dim = (r: Row, i = 0) => r.dimensionValues?.[i]?.value ?? "";

export async function trafico(dias: number): Promise<Trafico> {
  const hit = cache.get(String(dias));
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  const actual = { startDate: `${dias - 1}daysAgo`, endDate: "today" };
  const previo = { startDate: `${dias * 2 - 1}daysAgo`, endDate: `${dias}daysAgo` };
  const [totales, dias_, paginas, fuentes, dispositivos, ciudades, clics] = await batch([
    {
      dateRanges: [actual, previo],
      metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews", "averageSessionDuration", "engagementRate"].map((name) => ({ name })),
    },
    { dateRanges: [actual], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" } }] },
    {
      dateRanges: [actual], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 8,
    },
    {
      dateRanges: [actual], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8,
    },
    {
      dateRanges: [actual], dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    },
    {
      dateRanges: [actual], dimensions: [{ name: "city" }], metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 8,
    },
    {
      // Cantidad de clics de conversión. Por botón (cta) solo si el parámetro está registrado como dimensión; ver más abajo.
      dateRanges: [actual], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } },
    },
  ]);

  // Los totales con dos rangos traen una fila por rango (dimensión dateRange implícita).
  const rows = totales.rows ?? [];
  const cur = rows.find((r) => dim(r) === "date_range_0") ?? rows[0];
  const prev = rows.find((r) => dim(r) === "date_range_1");

  let porCta: { cta: string; n: number }[] = [];
  try {
    const [r] = await batch([
      {
        dateRanges: [actual], dimensions: [{ name: "customEvent:cta" }], metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 10,
      },
    ]);
    porCta = (r.rows ?? []).map((x) => ({ cta: dim(x), n: f(x, 0) }));
  } catch {
    // El parámetro "cta" aún no está registrado como dimensión personalizada: se muestra solo el total.
    porCta = (clics.rows ?? []).map((x) => ({ cta: "Todos los clics de conversión", n: f(x, 0) }));
  }

  const data: Trafico = {
    usuarios: f(cur, 0), usuariosAnt: f(prev, 0),
    nuevos: f(cur, 1),
    sesiones: f(cur, 2), sesionesAnt: f(prev, 2),
    vistas: f(cur, 3), vistasAnt: f(prev, 3),
    duracion: f(cur, 4), duracionAnt: f(prev, 4),
    interaccion: f(cur, 5),
    porDia: (dias_.rows ?? []).map((r) => ({ dia: `${dim(r).slice(0, 4)}-${dim(r).slice(4, 6)}-${dim(r).slice(6, 8)}`, sesiones: f(r, 0) })),
    paginas: (paginas.rows ?? []).map((r) => ({ ruta: dim(r), vistas: f(r, 0), usuarios: f(r, 1) })),
    fuentes: (fuentes.rows ?? []).map((r) => ({ canal: dim(r), sesiones: f(r, 0) })),
    dispositivos: (dispositivos.rows ?? []).map((r) => ({ tipo: dim(r), sesiones: f(r, 0) })),
    ciudades: (ciudades.rows ?? []).map((r) => ({ ciudad: dim(r), usuarios: f(r, 0) })),
    clics: porCta,
  };
  cache.set(String(dias), { at: Date.now(), data });
  return data;
}
