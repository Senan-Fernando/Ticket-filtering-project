import { pool } from '../db';
import type { CommentRow } from '../mappers';

export async function countForTicket(ticketId: number): Promise<number> {
  const { rows } = await pool.query(
    'select count(*) from comments where ticket_id = $1',
    [ticketId]
  );
  return Number(rows[0].count);
}

export async function listForTicket(ticketId: number): Promise<CommentRow[]> {
  const { rows } = await pool.query(
    `select c.id, c.ticket_id, c.author_id, u.name as author_name, c.body, c.created_at
       from comments c
       join users u on u.id = c.author_id
      where c.ticket_id = $1
      order by c.created_at asc`,
    [ticketId]
  );
  return rows;
}
