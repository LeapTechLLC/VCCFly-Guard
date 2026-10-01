import { AtomicAmount, BudgetSnapshot, GuardError, LedgerEntry, LedgerEntryType } from "./types";

function parseAtomic(value: AtomicAmount, field: string) {
  if (!/^[0-9]+$/.test(value)) {
    throw new GuardError("INVALID_ATOMIC_AMOUNT", field + " must be a non-negative integer string.");
  }
  return BigInt(value);
}

function toSnapshot(budgetAtomic: bigint, reservedAtomic: bigint, spentAtomic: bigint): BudgetSnapshot {
  return {
    budgetAtomic: budgetAtomic.toString(),
    reservedAtomic: reservedAtomic.toString(),
    spentAtomic: spentAtomic.toString(),
  };
}

export class InMemoryBudgetLedger {
  private readonly projects = new Map<string, BudgetSnapshot>();
  private readonly entries: LedgerEntry[] = [];

  constructor(projects: Record<string, BudgetSnapshot>) {
    for (const [projectId, snapshot] of Object.entries(projects)) {
      this.projects.set(projectId, { ...snapshot });
    }
  }

  getBudget(projectId: string): BudgetSnapshot {
    const snapshot = this.projects.get(projectId);
    if (!snapshot) throw new GuardError("PROJECT_NOT_FOUND", "Unknown project: " + projectId);
    return { ...snapshot };
  }

  getEntries(requestId?: string) {
    const selected = requestId
      ? this.entries.filter((entry) => entry.requestId === requestId)
      : this.entries;
    return selected.map((entry) => ({ ...entry }));
  }

  reserve(input: { requestId: string; projectId: string; amountAtomic: AtomicAmount }) {
    const existing = this.getEntries(input.requestId);
    const terminal = existing.find((entry) => entry.type === "commit" || entry.type === "release");
    if (terminal) {
      throw new GuardError("REQUEST_ALREADY_FINALIZED", "Cannot reserve a finalized request.");
    }
    const previousReservation = existing.find((entry) => entry.type === "reserve");
    if (previousReservation) return { entry: previousReservation, budget: this.getBudget(input.projectId) };

    const snapshot = this.getBudget(input.projectId);
    const amount = parseAtomic(input.amountAtomic, "amountAtomic");
    const budgetAtomic = parseAtomic(snapshot.budgetAtomic, "budgetAtomic");
    const reservedAtomic = parseAtomic(snapshot.reservedAtomic, "reservedAtomic");
    const spentAtomic = parseAtomic(snapshot.spentAtomic, "spentAtomic");
    if (amount > budgetAtomic - reservedAtomic - spentAtomic) {
      throw new GuardError("BUDGET_EXCEEDED", "The requested amount exceeds available project budget.");
    }

    const updated = toSnapshot(budgetAtomic, reservedAtomic + amount, spentAtomic);
    this.projects.set(input.projectId, updated);
    return { entry: this.append("reserve", input), budget: updated };
  }

  commit(requestId: string) {
    const reservation = this.requireReservation(requestId);
    const existing = this.getEntries(requestId);
    const previousCommit = existing.find((entry) => entry.type === "commit");
    if (previousCommit) return { entry: previousCommit, budget: this.getBudget(reservation.projectId) };
    if (existing.some((entry) => entry.type === "release")) {
      throw new GuardError("REQUEST_RELEASED", "A released request cannot be committed.");
    }

    const snapshot = this.getBudget(reservation.projectId);
    const amount = parseAtomic(reservation.amountAtomic, "reservation.amountAtomic");
    const budgetAtomic = parseAtomic(snapshot.budgetAtomic, "budgetAtomic");
    const reservedAtomic = parseAtomic(snapshot.reservedAtomic, "reservedAtomic");
    const spentAtomic = parseAtomic(snapshot.spentAtomic, "spentAtomic");
    const updated = toSnapshot(budgetAtomic, reservedAtomic - amount, spentAtomic + amount);
    this.projects.set(reservation.projectId, updated);
    return {
      entry: this.append("commit", reservation),
      budget: updated,
    };
  }

  release(requestId: string) {
    const reservation = this.requireReservation(requestId);
    const existing = this.getEntries(requestId);
    const previousRelease = existing.find((entry) => entry.type === "release");
    if (previousRelease) return { entry: previousRelease, budget: this.getBudget(reservation.projectId) };
    if (existing.some((entry) => entry.type === "commit")) {
      throw new GuardError("REQUEST_COMMITTED", "A committed request cannot be released.");
    }

    const snapshot = this.getBudget(reservation.projectId);
    const amount = parseAtomic(reservation.amountAtomic, "reservation.amountAtomic");
    const budgetAtomic = parseAtomic(snapshot.budgetAtomic, "budgetAtomic");
    const reservedAtomic = parseAtomic(snapshot.reservedAtomic, "reservedAtomic");
    const spentAtomic = parseAtomic(snapshot.spentAtomic, "spentAtomic");
    const updated = toSnapshot(budgetAtomic, reservedAtomic - amount, spentAtomic);
    this.projects.set(reservation.projectId, updated);
    return {
      entry: this.append("release", reservation),
      budget: updated,
    };
  }

  private requireReservation(requestId: string) {
    const reservation = this.getEntries(requestId).find((entry) => entry.type === "reserve");
    if (!reservation) {
      throw new GuardError("RESERVATION_NOT_FOUND", "A request must be reserved before it can change state.");
    }
    return reservation;
  }

  private append(
    type: LedgerEntryType,
    input: { requestId: string; projectId: string; amountAtomic: AtomicAmount },
  ): LedgerEntry {
    const entry: LedgerEntry = {
      sequence: this.entries.length + 1,
      type,
      requestId: input.requestId,
      projectId: input.projectId,
      amountAtomic: input.amountAtomic,
      createdAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    return { ...entry };
  }
}
