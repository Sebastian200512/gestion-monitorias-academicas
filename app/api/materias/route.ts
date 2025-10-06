import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const subjects = await query(`
      SELECT
        id,
        nombre,
        codigo,
        creditos,
        estado
      FROM materias
    `);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
