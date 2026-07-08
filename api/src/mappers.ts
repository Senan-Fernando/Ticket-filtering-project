export interface TicketRow {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: number | null;
  sla_hours: number;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
}

export interface CommentRow {
  id: number;
  ticket_id: number;
  author_id: number;
  author_name: string;
  body: string;
  created_at: Date;
}

export type SlaStatus = 'ok' | 'at_risk' | 'breached';

const AT_RISK_THRESHOLD = 0.75;

// A ticket breaches its SLA if it is not resolved within sla_hours of
// creation. Unresolved tickets past 75% of that window are "at_risk".
// A closed ticket without resolved_at is treated as unresolved.
export function computeSlaStatus(
  row: Pick<TicketRow, 'created_at' | 'sla_hours' | 'resolved_at'>,
  now: Date = new Date()
): SlaStatus {
  const slaMs = row.sla_hours * 60 * 60 * 1000;
  const deadline = row.created_at.getTime() + slaMs;
  if (row.resolved_at) {
    return row.resolved_at.getTime() > deadline ? 'breached' : 'ok';
  }
  if (now.getTime() > deadline) return 'breached';
  if (now.getTime() >= row.created_at.getTime() + slaMs * AT_RISK_THRESHOLD) {
    return 'at_risk';
  }
  return 'ok';
}

export interface TicketDto {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: number | null;
  assigneeName: string | null;
  slaHours: number;
  slaStatus: SlaStatus;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CommentDto {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  body: string;
  createdAt: string;
}

export function toTicketDto(
  row: TicketRow,
  assigneeName: string | null,
  commentCount: number
): TicketDto {
  return {
    id: row.id,
    subject: row.subject,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    assigneeName,
    slaHours: row.sla_hours,
    slaStatus: computeSlaStatus(row),
    commentCount,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    resolvedAt: row.resolved_at ? row.resolved_at.toISOString() : null,
  };
}

export function toCommentDto(row: CommentRow): CommentDto {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  };
}
