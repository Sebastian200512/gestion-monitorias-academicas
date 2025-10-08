import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'upcoming' or 'history'
  const userId = searchParams.get('userId'); // student id

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    let queryStr = '';
    let params: any[] = [userId];

    if (type === 'upcoming') {
      queryStr = `
        SELECT
          c.id,
          m.nombre as subject,
          m.codigo as subjectCode,
          JSON_OBJECT(
            'name', mon.nombre_completo,
            'email', mon.correo,
            'phone', '',
            'rating', 4.5,
            'photo', '/placeholder.svg'
          ) as monitor,
          c.fecha_cita as date,
          TIME_FORMAT(c.hora_cita, '%H:%i') as time,
          TIME_FORMAT(ADDTIME(c.hora_cita, '01:00:00'), '%H:%i') as endTime,
          'Aula por asignar' as location,
          CASE
            WHEN c.estado = 'pendiente' THEN 'pendiente'
            WHEN c.estado = 'realizada' THEN 'confirmada'
            ELSE 'cancelada'
          END as status,
          '' as details,
          '' as studentNotes,
          '' as monitorNotes,
          NOW() as createdAt,
          NULL as rating,
          NULL as feedback,
          NULL as topics,
          60 as duration
        FROM citas c
        JOIN materias m ON c.materia_id = m.id
        JOIN usuarios mon ON c.monitor_id = mon.id
        WHERE c.estudiante_id = ? AND c.fecha_cita >= CURDATE()
        ORDER BY c.fecha_cita ASC, c.hora_cita ASC
      `;
    } else if (type === 'history') {
      queryStr = `
        SELECT
          c.id,
          m.nombre as subject,
          m.codigo as subjectCode,
          JSON_OBJECT(
            'name', mon.nombre_completo,
            'email', mon.correo,
            'phone', '',
            'rating', 4.5,
            'photo', '/placeholder.svg'
          ) as monitor,
          c.fecha_cita as date,
          TIME_FORMAT(c.hora_cita, '%H:%i') as time,
          TIME_FORMAT(ADDTIME(c.hora_cita, '01:00:00'), '%H:%i') as endTime,
          'Aula por asignar' as location,
          CASE
            WHEN c.estado = 'realizada' THEN 'completada'
            ELSE 'cancelada'
          END as status,
          '' as details,
          '' as studentNotes,
          '' as monitorNotes,
          NOW() as createdAt,
          NULL as rating,
          NULL as feedback,
          NULL as topics,
          60 as duration
        FROM citas c
        JOIN materias m ON c.materia_id = m.id
        JOIN usuarios mon ON c.monitor_id = mon.id
        WHERE c.estudiante_id = ? AND c.fecha_cita < CURDATE()
        ORDER BY c.fecha_cita DESC, c.hora_cita DESC
      `;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const appointments = await query(queryStr, params);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
