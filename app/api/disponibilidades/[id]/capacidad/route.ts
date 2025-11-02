import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json({ ok: false, msg: "Fecha requerida" }, { status: 400 });
    }

    // Verificar si la disponibilidad existe
    const disp = await query("SELECT id FROM disponibilidades WHERE id = ?", [id]);
    if (disp.length === 0) {
      return NextResponse.json({ ok: false, msg: "Disponibilidad no encontrada" }, { status: 404 });
    }

    // Contar citas activas para esa fecha y disponibilidad
    const result = await query(
      `SELECT COUNT(*) AS ocupadas
       FROM citas
       WHERE disponibilidad_id = ?
         AND fecha_cita = ?
         AND estado IN ('pendiente', 'confirmada')`,
      [id, fecha]
    );

    const ocupadas = result[0]?.ocupadas || 0;
    const limite = 10;
    const disponibles = Math.max(limite - ocupadas, 0);

    return NextResponse.json({ ok: true, ocupadas, limite, disponibles });
  } catch (error) {
    console.error("Error obteniendo capacidad:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
