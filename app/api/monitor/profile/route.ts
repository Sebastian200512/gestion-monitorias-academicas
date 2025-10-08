import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get monitor profile data
    const userQuery = `
      SELECT
        u.id,
        u.nombre_completo,
        u.correo,
        u.telefono,
        u.programa,
        u.semestre
      FROM usuarios u
      WHERE u.id = ?
    `;

    const users = await query(userQuery, [userId]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const [firstName, ...lastNameParts] = user.nombre_completo.split(' ');

    // Get subjects taught by this monitor
    const subjectsQuery = `
      SELECT DISTINCT m.nombre as name
      FROM materias m
      JOIN disponibilidades d ON m.id = d.materia_id
      WHERE d.monitor_id = ?
    `;
    const subjects = await query(subjectsQuery, [userId]);

    // Get total sessions (completed appointments)
    const sessionsQuery = `
      SELECT COUNT(*) as totalSessions
      FROM citas
      WHERE monitor_id = ? AND estado = 'completada'
    `;
    const sessionsResult = await query(sessionsQuery, [userId]);
    const totalSessions = sessionsResult[0]?.totalSessions || 0;

    // Mock rating for now (could be from a ratings table)
    const rating = 4.5;

    const profileData = {
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: user.correo,
      phone: user.telefono || '',
      employeeId: userId.toString(),
      subjects: subjects.map((s: any) => s.name),
      experience: 'Experiencia intermedia', // Could be from a field
      rating: rating,
      totalSessions: totalSessions,
      bio: '', // Could be from a field
      avatar: '/placeholder.svg?height=100&width=100',
      specialties: subjects.map((s: any) => s.name), // Same as subjects for now
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching monitor profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
