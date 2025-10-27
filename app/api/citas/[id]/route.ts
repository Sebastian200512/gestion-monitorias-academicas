import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { estado, fecha_cita, notas_monitor } = await req.json();

  if (!estado && !fecha_cita && notas_monitor === undefined) {
    return NextResponse.json({ ok: false, msg: "Estado, fecha o notas requeridos" }, { status: 400 });
  }

  try {
    let updateSql = `UPDATE citas SET `;
    const params: any[] = [];
    const updates: string[] = [];

    if (estado) {
      updates.push(`estado = ?`);
      params.push(estado);
    }
    if (fecha_cita) {
      updates.push(`fecha_cita = ?`);
      params.push(fecha_cita);
    }
    if (notas_monitor !== undefined) {
      updates.push(`notas_monitor = ?`);
      params.push(notas_monitor);
    }

    updateSql += updates.join(', ') + ` WHERE id = ?`;
    params.push(id);

    await query(updateSql, params);

    return NextResponse.json({ ok: true, msg: "Cita actualizada correctamente" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const citaId = parseInt(id);

  if (isNaN(citaId)) {
    return NextResponse.json({ ok: false, msg: "ID de cita inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { fecha_cita, disponibilidad_id } = body;

    // Validate required fields
    if (!fecha_cita) {
      return NextResponse.json({ ok: false, msg: "Fecha de cita requerida" }, { status: 400 });
    }

    // Load current appointment
    const citaResult = await query(`
      SELECT
        c.id,
        c.estudiante_id,
        c.monitor_id,
        c.materia_id,
        c.disponibilidad_id,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        c.ubicacion,
        c.estado,
        c.created_at,
        u.nombre_completo AS estudiante_nombre,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        mon.nombre_completo AS monitor_nombre,
        mon.correo AS monitor_correo,
        d.dia AS disponibilidad_dia,
        d.hora_inicio AS disp_hora_inicio,
        d.hora_fin AS disp_hora_fin,
        d.ubicacion AS disp_ubicacion
      FROM citas c
      JOIN usuarios u ON u.id = c.estudiante_id
      JOIN usuarios mon ON mon.id = c.monitor_id
      JOIN materias m ON m.id = c.materia_id
      LEFT JOIN disponibilidades d ON d.id = c.disponibilidad_id
      WHERE c.id = ?
    `, [citaId]);

    if (citaResult.length === 0) {
      return NextResponse.json({ ok: false, msg: "Cita no encontrada" }, { status: 404 });
    }

    const cita = citaResult[0];

    // Validate date format and future date
    const newDate = new Date(fecha_cita + 'T00:00:00');
    if (isNaN(newDate.getTime())) {
      return NextResponse.json({ ok: false, msg: "Formato de fecha inválido" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      return NextResponse.json({ ok: false, msg: "No se puede seleccionar una fecha anterior a hoy" }, { status: 400 });
    }

    // Check if the new date is different from the current one
    if (cita.fecha_cita === fecha_cita) {
      return NextResponse.json({ ok: false, msg: "La nueva fecha debe ser diferente a la fecha actual" }, { status: 400 });
    }

    // Check if appointment can be modified
    if (cita.estado === 'cancelada' || cita.estado === 'completada') {
      return NextResponse.json({ ok: false, msg: "No se puede modificar esta cita." }, { status: 409 });
    }

    // Check for conflicts (same student, same date, same time)
    const conflictResult = await query(`
      SELECT id FROM citas
      WHERE estudiante_id = ? AND fecha_cita = ? AND hora_inicio = ? AND id != ?
      AND estado IN ('pendiente', 'confirmada')
    `, [cita.estudiante_id, fecha_cita, cita.hora_inicio, citaId]);

    if (conflictResult.length > 0) {
      return NextResponse.json({ ok: false, msg: "Conflicto de horario." }, { status: 409 });
    }

    let newDisponibilidadId = cita.disponibilidad_id;

    // If there's a fixed day requirement, validate and find new availability
    if (cita.disponibilidad_dia) {
      const weekdayMap: { [key: string]: number } = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6
      };
      const requiredDay = weekdayMap[cita.disponibilidad_dia.toLowerCase()];
      const selectedDay = newDate.getDay();

      if (selectedDay !== requiredDay) {
        return NextResponse.json({ ok: false, msg: "La nueva fecha no corresponde al día de disponibilidad del monitor." }, { status: 409 });
      }

      // Find available slot for the new date
      const dispResult = await query(`
        SELECT id FROM disponibilidades
        WHERE monitor_id = ? AND materia_id = ? AND dia = ? AND hora_inicio = ? AND hora_fin = ? AND estado = 'Activa'
      `, [cita.monitor_id, cita.materia_id, cita.disponibilidad_dia, cita.hora_inicio, cita.hora_fin]);

      if (dispResult.length === 0) {
        return NextResponse.json({ ok: false, msg: "No hay disponibilidad para esa fecha" }, { status: 409 });
      }

      newDisponibilidadId = dispResult[0].id;
    }

    // Update the appointment
    const updateFields = ['fecha_cita = ?'];
    const updateParams = [fecha_cita];

    if (newDisponibilidadId !== cita.disponibilidad_id) {
      updateFields.push('disponibilidad_id = ?');
      updateParams.push(newDisponibilidadId);
    }

    updateParams.push(citaId);

    await query(`
      UPDATE citas SET ${updateFields.join(', ')} WHERE id = ?
    `, updateParams);

    // Return updated appointment
    const updatedResult = await query(`
      SELECT
        c.id,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        c.ubicacion,
        u.nombre_completo AS estudiante_nombre,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        mon.nombre_completo AS monitor_nombre,
        mon.correo AS monitor_correo
      FROM citas c
      JOIN usuarios u ON u.id = c.estudiante_id
      JOIN usuarios mon ON mon.id = c.monitor_id
      JOIN materias m ON m.id = c.materia_id
      WHERE c.id = ?
    `, [citaId]);

    return NextResponse.json({
      ok: true,
      msg: "Fecha de cita modificada exitosamente",
      data: updatedResult[0]
    });

  } catch (error) {
    console.error("Error updating appointment date:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
