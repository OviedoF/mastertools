/**
 * Administración del portal desde la terminal.
 *   pnpm portal migrate                         crea o actualiza las tablas
 *   pnpm portal user correo "Nombre" rol        crea un usuario con contraseña temporal
 *   pnpm portal reset correo                    nueva contraseña temporal
 *   pnpm portal demo                            usuarios y casos de ejemplo (solo contra una base local)
 *   pnpm portal campo-demo                      técnico y servicios de ejemplo para la app de campo (solo base local)
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { hashPassword, tempPassword } from "../src/lib/portal/password";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL (pnpm portal ya carga .env.local)");
const local = /localhost|127\.0\.0\.1/.test(url);
const pool = new Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
const ROLES = ["gerencia", "comercial", "operaciones", "lectura", "tecnico"];

async function createUser(correo: string, nombre: string, rol: string, clave = tempPassword()) {
  if (!ROLES.includes(rol)) throw new Error(`Rol inválido. Use: ${ROLES.join(", ")}`);
  await pool.query(
    `insert into usuarios (nombre, correo, rol, clave_hash) values ($1,lower($2),$3,$4)
     on conflict (correo) do update set nombre = $1, rol = $3, activo = true`,
    [nombre, correo, rol, await hashPassword(clave)],
  );
  return clave;
}

type Demo = [string, string, string, string, string, string, string, string];
const CASOS: Demo[] = [
  ["cotizacion", "form", "Andrea Pérez", "Distribuciones del Caribe S.A.S.", "Barranquilla", "Pruebas TTR y SFRA", "Necesitamos pruebas a dos transformadores de 500 kVA antes de fin de mes.", "3001112233"],
  ["cotizacion", "manta", "Jorge Salcedo", "", "Montería", "Cambio de comercializador y medida", "Quiero cotizar la medida Nivel II para una planta.", "3105558899"],
  ["emergencia", "manta", "Carlos Mendoza", "Frigorífico La Ceiba", "Sincelejo", "", "Se disparó el transformador y hay olor a quemado", "3157774411"],
  ["cotizacion", "form", "Marta Ruiz", "Solar Costa", "Cartagena", "Energía solar", "Proyecto de 120 kWp para bodega.", "3204443322"],
  ["emergencia", "form", "Luis Herrera", "", "Valledupar", "", "Sin energía en subestación desde la madrugada", "3012229988"],
];

async function main() {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "migrate") {
    await pool.query(readFileSync("db/schema.sql", "utf8"));
    console.log("Tablas listas.");
  } else if (cmd === "user") {
    const [correo, nombre, rol] = a;
    if (!correo || !nombre || !rol) throw new Error('Uso: pnpm portal user correo "Nombre" rol');
    console.log(`Usuario ${correo} (${rol}). Contraseña temporal: ${await createUser(correo, nombre, rol)}`);
  } else if (cmd === "reset") {
    const clave = tempPassword();
    const r = await pool.query(
      "update usuarios set clave_hash = $2, debe_cambiar = true, intentos = 0, bloqueado_hasta = null where lower(correo) = lower($1)",
      [a[0], await hashPassword(clave)],
    );
    console.log(r.rowCount ? `Contraseña temporal: ${clave}` : "No existe ese usuario.");
  } else if (cmd === "setpass") {
    // Solo para entornos de prueba: clave fija, activa al usuario y no pide cambiarla.
    const [correo, clave] = a;
    if (!correo || !clave) throw new Error("Uso: pnpm portal setpass correo clave");
    const r = await pool.query(
      "update usuarios set clave_hash = $2, activo = true, debe_cambiar = false, intentos = 0, bloqueado_hasta = null where lower(correo) = lower($1)",
      [correo, await hashPassword(clave)],
    );
    console.log(r.rowCount ? `Listo: ${correo} activo, clave definida.` : "No existe ese usuario.");
  } else if (cmd === "demo") {
    if (!local) throw new Error("demo solo corre contra una base local.");
    const clave = "Demo-Portal-2026";
    await createUser("gerencia@demo.test", "Gerencia (demo)", "gerencia", clave);
    await createUser("comercial@demo.test", "Laura Comercial (demo)", "comercial", clave);
    await createUser("operaciones@demo.test", "Omar Operaciones (demo)", "operaciones", clave);
    await createUser("lectura@demo.test", "Lectura (demo)", "lectura", clave);
    await pool.query("update usuarios set debe_cambiar = false where correo like '%@demo.test'");
    const { rows } = await pool.query("select count(*)::int as n from solicitudes");
    if (!rows[0].n) {
      for (const [tipo, origen, nombre, empresa, ciudad, servicio, mensaje, tel] of CASOS) {
        const emergencia = tipo === "emergencia";
        const conv = origen === "manta" ? `Manta: Hola, soy Manta, ¿en qué le puedo ayudar?\nCliente: ${mensaje}\nManta: Gracias, un ingeniero se comunicará con usted.` : null;
        const ins = await pool.query(
          `insert into solicitudes (tipo, origen, nombre, empresa, telefono, ciudad, servicio, mensaje, falla, riesgo, conversacion, creada_en)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now() - (random() * interval '3 days')) returning id`,
          [tipo, origen, nombre, empresa || null, tel, ciudad, servicio || null, emergencia ? null : mensaje, emergencia ? mensaje : null, emergencia ? "Sí, hay personas cerca" : null, conv],
        );
        await pool.query("insert into eventos (solicitud, tipo, detalle) values ($1,'creada',$2)", [ins.rows[0].id, JSON.stringify({ origen })]);
      }
    }
    console.log(`Demo lista. Usuarios gerencia@, comercial@, operaciones@ y lectura@demo.test · clave ${clave}`);
  } else if (cmd === "campo-demo") {
    // Servicios de ejemplo para probar la app de campo contra el servidor (solo base local).
    if (!local) throw new Error("campo-demo solo corre contra una base local.");
    const clave = "Demo-Campo-2026";
    await createUser("tecnico@demo.test", "Técnico (demo)", "tecnico", clave);
    await pool.query("update usuarios set debe_cambiar = false where correo = 'tecnico@demo.test'");
    const { rows } = await pool.query("select id from usuarios where correo = 'tecnico@demo.test'");
    const t = rows[0].id;
    const S: [number, number, string, string, string, string, string, string, boolean, boolean][] = [
      [0, 8, "Inspección integral de medida semidirecta", "Bodega de ejemplo", "Carrera 38 # 74-120", "Atlántico", "Barranquilla", "Revisión integral del sistema de medida.", false, false],
      [0, 14, "Revisión conjunta NT2", "Planta de ejemplo", "Vía 40 # 85-300", "Atlántico", "Barranquilla", "Revisión conjunta con el operador de red. Medida en poste a 6 m.", true, true],
      [1, 9, "Cambio de medidor", "Local de ejemplo", "Calle 30 # 21-45", "Atlántico", "Soledad", "Retiro e instalación de medidor.", false, true],
    ];
    for (const [dias, hora, actividad, cliente, direccion, dep, ciudad, desc, alturas, vehiculo] of S) {
      await pool.query(
        `insert into campo_servicios (cliente, direccion, id_frontera, comercializador, departamento, ciudad, actividad, fecha_hora, descripcion, tecnico, alturas, vehiculo, estado)
         values ($1,$2,'FRT00012345','Comercializadora de ejemplo',$3,$4,$5, date_trunc('day', now() at time zone 'America/Bogota') at time zone 'America/Bogota' + make_interval(days => $6, hours => $7), $8, $9, $10, $11, 'notificado')`,
        [cliente, direccion, dep, ciudad, actividad, dias, hora, desc, t, alturas, vehiculo],
      );
    }
    console.log(`Listo: tecnico@demo.test · clave ${clave} · ${S.length} servicios asignados.`);
  } else {
    console.log("Comandos: migrate | user | reset | setpass | demo | campo-demo");
  }
  await pool.end();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
