import { NextResponse } from "next/server";
import { requiereTecnico, responderError } from "@/lib/campo/auth";
import { catalogos } from "@/lib/campo/servicios";

export const dynamic = "force-dynamic";

/** Ítems vigentes del ATS y del pre-operacional (administrables). */
export async function GET(req: Request) {
  try {
    await requiereTecnico(req);
    return NextResponse.json(await catalogos(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return responderError(e);
  }
}
