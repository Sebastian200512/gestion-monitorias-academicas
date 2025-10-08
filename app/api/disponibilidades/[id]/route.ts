import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();
    const { monitor_id, materia_id, dia, hora_inicio, hora_fin, ubicacion } = body;

    // Check if the slot exists
    const checkQuery = `SELECT * FROM disponibilidades WHERE id = ?`;
    const slots = await query(checkQuery, [id]);

    if (slots.length === 0) {
      return NextResponse.json({ ok: false, msg: "Disponibilidad no encontrada" }, { status: 404 });
    }

    // Update the availability slot
    const updateQuery = `
      UPDATE disponibilidades
      SET monitor_id = ?, materia_id = ?, dia = ?, hora_inicio = ?, hora_fin = ?, ubicacion = ?
      WHERE id = ?
    `;
    await query(updateQuery, [monitor_id, materia_id, dia, hora_inicio, hora_fin, ubicacion, id]);

    return NextResponse.json({ ok: true, msg: "Disponibilidad actualizada exitosamente", data: { id } });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Check if the slot exists and belongs to a monitor
    const checkQuery = `
      SELECT d.*, u.nombre_completo as monitor_nombre
      FROM disponibilidades d
      JOIN usuarios u ON d.monitor_id = u.id
      WHERE d.id = ?
    `;
    const slots = await query(checkQuery, [id]);

    if (slots.length === 0) {
      return NextResponse.json({ ok: false, msg: "Disponibilidad no encontrada" }, { status: 404 });
    }

    // Delete the availability slot
    const deleteQuery = `DELETE FROM disponibilidades WHERE id = ?`;
    await query(deleteQuery, [id]);

    return NextResponse.json({ ok: true, msg: "Disponibilidad eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
