import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { correo, contrasena, tipo } = await req.json(); // 'ADMIN' | 'USUARIO'

  if (tipo === "ADMIN") {
    const admin = await prisma.admins.findUnique({ where: { correo } });
    if (!admin || !admin.activo) return NextResponse.json({ ok:false, msg:"Credenciales inválidas" }, { status: 401 });
    const ok = await bcrypt.compare(contrasena, admin.contrasena);
    return ok
      ? NextResponse.json({ ok:true, user:{ id:admin.id, tipo:"ADMIN", nombre: admin.nombre_completo } })
      : NextResponse.json({ ok:false, msg:"Credenciales inválidas" }, { status: 401 });
  }

  const user = await prisma.usuarios.findUnique({ where: { correo } });
  if (!user || !user.activo) return NextResponse.json({ ok:false, msg:"Credenciales inválidas" }, { status: 401 });
  const ok = await bcrypt.compare(contrasena, user.contrasena);
  const roles = await prisma.usuario_rol.findMany({
    where: { usuario_id: user.id },
    include: { rol: true }
  });
  return ok
    ? NextResponse.json({ ok:true, user:{ id:user.id, tipo:"USUARIO", nombre: user.nombre_completo, roles: roles.map(r=>r.rol.nombre) } })
    : NextResponse.json({ ok:false, msg:"Credenciales inválidas" }, { status: 401 });
}
