import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const materia = searchParams.get("materia_id");
  const where: any = { estado: "Activa" };
  if (materia) where.materia_id = Number(materia);

  const data = await prisma.disponibilidades.findMany({
    where,
    include: { materia: true, monitor: { select: { id: true, nombre_completo: true } } },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }]
  });
  return NextResponse.json({ ok:true, data });
}

export async function POST(req: NextRequest) {
  const { monitor_id, materia_id, fecha, hora_inicio, hora_fin, ubicacion, max_estudiantes } = await req.json();

  const isMonitor = await prisma.usuario_rol.findFirst({
    where: { usuario_id: monitor_id, rol: { nombre: "MONITOR" } },
    include: { rol: true }
  });
  if (!isMonitor) return NextResponse.json({ ok:false, msg:"No autorizado" }, { status: 403 });

  const disp = await prisma.disponibilidades.create({
    data: {
      monitor_id, materia_id,
      fecha: new Date(fecha),
      hora_inicio: new Date(hora_inicio),
      hora_fin: new Date(hora_fin),
      ubicacion, max_estudiantes
    }
  });
  return NextResponse.json({ ok:true, data: disp });
}
