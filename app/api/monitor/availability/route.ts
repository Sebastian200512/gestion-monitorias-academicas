import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get availability slots for this monitor
    const availabilityQuery = `
      SELECT
        d.id,
        d.dia as day,
        TIME_FORMAT(d.hora_inicio, '%H:%i') as startTime,
        TIME_FORMAT(d.hora_fin, '%H:%i') as endTime,
        d.ubicacion as location,
        d.estado = 'Activa' as isActive,
        m.nombre as subject
      FROM disponibilidades d
      LEFT JOIN materias m ON d.materia_id = m.id
      WHERE d.monitor_id = ?
      ORDER BY FIELD(d.dia, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'), d.hora_inicio
    `;

    const availabilitySlots = await query(availabilityQuery, [userId]);

    // Group by slot (day, startTime, endTime, location) and collect subjects and ids
    const slotMap = new Map();

    availabilitySlots.forEach((slot: any) => {
      const key = `${slot.day}-${slot.startTime}-${slot.endTime}-${slot.location}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          ids: [slot.id.toString()],
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location,
          subjects: [],
          isActive: Boolean(slot.isActive === 1),
        });
      } else {
        const existingSlot = slotMap.get(key);
        existingSlot.ids.push(slot.id.toString());
        // Update isActive to true if any slot in the group is active
        if (slot.isActive === 1) {
          existingSlot.isActive = true;
        }
      }
      if (slot.subject) {
        slotMap.get(key).subjects.push(slot.subject);
      }
    });

    const formattedSlots = Array.from(slotMap.values());

    return NextResponse.json(formattedSlots);
  } catch (error) {
    console.error('Error fetching monitor availability:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
