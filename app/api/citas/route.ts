import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { estudiante_id, disponibilidad_id, fecha_cita } = await req.json();

  // FIX: Validar cupo antes de crear cita
  const [cap]: any[] = await query(
    `SELECT COUNT(*) AS usados
       FROM citas
      WHERE disponibilidad_id = ?
        AND fecha_cita       = ?
        AND estado IN ('pendiente','confirmada')`,
    [disponibilidad_id, fecha_cita]
  );
  if (Number(cap?.usados ?? 0) >= 10) {
    return NextResponse.json(
      { ok: false, msg: "No hay cupos disponibles para este horario (máximo 10)." },
      { status: 409 }
    );
  }

  // Get disponibilidad
  const dispQuery = `SELECT * FROM disponibilidades WHERE id = ? AND estado = 'Activa'`;
  const dispResult = await query(dispQuery, [disponibilidad_id]);
  if (dispResult.length === 0) return NextResponse.json({ ok: false, msg: "Slot no disponible" }, { status: 400 });

  const disp = dispResult[0];

  // Count used slots
  const usadosQuery = `SELECT COUNT(*) as count FROM citas WHERE disponibilidad_id = ? AND estado IN ('pendiente', 'confirmada')`;
  const usadosResult = await query(usadosQuery, [disp.id]);
  const usados = usadosResult[0].count;
  if (usados >= disp.max_estudiantes) return NextResponse.json({ ok: false, msg: "Cupo lleno" }, { status: 400 });

  // Create cita
  const insertSql = `
    INSERT INTO citas (estudiante_id, monitor_id, disponibilidad_id, materia_id, fecha_cita, hora_inicio, hora_fin, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
  `;
  const result = await query(insertSql, [estudiante_id, disp.monitor_id, disp.id, disp.materia_id, fecha_cita, disp.hora_inicio, disp.hora_fin]);
  return NextResponse.json({ ok: true, data: { id: result.insertId, ...req.body } });
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
