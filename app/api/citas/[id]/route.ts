import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { estado } = await req.json();

  if (!estado) {
    return NextResponse.json({ ok: false, msg: "Estado requerido" }, { status: 400 });
  }

  try {
    const updateSql = `UPDATE citas SET estado = ? WHERE id = ?`;
    await query(updateSql, [estado, id]);

    return NextResponse.json({ ok: true, msg: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json({ ok: false, msg: "Error interno del servidor" }, { status: 500 });
  }
}
