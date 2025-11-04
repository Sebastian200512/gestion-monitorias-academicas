import { getConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { monitor_id, disponibilidad_id, fecha_cita } = body || {};

  if (!monitor_id || !disponibilidad_id || !fecha_cita) {
    return NextResponse.json(
      { ok: false, msg: "Faltan parámetros: monitor_id, disponibilidad_id, fecha_cita" },
      { status: 400 }
    );
  }

  // Normalizar fecha a YYYY-MM-DD por si llega en ISO (2025-11-04T00:00:00Z)
  try {
    const d = new Date(fecha_cita);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      fecha_cita = `${d.getFullYear()}-${mm}-${dd}`;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_cita)) {
      return NextResponse.json({ ok: false, msg: "fecha_cita inválida" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, msg: "fecha_cita inválida" }, { status: 400 });
  }

  const lockKey = `slot_${disponibilidad_id}_${fecha_cita}`;
  const conn = await getConnection();

  try {
    // 1) Validar que la disponibilidad pertenece al monitor
    const [disp]: any = await conn.execute(
      "SELECT id FROM disponibilidades WHERE id = ? AND monitor_id = ?",
      [disponibilidad_id, monitor_id]
    );
    if (!disp.length) {
      return NextResponse.json(
        { ok: false, msg: "Disponibilidad no pertenece al monitor" },
        { status: 403 }
      );
    }

    // 2) Transacción + lock
    await conn.beginTransaction();
    const [lockRes]: any = await conn.execute("SELECT GET_LOCK(?, 5) AS locked", [lockKey]);
    const locked = Number(lockRes?.[0]?.locked ?? 0) === 1;
    if (!locked) {
      await conn.rollback();
      return NextResponse.json({ ok: false, msg: "No se pudo obtener el lock" }, { status: 409 });
    }

    // 3) Seleccionar citas activas del bloque y bloquearlas (pend/confirm)
    const [idsRows]: any = await conn.execute(
      `SELECT id
         FROM citas
        WHERE disponibilidad_id = ?
          AND fecha_cita       = ?
          AND estado IN ('pendiente','confirmada')
        FOR UPDATE`,
      [disponibilidad_id, fecha_cita]
    );
    const ids = idsRows.map((r: any) => r.id);

    if (ids.length === 0) {
      await conn.execute("SELECT RELEASE_LOCK(?)", [lockKey]);
      await conn.commit();
      return NextResponse.json({ ok: true, msg: "No había citas por completar", count: 0, ids: [] });
    }

    // 4) Completar en lote
    const [upd]: any = await conn.execute(
      `UPDATE citas
          SET estado = 'completada'
        WHERE disponibilidad_id = ?
          AND fecha_cita       = ?
          AND estado IN ('pendiente','confirmada')`,
      [disponibilidad_id, fecha_cita]
    );

    // 5) Release lock + commit
    await conn.execute("SELECT RELEASE_LOCK(?)", [lockKey]);
    await conn.commit();

    // Diagnóstico si difiere el conteo esperado vs actualizado
    if (upd.affectedRows !== ids.length) {
      console.warn("[completar-grupo] mismatch afectados", {
        disponibilidad_id,
        fecha_cita,
        seleccionadas: ids.length,
        actualizadas: upd.affectedRows,
      });
    }

    return NextResponse.json({
      ok: true,
      msg: "Citas marcadas como completadas",
      count: upd.affectedRows,
      ids,
    });
  } catch (error) {
    try { await conn.execute("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}
    try { await conn.rollback(); } catch {}
    console.error("Error en completar-grupo:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
