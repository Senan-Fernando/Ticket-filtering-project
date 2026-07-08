import { useEffect, useState } from 'react';
import { request } from './api';
import type { Ticket } from './types';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

const SLA_LABELS: Record<Ticket['slaStatus'], string> = {
  ok: 'on track',
  at_risk: 'at risk',
  breached: 'breached',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  // Assignee options come from the first unfiltered load, so the dropdown
  // keeps all agents even when the current result set is filtered down.
  const [assignees, setAssignees] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (assigneeFilter) params.set('assigneeId', assigneeFilter);
    const query = params.toString();

    request<Ticket[]>(`/tickets${query ? `?${query}` : ''}`)
      .then((data) => {
        setError(null);
        setTickets(data);
        if (!query) {
          const seen = new Map<number, string>();
          for (const t of data) {
            if (t.assigneeId !== null && t.assigneeName) {
              seen.set(t.assigneeId, t.assigneeName);
            }
          }
          setAssignees(
            [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [statusFilter, assigneeFilter]);

  if (error) return <p className="error">{error}</p>;
  if (!tickets) return <p className="muted">Loading tickets…</p>;

  return (
    <>
      <div className="filters">
        <label>
          Status{' '}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assignee{' '}
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {tickets.length === 0 ? (
        <p className="muted">No tickets match the current filters.</p>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Status</th>
              <th>SLA</th>
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
                <td>
                  <span className={`badge sla-${ticket.slaStatus}`}>
                    {SLA_LABELS[ticket.slaStatus]}
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
      )}
    </>
  );
}
