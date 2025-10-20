import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Consulta: Estudiantes que más cancelan citas
    // Campos: nombre_completo, cantidad_canceladas
    // Basado en las citas con estado = 'cancelada'
    const sql = `
      SELECT
        u.nombre_completo,
        COUNT(c.id) AS cantidad_canceladas
      FROM usuarios u
      JOIN usuario_rol ur ON ur.usuario_id = u.id
      JOIN roles r ON r.id = ur.rol_id
      LEFT JOIN citas c ON c.estudiante_id = u.id AND c.estado = 'cancelada'
      WHERE r.nombre = 'ESTUDIANTE'
      GROUP BY u.id, u.nombre_completo
      HAVING cantidad_canceladas > 0
      ORDER BY cantidad_canceladas DESC, u.nombre_completo ASC
    `;

    const rows = await query(sql);

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estudiantes Cancelaciones");

    // Encabezados
    worksheet.columns = [
      { header: "Nombre Completo", key: "nombre_completo", width: 30 },
      { header: "Cantidad Canceladas", key: "cantidad_canceladas", width: 20 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };

    // Agregar datos
    rows.forEach((row: any) => {
      worksheet.addRow({
        nombre_completo: row.nombre_completo,
        cantidad_canceladas: row.cantidad_canceladas,
      });
    });

    // Configurar respuesta
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = "reporte_estudiantes_cancelaciones.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Error generando reporte estudiantes cancelaciones:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
