import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Email:', email, 'Password received:', password);

    // Check usuarios table first
    let users: any[] = await query(`
      SELECT u.id, u.nombre_completo, u.correo, u.contrasena, r.nombre as rol
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.correo = ?
    `, [email]);

    let isAdmin = false;
    if (users.length === 0) {
      // Check admins table
      users = await query('SELECT id, nombre_completo, correo, contrasena, telefono, cargo, \'ADMIN\' as rol FROM admins WHERE correo = ?', [email]);
      isAdmin = true;
    }

    if (users.length === 0) {
      console.log('Usuario no encontrado:', email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    const user = users[0];
    console.log('Usuario encontrado:', user.nombre_completo, 'Rol:', user.rol);
    const isValidPassword = await bcrypt.compare(password, user.contrasena);
    if (!isValidPassword) {
      console.log('Contraseña incorrecta para:', email, 'Stored hash:', user.contrasena);
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const role = user.rol === 'ESTUDIANTE' ? 'student' : user.rol === 'MONITOR' ? 'monitor' : 'admin';

    const token = jwt.sign({ id: user.id, email: user.correo, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    return NextResponse.json({ token, user: { id: user.id, nombre: user.nombre_completo, email: user.correo, telefono: user.telefono, cargo: user.cargo, role } });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    // Find user by email
    let users: any[] = await query(`
      SELECT u.id, u.nombre_completo, u.correo, u.contrasena
      FROM usuarios u
      WHERE u.correo = ?
    `, [email]);

    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = users[0];

    // Validate current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await query(`
      UPDATE usuarios SET contrasena = ? WHERE id = ?
    `, [hashedPassword, user.id]);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
