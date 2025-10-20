import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Citas por estado
    // Campos: estado, total
    // Agrupadas en: pendiente, confirmada, completada, cancelada
    const sql = `
      SELECT
        estado,
        COUNT(*) AS total
      FROM citas
      GROUP BY estado
      ORDER BY total DESC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Citas por Estado");

    // Encabezados
    worksheet.columns = [
      { header: "Estado", key: "estado", width: 20 },
      { header: "Total", key: "total", width: 10 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        estado: row.estado,
        total: row.total,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_citas_por_estado.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte citas por estado:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
