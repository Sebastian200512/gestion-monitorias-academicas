import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

const ONE_HOUR = 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Mensaje genérico para evitar enumeración
    const invalidMsg = { error: 'Correo o contraseña inválidos' };

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no configurado');
      return NextResponse.json({ error: 'Misconfiguración del servidor' }, { status: 500 });
    }

    // Buscar primero en usuarios (con roles)
    let rows: any[] = await query(
      `
      SELECT u.id, u.nombre_completo, u.correo, u.contrasena, r.nombre AS rol
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.correo = ?
      `,
      [email]
    );

    let isAdminTable = false;

    // Si no está en usuarios, buscar en admins
    if (rows.length === 0) {
      rows = await query(
        `SELECT id, nombre_completo, correo, contrasena, telefono, cargo, 'ADMIN' AS rol
         FROM admins WHERE correo = ?`,
        [email]
      );
      isAdminTable = rows.length > 0;
    }

    // Usuario no encontrado (genérico)
    if (rows.length === 0) {
      // No revelar si existe o no
      return NextResponse.json(invalidMsg, { status: 401 });
    }

    const base = rows[0];
    const rolesRaw = rows.map(r => r.rol).filter(Boolean);
    const uniqueRoles = Array.from(new Set(rolesRaw)); // ['ESTUDIANTE','MONITOR'] o ['ADMIN']

    // Verificación de contraseña
    const ok = await bcrypt.compare(password, base.contrasena || '');
    if (!ok) {
      return NextResponse.json(invalidMsg, { status: 401 });
    }

    // Determinar rol principal sin defaults peligrosos
    let primaryRole: 'admin' | 'monitor' | 'student';
    if (isAdminTable || uniqueRoles.includes('ADMIN')) {
      primaryRole = 'admin';
    } else if (uniqueRoles.includes('MONITOR')) {
      primaryRole = 'monitor';
    } else if (uniqueRoles.includes('ESTUDIANTE')) {
      primaryRole = 'student';
    } else {
      // Usuario válido sin rol explícito (defensa por si la DB está inconsistente)
      primaryRole = 'student';
    }

    // Firmar JWT (solo claims necesarios)
    const token = jwt.sign(
      { sub: String(base.id), email: base.correo, roles: uniqueRoles, pr: primaryRole },
      process.env.JWT_SECRET,
      { expiresIn: ONE_HOUR } // 1h
    );

    // Respuesta JSON mínima + set cookie HttpOnly
    const res = NextResponse.json({
      user: {
        id: base.id,
        nombre: base.nombre_completo,
        email: base.correo,
        roles: uniqueRoles,
        role: primaryRole,
        ...(isAdminTable ? { telefono: base.telefono, cargo: base.cargo } : {})
      }
    });

    res.cookies.set('access_token', token, {
      httpOnly: true,
      secure: true,          // requiere HTTPS en prod
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_HOUR
    });

    return res;
  } catch (err) {
    console.error('Error en login:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    const rows: any[] = await query(
      `SELECT id, contrasena FROM usuarios WHERE correo = ?`,
      [email]
    );

    // Respuesta genérica para evitar enumeración
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(currentPassword, user.contrasena || '');
    if (!ok) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // (Opcional) validar fuerza de contraseña aquí

    const hashed = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE usuarios SET contrasena = ? WHERE id = ?`, [hashed, user.id]);

    // (Opcional) invalidar otras sesiones / refresh tokens

    return NextResponse.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
