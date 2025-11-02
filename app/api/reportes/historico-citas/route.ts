import { NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const estado = searchParams.get("estado")            // pendiente|confirmada|cancelada|completada
    const materiaId = searchParams.get("materia_id")     // número
    const monitorId = searchParams.get("monitor_id")     // número
    const estudianteId = searchParams.get("estudiante_id") // número

    // Histórico de citas con detalle ampliado
    // Nota: COALESCE para ubicación (si tu citas.ubicacion existe, úsala; si no, usa d.ubicacion)
    let sql = `
      SELECT
        c.id                      AS cita_id,
        c.created_at              AS creada_en,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        -- duración en minutos usando hora_fin - hora_inicio
        TIME_TO_SEC(TIMEDIFF(c.hora_fin, c.hora_inicio)) / 60 AS duracion_minutos,
        DAYNAME(c.fecha_cita)     AS dia_semana_fecha,

        -- Estudiante
        e.id                      AS estudiante_id,
        e.codigo                  AS estudiante_codigo,
        e.nombre_completo         AS estudiante_nombre,
        e.correo                  AS estudiante_email,
        e.programa                AS estudiante_programa,
        e.semestre                AS estudiante_semestre,

        -- Monitor
        mon.id                    AS monitor_id,
        mon.codigo                AS monitor_codigo,
        mon.nombre_completo       AS monitor_nombre,
        mon.correo                AS monitor_email,

        -- Materia
        m.id                      AS materia_id,
        m.codigo                  AS materia_codigo,
        m.nombre                  AS materia_nombre,

        -- Disponibilidad
        d.id                      AS disponibilidad_id,
        d.dia                     AS dia_disponibilidad,
        COALESCE(c.ubicacion, d.ubicacion) AS ubicacion,

        -- Estado
        c.estado
      FROM citas c
      JOIN usuarios e    ON e.id   = c.estudiante_id
      JOIN usuarios mon  ON mon.id = c.monitor_id
      JOIN materias m    ON m.id   = c.materia_id
      JOIN disponibilidades d ON d.id = c.disponibilidad_id
      WHERE 1=1
    `

    const params: any[] = []

    if (startDate && endDate) {
      sql += ` AND DATE(c.fecha_cita) BETWEEN ? AND ?`
      params.push(startDate, endDate)
    } else if (startDate) {
      sql += ` AND DATE(c.fecha_cita) >= ?`
      params.push(startDate)
    } else if (endDate) {
      sql += ` AND DATE(c.fecha_cita) <= ?`
      params.push(endDate)
    }

    if (estado) {
      sql += ` AND c.estado = ?`
      params.push(estado)
    }

    if (materiaId) {
      sql += ` AND c.materia_id = ?`
      params.push(Number(materiaId))
    }

    if (monitorId) {
      sql += ` AND c.monitor_id = ?`
      params.push(Number(monitorId))
    }

    if (estudianteId) {
      sql += ` AND c.estudiante_id = ?`
      params.push(Number(estudianteId))
    }

    sql += ` ORDER BY c.fecha_cita DESC, c.hora_inicio DESC`

    const rows = await query(sql, params)

    // Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Histórico Citas")

    worksheet.columns = [
      { header: "ID Cita", key: "cita_id", width: 10 },
      { header: "Creada en", key: "creada_en", width: 20 },
      { header: "Fecha", key: "fecha_cita", width: 12 },
      { header: "Día (fecha)", key: "dia_semana_fecha", width: 14 },
      { header: "Hora Inicio", key: "hora_inicio", width: 12 },
      { header: "Hora Fin", key: "hora_fin", width: 12 },
      { header: "Duración (min)", key: "duracion_minutos", width: 14 },

      { header: "Estudiante ID", key: "estudiante_id", width: 12 },
      { header: "Estud. Código", key: "estudiante_codigo", width: 14 },
      { header: "Estudiante", key: "estudiante_nombre", width: 28 },
      { header: "Estud. Email", key: "estudiante_email", width: 26 },
      { header: "Programa", key: "estudiante_programa", width: 32 },

      { header: "Monitor ID", key: "monitor_id", width: 12 },
      { header: "Monitor Código", key: "monitor_codigo", width: 14 },
      { header: "Monitor", key: "monitor_nombre", width: 28 },
      { header: "Monitor Email", key: "monitor_email", width: 26 },

      { header: "Materia Código", key: "materia_codigo", width: 16 },
      { header: "Materia", key: "materia_nombre", width: 28 },

      { header: "Disponibilidad ID", key: "disponibilidad_id", width: 16 },
      { header: "Día (slot)", key: "dia_disponibilidad", width: 12 },
      { header: "Ubicación", key: "ubicacion", width: 22 },

      { header: "Estado", key: "estado", width: 14 },
    ]

    worksheet.getRow(1).font = { bold: true }

    rows.forEach((row: any) => {
      worksheet.addRow({
        cita_id: row.cita_id,
        creada_en: row.creada_en,
        fecha_cita: row.fecha_cita,
        dia_semana_fecha: row.dia_semana_fecha,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        duracion_minutos: row.duracion_minutos,

        estudiante_id: row.estudiante_id,
        estudiante_codigo: row.estudiante_codigo,
        estudiante_nombre: row.estudiante_nombre,
        estudiante_email: row.estudiante_email,
        estudiante_programa: row.estudiante_programa,

        monitor_id: row.monitor_id,
        monitor_codigo: row.monitor_codigo,
        monitor_nombre: row.monitor_nombre,
        monitor_email: row.monitor_email,

        materia_codigo: row.materia_codigo,
        materia_nombre: row.materia_nombre,

        disponibilidad_id: row.disponibilidad_id,
        dia_disponibilidad: row.dia_disponibilidad,
        ubicacion: row.ubicacion,

        estado: row.estado,
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte_historico_citas.xlsx"`,
      },
    })
  } catch (err) {
    console.error("Error generando reporte histórico citas:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
