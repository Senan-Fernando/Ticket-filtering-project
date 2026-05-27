import { pool } from '../db';

export async function findNameById(id: number): Promise<string | null> {
  const { rows } = await pool.query('select name from users where id = $1', [id]);
  return rows[0]?.name ?? null;
}
