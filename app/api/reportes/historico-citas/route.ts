import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Consulta: Histórico de citas (detallado)
    // Campos: fecha_cita, hora_inicio, hora_fin, estudiante, monitor, materia, estado, ubicacion
    // Ordenadas por fecha descendente
    let sql = `
      SELECT
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        e.nombre_completo AS estudiante,
        mon.nombre_completo AS monitor,
        m.nombre AS materia,
        c.estado,
        d.ubicacion
      FROM citas c
      JOIN usuarios e ON c.estudiante_id = e.id
      JOIN usuarios mon ON c.monitor_id = mon.id
      JOIN materias m ON c.materia_id = m.id
      JOIN disponibilidades d ON c.disponibilidad_id = d.id
    `;

    const params: any[] = [];
    if (startDate && endDate) {
      sql += ` WHERE DATE(c.fecha_cita) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    sql += ` ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`;

    const rows = await query(sql, params);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Histórico Citas");

    // Encabezados
    worksheet.columns = [
      { header: "Fecha Cita", key: "fecha_cita", width: 15 },
      { header: "Hora Inicio", key: "hora_inicio", width: 15 },
      { header: "Hora Fin", key: "hora_fin", width: 15 },
      { header: "Estudiante", key: "estudiante", width: 30 },
      { header: "Monitor", key: "monitor", width: 30 },
      { header: "Materia", key: "materia", width: 30 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Ubicación", key: "ubicacion", width: 20 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        fecha_cita: row.fecha_cita,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        estudiante: row.estudiante,
        monitor: row.monitor,
        materia: row.materia,
        estado: row.estado,
        ubicacion: row.ubicacion,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_historico_citas.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte histórico citas:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
