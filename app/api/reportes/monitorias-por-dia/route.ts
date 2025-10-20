import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Total de monitorías por día de la semana
    // Campos: dia, total_citas
    // Relaciona `citas` con `disponibilidades` para saber en qué día se dictaron más monitorías
    const sql = `
      SELECT
        d.dia,
        COUNT(c.id) AS total_citas
      FROM disponibilidades d
      LEFT JOIN citas c ON c.disponibilidad_id = d.id
      GROUP BY d.dia
      ORDER BY FIELD(d.dia, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes'), total_citas DESC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monitorías por Día");

    // Encabezados
    worksheet.columns = [
      { header: "Día", key: "dia", width: 15 },
      { header: "Total Citas", key: "total_citas", width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        dia: row.dia,
        total_citas: row.total_citas,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_monitorias_por_dia.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte monitorías por día:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
