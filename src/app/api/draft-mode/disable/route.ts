import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Sale del modo borrador y vuelve al inicio. */
export async function GET(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(url.searchParams.get("to") ?? "/", request.url));
}
