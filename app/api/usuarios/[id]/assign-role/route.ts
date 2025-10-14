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

    // Verificar si el usuario ya tiene este rol
    const existing = await query(
      "SELECT * FROM usuario_rol WHERE usuario_id = ? AND rol_id = ?",
      [userId, roleId]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "El usuario ya tiene este rol" }, { status: 409 });
    }

    // Insertar el rol (asumiendo admin_id = 1 por simplicidad, o null)
    await query(
      "INSERT INTO usuario_rol (usuario_id, rol_id, asignado_por_admin) VALUES (?, ?, ?)",
      [userId, roleId, 1] // Cambia 1 por el ID del admin actual si es necesario
    );

    return NextResponse.json({ message: "Rol asignado exitosamente" });
  } catch (err) {
    console.error("Error al asignar rol:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
