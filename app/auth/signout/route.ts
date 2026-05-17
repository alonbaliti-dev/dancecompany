import { NextResponse } from "next/server";
import { signOutVerifiedAcademySession } from "@/lib/auth/academy-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await signOutVerifiedAcademySession(request);
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
