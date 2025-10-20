import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Estudiantes con más citas agendadas
    // Campos: nombre_completo, programa, total_citas
    // Ordenado de mayor a menor
    const sql = `
      SELECT
        u.nombre_completo,
        u.programa,
        COUNT(c.id) AS total_citas
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      LEFT JOIN citas c ON c.estudiante_id = u.id
      WHERE r.nombre = 'ESTUDIANTE'
      GROUP BY u.id, u.nombre_completo, u.programa
      ORDER BY total_citas DESC, u.nombre_completo ASC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estudiantes Más Citas");

    // Encabezados
    worksheet.columns = [
      { header: "Nombre Completo", key: "nombre_completo", width: 30 },
      { header: "Programa", key: "programa", width: 20 },
      { header: "Total Citas", key: "total_citas", width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        nombre_completo: row.nombre_completo,
        programa: row.programa || "",
        total_citas: row.total_citas,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_estudiantes_mas_citas.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte estudiantes más citas:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
