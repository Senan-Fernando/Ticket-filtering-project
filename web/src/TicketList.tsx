import { useEffect, useState } from 'react';
import { request } from './api';
import type { Ticket } from './types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<Ticket[]>('/tickets')
      .then(setTickets)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!tickets) return <p className="muted">Loading tickets…</p>;

  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>Comments</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td>
              <a href={`#/tickets/${ticket.id}`}>{ticket.subject}</a>
            </td>
            <td>
              <span className={`badge status-${ticket.status}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </td>
            <td>{ticket.priority}</td>
            <td>{ticket.assigneeName ?? '—'}</td>
            <td>{ticket.commentCount}</td>
            <td>{formatDate(ticket.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
