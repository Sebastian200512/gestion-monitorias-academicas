import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    console.log('Monitor appointments API called with userId:', userId);

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get appointments for this monitor
    const appointmentsQuery = `
      SELECT
        c.id,
        c.fecha_cita as fecha,
        c.hora_inicio,
        c.hora_fin,
        c.ubicacion,
        c.estado,
        c.detalles,
        c.notas_estudiante,
        c.notas_monitor,
        c.created_at,
        u.nombre_completo as student_name,
        u.correo as student_email,
        u.telefono as student_phone,
        u.programa as student_program,
        u.semestre as student_semester,
        m.nombre as subject_name,
        m.codigo as subject_code
      FROM citas c
      JOIN usuarios u ON c.estudiante_id = u.id
      JOIN materias m ON c.materia_id = m.id
      WHERE c.monitor_id = ?
      ORDER BY c.fecha_cita DESC, c.hora_inicio DESC
    `;

    const appointments = await query(appointmentsQuery, [userId]);

    console.log('Raw appointments from database:', appointments);

    // Format the data to match the expected interface
    const formattedAppointments = appointments.map((apt: any) => ({
      id: apt.id.toString(),
      student: {
        name: apt.student_name,
        email: apt.student_email,
        phone: apt.student_phone || '',
        program: apt.student_program || '',
        semester: apt.student_semester || '',
        photo: '/placeholder.svg?height=100&width=100', // Default photo
      },
      subject: apt.subject_name,
      subjectCode: apt.subject_code,
      date: apt.fecha,
      time: apt.hora_inicio,
      endTime: apt.hora_fin,
      location: apt.ubicacion,
      status: apt.estado, // Assuming status is already in Spanish
      details: apt.detalles || '',
      studentNotes: apt.notas_estudiante,
      monitorNotes: apt.notas_monitor,
      createdAt: apt.created_at,
    }));

    console.log('Formatted appointments being returned:', formattedAppointments);

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching monitor appointments:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
