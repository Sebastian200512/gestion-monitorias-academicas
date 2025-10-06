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

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const conn = await getConnection();
  const [rows] = await conn.execute(sql, params);
  return rows as any[];
}
