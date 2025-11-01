import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const sql = `
      SELECT id, nombre_completo, correo, programa, semestre, codigo
      FROM usuarios
      WHERE id = ?
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
