import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { estudiante_id, disponibilidad_id, fecha_cita } = await req.json();

  if (!estudiante_id || !disponibilidad_id || !fecha_cita) {
    return NextResponse.json({ ok: false, msg: "Faltan parámetros: estudiante_id, disponibilidad_id, fecha_cita" }, { status: 400 });
  }

  const lockKey = `slot_${disponibilidad_id}_${fecha_cita}`;

  try {
    // Iniciar transacción
    await query("START TRANSACTION");

    // Cargar disponibilidad activa FOR UPDATE
    const dispQuery = `SELECT * FROM disponibilidades WHERE id = ? AND estado = 'Activa' FOR UPDATE`;
    const dispResult = await query(dispQuery, [disponibilidad_id]);
    if (dispResult.length === 0) {
      await query("ROLLBACK");
      return NextResponse.json({ ok: false, msg: "Slot no disponible" }, { status: 400 });
    }

    const disp = dispResult[0];

    // Aplicar lock
    const lockResult = await query("SELECT GET_LOCK(?, 5) AS locked", [lockKey]);
    if (!lockResult[0].locked) {
      await query("ROLLBACK");
      return NextResponse.json({ ok: false, msg: "No se pudo obtener el lock" }, { status: 409 });
    }

    // Insertar cita con estado='confirmada'
    const insertSql = `
      INSERT INTO citas (estudiante_id, monitor_id, disponibilidad_id, materia_id, fecha_cita, hora_inicio, hora_fin, ubicacion, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmada')
    `;
    const result = await query(insertSql, [estudiante_id, disp.monitor_id, disp.id, disp.materia_id, fecha_cita, disp.hora_inicio, disp.hora_fin, disp.ubicacion]);

    // Liberar lock
    await query("SELECT RELEASE_LOCK(?)", [lockKey]);

    // Commit
    await query("COMMIT");

    return NextResponse.json({ ok: true, data: { id: result.insertId, ...req.body } });
  } catch (error: any) {
    await query("ROLLBACK");
    console.error("Error creando cita:", error);

    // Manejo de errores del trigger (cupo)
    if (error.code === 'ER_SIGNAL_EXCEPTION' || error.message?.includes('cupo')) {
      return NextResponse.json({ ok: false, msg: "No hay cupos disponibles para este horario (máximo 10)." }, { status: 409 });
    }

    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const monitorId = searchParams.get("monitor_id");
  const estudianteId = searchParams.get("estudiante_id");

  let sql = `
    SELECT
      c.*,
      m.nombre as materia_nombre,
      m.codigo as materia_codigo,
      e.nombre_completo as estudiante_nombre,
      e.correo as estudiante_correo,
      mon.nombre_completo as monitor_nombre,
      mon.correo as monitor_correo,
      d.ubicacion as ubicacion
    FROM citas c
    JOIN materias m ON c.materia_id = m.id
    JOIN usuarios e ON c.estudiante_id = e.id
    JOIN usuarios mon ON c.monitor_id = mon.id
    JOIN disponibilidades d ON c.disponibilidad_id = d.id
  `;
  const params: any[] = [];
  if (monitorId) {
    sql += ` WHERE c.monitor_id = ?`;
    params.push(monitorId);
  }
  if (estudianteId) {
    sql += monitorId ? ` AND c.estudiante_id = ?` : ` WHERE c.estudiante_id = ?`;
    params.push(estudianteId);
  }
  sql += ` ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`;

  const data = await query(sql, params);
  const formattedData = data.map((row: any) => ({
    id: row.id,
    estudiante_id: row.estudiante_id,
    monitor_id: row.monitor_id,
    disponibilidad_id: row.disponibilidad_id,
    materia_id: row.materia_id,
    fecha_cita: row.fecha_cita,
    hora_inicio: row.hora_inicio,
    hora_fin: row.hora_fin,
    ubicacion: row.ubicacion,
    estado: row.estado,
    materia: {
      id: row.materia_id,
      nombre: row.materia_nombre,
      codigo: row.materia_codigo
    },
    estudiante: {
      id: row.estudiante_id,
      nombre_completo: row.estudiante_nombre,
      correo: row.estudiante_correo
    },
    monitor: {
      id: row.monitor_id,
      nombre_completo: row.monitor_nombre,
      correo: row.monitor_correo
    }
  }));
  return NextResponse.json({ ok: true, data: formattedData });
}
