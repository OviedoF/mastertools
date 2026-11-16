import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

const g = globalThis as unknown as { __portalPool?: Pool };

export const dbConfigured = () => Boolean(process.env.DATABASE_URL);

function pool(): Pool {
  if (!g.__portalPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL no está configurada");
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__portalPool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: local ? false : { rejectUnauthorized: false },
    });
  }
  return g.__portalPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool().query<T>(text, params);
  return r.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(text, params))[0] ?? null;
}

/** Corre varias escrituras en una sola transacción (cambio + evento van juntos o no van). */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("begin");
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
