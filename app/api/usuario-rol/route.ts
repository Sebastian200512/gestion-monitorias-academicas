import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rolesQuery = `
      SELECT ur.usuario_id, r.nombre AS rol
      FROM usuario_rol ur
      JOIN roles r ON ur.rol_id = r.id
    `;
    const rolesData = await query(rolesQuery);

    return NextResponse.json(rolesData);
  } catch (err) {
    console.error("Error al obtener roles de usuario:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
