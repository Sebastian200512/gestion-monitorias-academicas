import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Listado general de estudiantes activos
    // Campos: nombre_completo, correo, programa, semestre
    // Solo usuarios con rol ESTUDIANTE
    const sql = `
      SELECT
        u.nombre_completo,
        u.correo,
        u.programa,
        u.semestre
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      WHERE r.nombre = 'ESTUDIANTE'
      ORDER BY u.nombre_completo ASC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estudiantes Activos");

    // Encabezados
    worksheet.columns = [
      { header: "Nombre Completo", key: "nombre_completo", width: 30 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Programa", key: "programa", width: 20 },
      { header: "Semestre", key: "semestre", width: 10 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        nombre_completo: row.nombre_completo,
        correo: row.correo,
        programa: row.programa || "",
        semestre: row.semestre || "",
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_estudiantes_activos.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte estudiantes activos:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
