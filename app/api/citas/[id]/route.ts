import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { estado, fecha_cita } = await req.json();

  if (!estado && !fecha_cita) {
    return NextResponse.json({ ok: false, msg: "Estado o fecha requeridos" }, { status: 400 });
  }

  try {
    let updateSql = `UPDATE citas SET `;
    const params: any[] = [];
    const updates: string[] = [];

    if (estado) {
      updates.push(`estado = ?`);
      params.push(estado);
    }
    if (fecha_cita) {
      updates.push(`fecha_cita = ?`);
      params.push(fecha_cita);
    }

    updateSql += updates.join(', ') + ` WHERE id = ?`;
    params.push(id);

    await query(updateSql, params);

    return NextResponse.json({ ok: true, msg: "Cita actualizada correctamente" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
