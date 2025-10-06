import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { estudiante_id, disponibilidad_id } = await req.json();

  const disp = await prisma.disponibilidades.findUnique({
    where: { id: Number(disponibilidad_id) }
  });
  if (!disp || disp.estado !== "Activa") return NextResponse.json({ ok:false, msg:"Slot no disponible" }, { status: 400 });

  const usados = await prisma.citas.count({
    where: { disponibilidad_id: disp.id, estado: { in: ["pendiente","confirmada"] } }
  });
  if (usados >= disp.max_estudiantes) return NextResponse.json({ ok:false, msg:"Cupo lleno" }, { status: 400 });

  const cita = await prisma.citas.create({
    data: {
      estudiante_id: Number(estudiante_id),
      monitor_id: disp.monitor_id,
      disponibilidad_id: disp.id,
      materia_id: disp.materia_id,
      fecha_cita: disp.fecha,
      hora_inicio: disp.hora_inicio,
      hora_fin: disp.hora_fin,
      estado: "pendiente"
    }
  });
  return NextResponse.json({ ok:true, data: cita });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const monitorId = searchParams.get("monitor_id");
  const estudianteId = searchParams.get("estudiante_id");
  const where: any = {};
  if (monitorId) where.monitor_id = Number(monitorId);
  if (estudianteId) where.estudiante_id = Number(estudianteId);

  const data = await prisma.citas.findMany({
    where,
    include: { materia: true, estudiante: true, monitor: true },
    orderBy: [{ fecha_cita: "desc" }, { hora_inicio: "desc" }]
  });
  return NextResponse.json({ ok:true, data });
}
