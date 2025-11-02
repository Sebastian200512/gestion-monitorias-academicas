import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(_.url);
    const fecha = searchParams.get("fecha");
    const dispId = Number(params.id);
    if (!dispId || !fecha) {
      return NextResponse.json({ ok: false, msg: "Parámetros inválidos" }, { status: 400 });
    }

    const [row]: any[] = await query(
      `SELECT COUNT(*) AS usados
         FROM citas
        WHERE disponibilidad_id = ?
          AND fecha_cita       = ?
          AND estado IN ('pendiente','confirmada')`,
      [dispId, fecha]
    );

    const usados = Number(row?.usados ?? 0);
    return NextResponse.json({
      ok: true,
      capacidad: 10,
      usados,
      restantes: Math.max(0, 10 - usados),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, msg: "Error interno" }, { status: 500 });
  }
}
