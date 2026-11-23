/**
 * Prueba del WhatsApp a técnicos contra un servidor simulado de Meta (no envía mensajes reales).
 * Requiere una base LOCAL migrada con `pnpm portal campo-demo`.
 *
 *   DATABASE_URL=postgres://…localhost… npx tsx --conditions=react-server scripts/probar-whatsapp-campo.mts
 */
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("Solo contra una base local.");

type Llamada = { ruta: string; auth: string; cuerpo: Record<string, unknown> };
const llamadas: Llamada[] = [];
let fallar = false;
const srv = createServer((req, res) => {
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", () => {
    llamadas.push({ ruta: req.url ?? "", auth: req.headers.authorization ?? "", cuerpo: JSON.parse(b) });
    res.writeHead(fallar ? 400 : 200, { "content-type": "application/json" });
    res.end(fallar ? JSON.stringify({ error: { message: "template name does not exist" } }) : JSON.stringify({ messages: [{ id: `wamid.${llamadas.length}` }] }));
  });
});
await new Promise<void>((r) => srv.listen(0, "127.0.0.1", r));
process.env.WHATSAPP_API_URL = `http://127.0.0.1:${(srv.address() as AddressInfo).port}`;

const { query, one } = await import("../src/lib/portal/db");
const { notificarServicio, avisarCambio, probarWhatsAppCampo } = await import("../src/lib/campo/notificar");

let ok = 0;
const check = (c: unknown, m: string) => {
  if (!c) throw new Error(`FALLA: ${m}`);
  ok++;
  console.log("ok -", m);
};

const s = (await one<{ id: string; tecnico: string; fecha_hora: Date }>(
  "select id, tecnico, fecha_hora from campo_servicios where estado in ('notificado','programado') order by fecha_hora limit 1",
))!;
await query("update campo_servicios set estado = 'programado' where id = $1", [s.id]);
await query("update usuarios set telefono = null where id = $1", [s.tecnico]);

// 1. Sin configurar.
delete process.env.WHATSAPP_TEMPLATE_CAMPO;
let r = await notificarServicio(s.id, "asignado");
check(!r.ok && /sin configurar/.test(r.detalle), "sin plantilla → no envía y lo registra");

process.env.WHATSAPP_TOKEN = "token-de-prueba";
process.env.WHATSAPP_PHONE_ID = "1234567890";
process.env.WHATSAPP_TEMPLATE_CAMPO = "servicio_tecnico";
process.env.WHATSAPP_LANG = "es";

// 2. Sin teléfono.
r = await notificarServicio(s.id, "asignado");
check(!r.ok && /teléfono/.test(r.detalle), "técnico sin teléfono → no envía y lo registra");
check(llamadas.length === 0, "no llamó a Meta");

// 3. Asignación.
await query("update usuarios set telefono = '573001234567' where id = $1", [s.tecnico]);
r = await notificarServicio(s.id, "asignado");
check(r.ok, "asignación enviada");
const c = llamadas.at(-1)!;
const t = c.cuerpo.template as { name: string; language: { code: string }; components: { type: string; parameters: { text: string }[] }[] };
check(c.ruta === "/1234567890/messages" && c.auth === "Bearer token-de-prueba", "usa el número y el token de Ajustes");
check(c.cuerpo.to === "573001234567" && t.name === "servicio_tecnico" && t.language.code === "es", "plantilla, idioma y destinatario");
check(t.components[0].parameters[0].text === "Técnico", "{{1}} = primer nombre");
check(/^le asignamos el servicio MT-\d{4}-\d{5} · /.test(t.components[0].parameters[1].text) && !/\n/.test(t.components[0].parameters[1].text), "{{2}} = aviso sin saltos de línea");
console.log("   ", t.components[0].parameters[1].text);
check(t.components[1].type === "button" && t.components[1].parameters[0].text === s.id, "botón con el id del servicio (deep link)");
const est = await one<{ estado: string }>("select estado from campo_servicios where id = $1", [s.id]);
check(est!.estado === "notificado", "programado → notificado");

// 4. Cambios desde el administrador.
const n0 = llamadas.length;
const otro = (await one<{ id: string }>(
  "insert into usuarios (nombre, correo, rol, clave_hash) values ('Otra Técnica (demo)', 'otra@demo.test', 'tecnico', 'x') on conflict (correo) do update set nombre = excluded.nombre returning id",
))!;
await avisarCambio(s.id, { antes: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "notificado" }, despues: { tecnico: s.tecnico, fecha_hora: new Date(s.fecha_hora.getTime() + 3600_000), estado: "reprogramado" } });
check(llamadas.length === n0 + 1 && /se reprogramó/.test(JSON.stringify(llamadas.at(-1)!.cuerpo)), "reprogramación avisa");
await avisarCambio(s.id, { antes: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "notificado" }, despues: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "cancelado" } });
check(/fue cancelado/.test(JSON.stringify(llamadas.at(-1)!.cuerpo)), "cancelación avisa");
await query("update usuarios set telefono = '573009998877' where id = $1", [otro.id]);
await avisarCambio(s.id, { antes: { tecnico: otro.id, fecha_hora: s.fecha_hora, estado: "notificado" }, despues: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "notificado" } });
const ult = llamadas.slice(-2).map((l) => `${l.cuerpo.to} ${JSON.stringify(l.cuerpo)}`);
check(/573009998877.*se asignó a otro técnico/.test(ult[0]) && /573001234567.*le asignamos/.test(ult[1]), "reasignación: avisa al que lo pierde y al nuevo");
const n1 = llamadas.length;
await avisarCambio(s.id, { antes: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "notificado" }, despues: { tecnico: s.tecnico, fecha_hora: s.fecha_hora, estado: "notificado" } });
check(llamadas.length === n1, "sin cambios relevantes no envía nada");

// 5. Error de Meta.
fallar = true;
r = await notificarServicio(s.id, "asignado");
check(!r.ok && /HTTP 400/.test(r.detalle), "error de Meta se informa");
fallar = false;

// 6. Prueba de Ajustes.
r = await probarWhatsAppCampo();
check(r.ok, `prueba de Ajustes: ${r.detalle}`);

const reg = await query<{ estado: string; n: string }>(
  "select estado, count(*)::text as n from campo_notificaciones where servicio = $1 group by estado order by estado",
  [s.id],
);
console.log("    registro:", reg.map((x) => `${x.estado}=${x.n}`).join(", "));
check(reg.some((x) => x.estado === "fallida") && reg.some((x) => x.estado === "enviada") && reg.some((x) => x.estado === "sin_configurar"), "cada intento queda registrado");

await query("update usuarios set telefono = null where id = $1", [otro.id]);
console.log(`\n${ok} verificaciones correctas`);
srv.close();
process.exit(0);
