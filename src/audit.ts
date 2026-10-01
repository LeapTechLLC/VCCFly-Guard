import { createHash } from "node:crypto";
import { AuditEvent } from "./types";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  const record = value as Record<string, unknown>;
  return "{" + Object.keys(record).sort().map((key) => {
    return JSON.stringify(key) + ":" + stableStringify(record[key]);
  }).join(",") + "}";
}

function hash(value: unknown) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

export class AuditTrail {
  private readonly events: AuditEvent[] = [];

  append(input: {
    eventType: string;
    requestId: string;
    data: Record<string, unknown>;
  }) {
    const previousHash = this.events.at(-1)?.hash ?? null;
    const event: AuditEvent = {
      sequence: this.events.length + 1,
      eventType: input.eventType,
      requestId: input.requestId,
      createdAt: new Date().toISOString(),
      previousHash,
      hash: "",
      data: input.data,
    };
    event.hash = hash({
      sequence: event.sequence,
      eventType: event.eventType,
      requestId: event.requestId,
      previousHash: event.previousHash,
      data: event.data,
    });
    this.events.push(event);
    return { ...event, data: { ...event.data } };
  }

  list() {
    return this.events.map((event) => ({ ...event, data: { ...event.data } }));
  }

  verify() {
    let previousHash: string | null = null;
    for (const event of this.events) {
      const expected = hash({
        sequence: event.sequence,
        eventType: event.eventType,
        requestId: event.requestId,
        previousHash,
        data: event.data,
      });
      if (event.previousHash !== previousHash || event.hash !== expected) return false;
      previousHash = event.hash;
    }
    return true;
  }
}
