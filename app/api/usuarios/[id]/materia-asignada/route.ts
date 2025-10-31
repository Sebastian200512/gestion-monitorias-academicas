import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user exists and is MONITOR
    const userQuery = `
      SELECT u.id, u.materia_asignada_id, GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      WHERE u.id = ? AND r.nombre = 'MONITOR'
      GROUP BY u.id, u.materia_asignada_id
    `;
    const userRows = await query(userQuery, [id]);

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no es monitor" }, { status: 404 });
    }

    const user = userRows[0];
    let materia_asignada = null;

    if (user.materia_asignada_id) {
      const materiaQuery = `
        SELECT id, codigo, nombre
        FROM materias
        WHERE id = ? AND estado = 'Activo'
      `;
      const materiaRows = await query(materiaQuery, [user.materia_asignada_id]);
      if (materiaRows.length > 0) {
        materia_asignada = {
          id: materiaRows[0].id,
          codigo: materiaRows[0].codigo,
          nombre: materiaRows[0].nombre
        };
      }
    }

    return NextResponse.json(materia_asignada);

  } catch (err) {
    console.error("Error al obtener materia asignada:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { materia_id } = body;

    // Parse and validate materia_id
    let parsedMateriaId = null;
    if (materia_id !== null) {
      parsedMateriaId = parseInt(materia_id, 10);
      if (isNaN(parsedMateriaId) || parsedMateriaId <= 0) {
        return NextResponse.json({ error: "materia_id debe ser un número positivo o null" }, { status: 400 });
      }
    }

    // Check if user exists and is MONITOR
    const userQuery = `
      SELECT u.id, GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      WHERE u.id = ? AND r.nombre = 'MONITOR'
      GROUP BY u.id
    `;
    const userRows = await query(userQuery, [id]);

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado o no es monitor" }, { status: 404 });
    }

    // If materia_id is provided, validate it exists and is active
    if (parsedMateriaId !== null) {
      const materiaQuery = `
        SELECT id, codigo, nombre
        FROM materias
        WHERE id = ? AND estado = 'Activo'
      `;
      const materiaRows = await query(materiaQuery, [parsedMateriaId]);

      if (materiaRows.length === 0) {
        return NextResponse.json({ error: "Materia no encontrada o inactiva" }, { status: 400 });
      }
    }

    // Update materia_asignada_id
    const updateQuery = `
      UPDATE usuarios
      SET materia_asignada_id = ?
      WHERE id = ?
    `;
    await query(updateQuery, [parsedMateriaId, id]);

    // Get updated materia_asignada for response
    let materia_asignada = null;
    if (parsedMateriaId !== null) {
      const materiaQuery = `
        SELECT id, codigo, nombre
        FROM materias
        WHERE id = ? AND estado = 'Activo'
      `;
      const materiaRows = await query(materiaQuery, [parsedMateriaId]);
      if (materiaRows.length > 0) {
        materia_asignada = {
          id: materiaRows[0].id,
          codigo: materiaRows[0].codigo,
          nombre: materiaRows[0].nombre
        };
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        usuario_id: parseInt(id),
        materia_asignada
      }
    });

  } catch (err) {
    console.error("Error al actualizar materia asignada:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
