import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await req.json(); // e.g., "MONITOR"
    const { id } = await params;
    const userId = parseInt(id);

    if (!role || !userId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // Verificar si el rol existe
    const roleCheck = await query("SELECT id FROM roles WHERE nombre = ?", [role]);
    if (roleCheck.length === 0) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }
    const roleId = roleCheck[0].id;

    // Verificar si el usuario tiene este rol
    const existing = await query(
      "SELECT * FROM usuario_rol WHERE usuario_id = ? AND rol_id = ?",
      [userId, roleId]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "El usuario no tiene este rol" }, { status: 404 });
    }

    // Eliminar el rol
    await query(
      "DELETE FROM usuario_rol WHERE usuario_id = ? AND rol_id = ?",
      [userId, roleId]
    );

    return NextResponse.json({ message: "Rol removido exitosamente" });
  } catch (err) {
    console.error("Error al remover rol:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
