// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // tu helper mysql2

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rol = (searchParams.get("rol") ?? "").toUpperCase(); // 'ESTUDIANTE' | 'MONITOR' | ''

    // base: solo roles del catálogo que nos interesan
    const sqlBase = `
      SELECT DISTINCT
        u.id,
        u.nombre_completo    AS nombre,
        u.correo             AS email,
        u.programa,
        u.semestre,
        CASE r.nombre
          WHEN 'MONITOR' THEN 'Monitor'
          WHEN 'ESTUDIANTE' THEN 'Estudiante'
        END AS rol
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r        ON r.id = ur.rol_id
      WHERE r.nombre IN ('ESTUDIANTE','MONITOR')
    `;

    const sql = rol === "ESTUDIANTE" || rol === "MONITOR"
      ? sqlBase + ` AND r.nombre = ? ORDER BY u.nombre_completo ASC`
      : sqlBase + ` ORDER BY u.nombre_completo ASC`;

    const rows = await query(sql, rol ? [rol] : []);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

