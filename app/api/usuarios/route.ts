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
        GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r        ON r.id = ur.rol_id
      WHERE r.nombre IN ('ESTUDIANTE','MONITOR')
      GROUP BY u.id, u.nombre_completo, u.correo, u.programa, u.semestre
    `;

    const sql = rol === "ESTUDIANTE" || rol === "MONITOR"
      ? sqlBase + ` HAVING FIND_IN_SET(?, roles) ORDER BY u.nombre_completo ASC`
      : sqlBase + ` ORDER BY u.nombre_completo ASC`;

    const rows = await query(sql, rol ? [rol] : []);

    // Process rows to split roles into array
    const processedRows = rows.map((row: any) => ({
      ...row,
      roles: row.roles ? row.roles.split(',') : []
    }));

    return NextResponse.json(processedRows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

