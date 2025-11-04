import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1128904566',
  database: process.env.DB_NAME || 'monitorias',
};

let connection: mysql.Connection | null = null;

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  const conn = await getConnection();
  const [rows] = await conn.execute(sql, params);
  return rows;
}

{/*// lib/db.ts
// Conexión a MySQL usando mysql2/promise optimizada para Railway
import mysql from "mysql2/promise";

// Configuración de la base de datos
// Se leen las variables del entorno que Railway crea automáticamente
const dbConfig = {
  host: process.env.DB_HOST,        // ${{mysql.MYSQLHOST}}
  user: process.env.DB_USER,        // ${{mysql.MYSQLUSER}}
  password: process.env.DB_PASSWORD,// ${{mysql.MYSQLPASSWORD}}
  database: process.env.DB_NAME,    // ${{mysql.MYSQLDATABASE}}
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // ${{mysql.MYSQLPORT}}
  waitForConnections: true,
  connectionLimit: 10,  // permite varias peticiones al mismo tiempo
  queueLimit: 0,
};

// Variable global para evitar que el pool se reinicie en desarrollo
declare global {
  // eslint-disable-next-line no-var
  var _pool: mysql.Pool | undefined;
}

// Retorna el pool de conexiones activo o crea uno nuevo si no existe
export function getPool() {
  if (!global._pool) {
    global._pool = mysql.createPool(dbConfig);
  }
  return global._pool;
}

// Función general para ejecutar consultas SQL
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}*/}

