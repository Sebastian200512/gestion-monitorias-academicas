import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    // Get all monitors (users with role 'Monitor')
    const monitorsQuery = `
      SELECT
        u.id,
        u.nombre_completo as name,
        u.correo as email,
        '' as phone, -- No phone in schema, using empty string
        4.5 as rating, -- Default rating since no rating table
        'Experiencia intermedia' as experience, -- Default experience
        10 as totalSessions, -- Default sessions
        true as available, -- Assume available
        '/placeholder.svg' as photo -- Default photo
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'Monitor'
    `;

    const monitors = await query(monitorsQuery);

    // For each monitor, get their subjects and schedule
    for (const monitor of monitors) {
      // Get subjects taught by this monitor
      const subjectsQuery = `
        SELECT DISTINCT m.nombre as name, m.id
        FROM materias m
        JOIN disponibilidades d ON m.id = d.materia_id
        WHERE d.monitor_id = ?
      `;
      const subjects = await query(subjectsQuery, [monitor.id]);
      monitor.subjects = subjects.map((s: any) => s.name);

      // Get specialties (same as subjects for now)
      monitor.specialties = monitor.subjects;

      // Get schedule from disponibilidades
      const scheduleQuery = `
        SELECT
          DATE_FORMAT(fecha, '%W') as day_name,
          TIME_FORMAT(hora_inicio, '%H:%i') as time
        FROM disponibilidades
        WHERE monitor_id = ? AND estado = 'disponible'
        ORDER BY fecha, hora_inicio
      `;
      const scheduleSlots = await query(scheduleQuery, [monitor.id]);

      // Group by day
      const schedule: { [key: string]: string[] } = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };

      // Map Spanish day names to English
      const dayMap: { [key: string]: string } = {
        'lunes': 'monday',
        'martes': 'tuesday',
        'miércoles': 'wednesday',
        'jueves': 'thursday',
        'viernes': 'friday',
        'sábado': 'saturday',
        'domingo': 'sunday'
      };

      scheduleSlots.forEach((slot: any) => {
        const dayKey = dayMap[slot.day_name.toLowerCase()] || 'monday';
        if (!schedule[dayKey].includes(slot.time)) {
          schedule[dayKey].push(slot.time);
        }
      });

      monitor.schedule = schedule;
    }

    return NextResponse.json(monitors);
  } catch (error) {
    console.error('Error al obtener monitores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
