import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Citas por materia
    // Campos: nombre_materia, total_citas
    // Agrupadas por materia y ordenadas de mayor a menor
    const sql = `
      SELECT
        m.nombre AS nombre_materia,
        COUNT(c.id) AS total_citas
      FROM materias m
      LEFT JOIN citas c ON c.materia_id = m.id
      GROUP BY m.id, m.nombre
      ORDER BY total_citas DESC, m.nombre ASC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Citas por Materia");

    // Encabezados
    worksheet.columns = [
      { header: "Nombre Materia", key: "nombre_materia", width: 30 },
      { header: "Total Citas", key: "total_citas", width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        nombre_materia: row.nombre_materia,
        total_citas: row.total_citas,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_citas_por_materia.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte citas por materia:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
