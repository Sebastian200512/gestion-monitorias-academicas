import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { dia, hora_inicio, hora_fin, ubicacion } = body;

    // Check if the slot exists
    const checkQuery = `SELECT * FROM disponibilidades WHERE id = ?`;
    const slots = await query(checkQuery, [id]);

    if (slots.length === 0) {
      return NextResponse.json({ ok: false, msg: "Disponibilidad no encontrada" }, { status: 404 });
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (dia !== undefined) {
      updates.push("dia = ?");
      values.push(dia);
    }
    if (hora_inicio !== undefined) {
      updates.push("hora_inicio = ?");
      values.push(hora_inicio);
    }
    if (hora_fin !== undefined) {
      updates.push("hora_fin = ?");
      values.push(hora_fin);
    }
    if (ubicacion !== undefined) {
      updates.push("ubicacion = ?");
      values.push(ubicacion);
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: false, msg: "No se proporcionaron campos para actualizar" }, { status: 400 });
    }

    // Update the availability slot
    const updateQuery = `
      UPDATE disponibilidades
      SET ${updates.join(", ")}
      WHERE id = ?
    `;
    values.push(id);
    await query(updateQuery, values);

    return NextResponse.json({ ok: true, msg: "Disponibilidad actualizada exitosamente", data: { id } });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // 1) Verificar que exista
    const checkQuery = `
      SELECT d.*, u.nombre_completo AS monitor_nombre
      FROM disponibilidades d
      JOIN usuarios u ON d.monitor_id = u.id
      WHERE d.id = ?
      LIMIT 1
    `;
    const [slot] = await query(checkQuery, [id]);
    if (!slot) {
      return NextResponse.json({ ok: false, msg: "Disponibilidad no encontrada" }, { status: 404 });
    }

    // 2) ¿Tiene citas relacionadas? -> devolver 409 (conflict)
    //    Si quieres permitir borrar cuando todas están canceladas y son pasadas,
    //    cambia este WHERE por algo como: WHERE disponibilidad_id = ? AND estado <> 'cancelada'
    const appointmentCheckQuery = `
      SELECT id
      FROM citas
      WHERE disponibilidad_id = ?
      LIMIT 1
    `;
    const appointmentResult = await query(appointmentCheckQuery, [id]);

    if (appointmentResult.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          code: "HAS_APPOINTMENTS",
          msg:
            "No se puede eliminar esta disponibilidad porque tiene citas registradas. " +
            "Para conservar el histórico, desactívala en lugar de eliminarla."
        },
        { status: 409 }  // <- clave: devolver 409 Conflict
      );
    }

    // 3) Eliminar si no hay relaciones
    const deleteQuery = `DELETE FROM disponibilidades WHERE id = ?`;
    await query(deleteQuery, [id]);

    return NextResponse.json({ ok: true, msg: "Disponibilidad eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}