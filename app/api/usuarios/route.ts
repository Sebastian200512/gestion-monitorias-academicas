// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // tu helper mysql2

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rol = (searchParams.get("rol") ?? "").toUpperCase(); // 'ESTUDIANTE' | 'MONITOR' | ''

    // base: solo roles del catálogo que nos interesan
    const sqlBase = `
      SELECT
        u.id,
        u.nombre_completo    AS nombre,
        u.correo             AS email,
        u.programa,
        u.semestre,
        u.codigo,
        u.created_at,
        u.materia_asignada_id,
        GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r        ON r.id = ur.rol_id
      WHERE r.nombre IN ('ESTUDIANTE','MONITOR')
      GROUP BY u.id, u.nombre_completo, u.correo, u.programa, u.semestre, u.codigo, u.created_at, u.materia_asignada_id
    `;

    const sql = rol === "ESTUDIANTE" || rol === "MONITOR"
      ? sqlBase + ` HAVING FIND_IN_SET(?, roles) ORDER BY u.nombre_completo ASC`
      : sqlBase + ` ORDER BY u.nombre_completo ASC`;

    const rows = await query(sql, rol ? [rol] : []);

    // Process rows to split roles into array and add materia_asignada for MONITOR
    const processedRows = await Promise.all(rows.map(async (row: any) => {
      const processed = {
        ...row,
        roles: row.roles ? row.roles.split(',') : []
      };

      // Add materia_asignada for MONITOR role
      if (rol === "MONITOR" && row.materia_asignada_id) {
        const materiaQuery = `
          SELECT id, codigo, nombre
          FROM materias
          WHERE id = ? AND estado = 'Activo'
        `;
        const materiaRows = await query(materiaQuery, [row.materia_asignada_id]);
        processed.materia_asignada = materiaRows.length > 0 ? {
          id: materiaRows[0].id,
          codigo: materiaRows[0].codigo,
          nombre: materiaRows[0].nombre
        } : null;
      } else if (rol === "MONITOR") {
        processed.materia_asignada = null;
      }

      return processed;
    }));

    return NextResponse.json(processedRows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

