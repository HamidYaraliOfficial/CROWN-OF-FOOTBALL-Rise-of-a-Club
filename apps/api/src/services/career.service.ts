import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface CareerRecord { id: string; name: string; clubId: string; season: string; createdAt: string; updatedAt: string; payload?: Record<string, unknown>; }

/**
 * Development-only in-memory adapter. Replace with the PostgreSQL repository before
 * enabling account-based or multiplayer persistence. This adapter intentionally
 * makes no claim of durable server-side storage.
 */
@Injectable()
export class CareerService {
  private readonly careers = new Map<string, CareerRecord>();
  list() { return [...this.careers.values()].map(({ payload: _payload, ...safe }) => safe); }
  create(input: { name: string; clubId: string; season?: string }) {
    const now = new Date().toISOString();
    const record: CareerRecord = { id: randomUUID(), name: input.name.trim(), clubId: input.clubId, season: input.season ?? '2026/27', createdAt: now, updatedAt: now };
    this.careers.set(record.id, record); return record;
  }
  get(id: string) { const record = this.careers.get(id); if (!record) throw new NotFoundException('Career not found'); return record; }
  savePayload(id: string, payload: Record<string, unknown>) { const record = this.get(id); const updated = { ...record, payload, updatedAt: new Date().toISOString() }; this.careers.set(id, updated); return { id, updatedAt: updated.updatedAt }; }
}
