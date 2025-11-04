import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

// Helper: ¿es hash bcrypt?
const isBcryptHash = (val: any) =>
  typeof val === 'string' && (val.startsWith('$2a$') || val.startsWith('$2b$') || val.startsWith('$2y$'));

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
    }

    // 1) Buscar primero en usuarios (con roles)
    let rows: any[] = await query(
      `
      SELECT u.id, u.nombre_completo, u.correo, u.contrasena, r.nombre AS rol, NULL AS telefono, NULL AS cargo
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN roles r       ON ur.rol_id = r.id
      WHERE u.correo = ?
      `,
      [email]
    );

    let isAdminRecord = false;

    // 2) Si no existe en usuarios, buscar en admins
    if (rows.length === 0) {
      rows = await query(
        `
        SELECT id, nombre_completo, correo, contrasena, 'ADMIN' AS rol, telefono, cargo
        FROM admins
        WHERE correo = ?
        `,
        [email]
      );
      isAdminRecord = rows.length > 0;
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // OJO: si viene de usuarios con múltiples filas (por varios roles), tomamos la primera para auth y consolidamos roles aparte
    const user = rows[0];
    const allRoles = rows.map((r) => r.rol).filter(Boolean);
    const uniqueRoles: string[] = [...new Set(allRoles)];

    // 3) Validación de contraseña con soporte legacy + migración
    const stored = user.contrasena ?? '';
    let ok = false;

    if (isBcryptHash(stored)) {
      ok = await bcrypt.compare(password, stored);
    } else {
      // Legacy: texto plano (ej. código)
      ok = String(password) === String(stored);
      if (ok) {
        // migrar a bcrypt de una vez
        const hashed = await bcrypt.hash(password, 10);
        if (isAdminRecord) {
          await query(`UPDATE admins SET contrasena = ? WHERE id = ?`, [hashed, user.id]);
        } else {
          await query(`UPDATE usuarios SET contrasena = ? WHERE id = ?`, [hashed, user.id]);
        }
      }
    }

    if (!ok) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // 4) Resolver rol principal para UX
    // prioridad: ESTUDIANTE -> MONITOR -> ADMIN (o ADMIN si viene de admins)
    let role: 'student' | 'monitor' | 'admin' = 'admin';
    if (!isAdminRecord) {
      if (uniqueRoles.includes('ESTUDIANTE')) role = 'student';
      else if (uniqueRoles.includes('MONITOR')) role = 'monitor';
      else if (uniqueRoles.includes('ADMIN')) role = 'admin'; // por si tu tabla de roles lo incluye
      else role = 'student'; // fallback razonable
    } else {
      role = 'admin';
    }

    // 5) JWT
    const token = jwt.sign(
      { id: user.id, email: user.correo, role, roles: uniqueRoles },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 6) Respuesta homogénea (admins traen telefono/cargo; usuarios no)
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre_completo,
        email: user.correo,
        telefono: user.telefono ?? null,
        cargo: user.cargo ?? null,
        role,
        roles: uniqueRoles,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Buscar en usuarios
    let rows: any[] = await query(
      `SELECT id, nombre_completo, correo, contrasena FROM usuarios WHERE correo = ? LIMIT 1`,
      [email]
    );
    let table = 'usuarios';

    // Si no, en admins
    if (rows.length === 0) {
      rows = await query(`SELECT id, nombre_completo, correo, contrasena FROM admins WHERE correo = ? LIMIT 1`, [email]);
      table = 'admins';
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = rows[0];
    const stored = user.contrasena ?? '';

    // Validar la contraseña actual con soporte legacy
    let ok = false;
    if (isBcryptHash(stored)) {
      ok = await bcrypt.compare(currentPassword, stored);
    } else {
      ok = String(currentPassword) === String(stored);
    }
    if (!ok) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
    }

    // Hashear y actualizar
    const hashed = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE ${table} SET contrasena = ? WHERE id = ?`, [hashed, user.id]);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
