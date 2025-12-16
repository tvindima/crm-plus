import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session");

    if (!token?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      email: string;
      role: string;
      name: string;
    };

    return NextResponse.json({
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });
  } catch (error) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }
}
