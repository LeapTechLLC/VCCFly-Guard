export type AtomicAmount = string;

export type ProcurementRequest = {
  requestId: string;
  projectId: string;
  sku: string;
  amountAtomic: AtomicAmount;
  paymentNetwork: string;
  payer?: string;
  humanApproved?: boolean;
  approvalReference?: string;
};

export type GuardPolicy = {
  allowedSkus?: string[];
  allowedNetworks?: string[];
  allowedPayers?: string[];
  autoApproveBelowAtomic?: AtomicAmount;
  requireHumanApproval?: boolean;
};

export type BudgetSnapshot = {
  budgetAtomic: AtomicAmount;
  reservedAtomic: AtomicAmount;
  spentAtomic: AtomicAmount;
};

export type GuardDecision = "approved" | "needs_human" | "rejected";

export type PolicyReason =
  | "SKU_NOT_ALLOWED"
  | "NETWORK_NOT_ALLOWED"
  | "PAYER_NOT_ALLOWED"
  | "BUDGET_EXCEEDED"
  | "HUMAN_APPROVAL_REQUIRED";

export type PolicyResult = {
  decision: GuardDecision;
  reasons: PolicyReason[];
  availableAtomic: AtomicAmount;
};

export type LedgerEntryType = "reserve" | "commit" | "release";

export type LedgerEntry = {
  sequence: number;
  type: LedgerEntryType;
  requestId: string;
  projectId: string;
  amountAtomic: AtomicAmount;
  createdAt: string;
};

export type ArcX402Requirement = {
  x402Version: 2;
  accepts: Array<{
    scheme: "exact";
    network: string;
    asset: string;
    amount: AtomicAmount;
    payTo: string;
    maxTimeoutSeconds: number;
    extra: {
      name: string;
      version: string;
      verifyingContract: string;
    };
  }>;
};

export type AuditEvent = {
  sequence: number;
  eventType: string;
  requestId: string;
  createdAt: string;
  previousHash: string | null;
  hash: string;
  data: Record<string, unknown>;
};

export class GuardError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GuardError";
  }
}
