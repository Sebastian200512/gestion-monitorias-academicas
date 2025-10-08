import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const subjects = await query(`
      SELECT
        id,
        nombre as name,
        codigo as code,
        creditos as credits,
        estado
      FROM materias
    `);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
