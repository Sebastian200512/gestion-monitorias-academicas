import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Cantidad de citas atendidas por monitor
    // Campos: monitor, total_citas
    // Basado en la cantidad de citas donde el usuario tiene rol MONITOR
    const sql = `
      SELECT
        u.nombre_completo AS monitor,
        COUNT(c.id) AS total_citas
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      LEFT JOIN citas c ON c.monitor_id = u.id
      WHERE r.nombre = 'MONITOR'
      GROUP BY u.id, u.nombre_completo
      ORDER BY total_citas DESC, u.nombre_completo ASC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Citas por Monitor");

    // Encabezados
    worksheet.columns = [
      { header: "Monitor", key: "monitor", width: 30 },
      { header: "Total Citas", key: "total_citas", width: 15 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        monitor: row.monitor,
        total_citas: row.total_citas,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_citas_por_monitor.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte citas por monitor:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
