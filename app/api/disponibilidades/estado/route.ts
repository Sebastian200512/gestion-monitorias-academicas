import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { ids, estado } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, msg: "IDs requeridos" }, { status: 400 });
    }

    if (!["Activa", "Inactiva"].includes(estado)) {
      return NextResponse.json({ ok: false, msg: "Estado inválido" }, { status: 400 });
    }

    // Check for future appointments if deactivating
    if (estado === "Inactiva") {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const conflictQuery = `
        SELECT COUNT(*) as count FROM citas c
        WHERE c.disponibilidad_id IN (${ids.map(() => '?').join(',')})
        AND c.fecha_cita >= ?
        AND c.estado IN ('pendiente', 'confirmada')
      `;

      const conflictResult = await query(conflictQuery, [...ids, today]);
      if (conflictResult[0].count > 0) {
        return NextResponse.json({
          ok: false,
          msg: "No se puede desactivar: hay citas futuras asociadas"
        }, { status: 409 });
      }
    }

    // Update the availability slots
    const updateQuery = `
      UPDATE disponibilidades
      SET estado = ?
      WHERE id IN (${ids.map(() => '?').join(',')})
    `;

    const result = await query(updateQuery, [estado, ...ids]);

    return NextResponse.json({
      ok: true,
      msg: `Disponibilidad ${estado === 'Activa' ? 'activada' : 'desactivada'} exitosamente`,
      updated: result.affectedRows
    });

  } catch (error) {
    console.error("Error updating availability status:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
