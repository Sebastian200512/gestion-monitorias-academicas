import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const materia = searchParams.get("materia_id");

  const sql = materia
    ? `
      SELECT
        d.*,
        m.nombre as materia_nombre,
        m.codigo as materia_codigo,
        u.nombre_completo as monitor_nombre_completo,
        u.id as monitor_id
      FROM disponibilidades d
      JOIN materias m ON d.materia_id = m.id
      JOIN usuarios u ON d.monitor_id = u.id
      WHERE d.estado = 'Activa' AND d.materia_id = ?
      ORDER BY FIELD(d.dia, 'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'), d.hora_inicio ASC
    `
    : `
      SELECT
        d.*,
        m.nombre as materia_nombre,
        m.codigo as materia_codigo,
        u.nombre_completo as monitor_nombre_completo,
        u.id as monitor_id
      FROM disponibilidades d
      JOIN materias m ON d.materia_id = m.id
      JOIN usuarios u ON d.monitor_id = u.id
      WHERE d.estado = 'Activa'
      ORDER BY FIELD(d.dia, 'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'), d.hora_inicio ASC
    `;

  const data = await query(sql, materia ? [Number(materia)] : []);
  const formattedData = data.map((row: any) => ({
    id: row.id,
    monitor_id: row.monitor_id,
    materia_id: row.materia_id,
    dia: row.dia,
    hora_inicio: row.hora_inicio,
    hora_fin: row.hora_fin,
    ubicacion: row.ubicacion,
    estado: row.estado,
    materia: {
      id: row.materia_id,
      nombre: row.materia_nombre,
      codigo: row.materia_codigo
    },
    monitor: {
      id: row.monitor_id,
      nombre_completo: row.monitor_nombre_completo
    }
  }));
  return NextResponse.json({ ok: true, data: formattedData });
}

export async function POST(req: NextRequest) {
  const { monitor_id, materia_id, dia, hora_inicio, hora_fin, ubicacion } = await req.json();

  // Check if user is monitor
  const isMonitorQuery = `
    SELECT ur.* FROM usuario_rol ur
    JOIN roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = ? AND r.nombre = 'MONITOR'
  `;
  const isMonitor = await query(isMonitorQuery, [monitor_id]);
  if (isMonitor.length === 0) return NextResponse.json({ ok: false, msg: "No autorizado" }, { status: 403 });

  // Check if monitor has assigned subject
  const assignedSubjectQuery = `
    SELECT materia_asignada_id FROM usuarios WHERE id = ?
  `;
  const assignedSubject = await query(assignedSubjectQuery, [monitor_id]);
  if (assignedSubject.length === 0 || !assignedSubject[0].materia_asignada_id) {
    return NextResponse.json({
      ok: false,
      msg: "El monitor no tiene una materia asignada. Solicita al administrador que te asigne una materia para poder crear horarios."
    }, { status: 409 });
  }

  // Force materia_id to be the assigned subject
  const forcedMateriaId = assignedSubject[0].materia_asignada_id;

  const insertSql = `
    INSERT INTO disponibilidades (monitor_id, materia_id, dia, hora_inicio, hora_fin, ubicacion, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'Activa')
  `;
  const result = await query(insertSql, [monitor_id, forcedMateriaId, dia, hora_inicio, hora_fin, ubicacion]);
  return NextResponse.json({ ok: true, data: { id: result.insertId, monitor_id, materia_id: forcedMateriaId, dia, hora_inicio, hora_fin, ubicacion } });
}
