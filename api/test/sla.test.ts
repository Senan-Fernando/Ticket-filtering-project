import { describe, expect, it } from 'vitest';
import { computeSlaStatus } from '../src/mappers';

const HOUR = 60 * 60 * 1000;
const createdAt = new Date('2026-01-01T00:00:00Z');

function at(hours: number): Date {
  return new Date(createdAt.getTime() + hours * HOUR);
}

describe('computeSlaStatus', () => {
  it('is ok while under 75% of the SLA window', () => {
    const row = { created_at: createdAt, sla_hours: 8, resolved_at: null };
    expect(computeSlaStatus(row, at(5.9))).toBe('ok');
  });

  it('is at_risk from 75% of the SLA window', () => {
    const row = { created_at: createdAt, sla_hours: 8, resolved_at: null };
    expect(computeSlaStatus(row, at(6))).toBe('at_risk');
    expect(computeSlaStatus(row, at(8))).toBe('at_risk');
  });

  it('is breached once the deadline has passed unresolved', () => {
    const row = { created_at: createdAt, sla_hours: 8, resolved_at: null };
    expect(computeSlaStatus(row, at(8.01))).toBe('breached');
  });

  it('uses resolved_at, not now, for resolved tickets', () => {
    const resolvedInTime = { created_at: createdAt, sla_hours: 8, resolved_at: at(7) };
    expect(computeSlaStatus(resolvedInTime, at(100))).toBe('ok');

    const resolvedLate = { created_at: createdAt, sla_hours: 8, resolved_at: at(9) };
    expect(computeSlaStatus(resolvedLate, at(100))).toBe('breached');
  });
});
