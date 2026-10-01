import {
  BudgetSnapshot,
  GuardError,
  GuardPolicy,
  PolicyReason,
  PolicyResult,
  ProcurementRequest,
} from "./types";

function parseAtomic(value: string, field: string): bigint {
  if (!/^[0-9]+$/.test(value)) {
    throw new GuardError("INVALID_ATOMIC_AMOUNT", field + " must be a non-negative integer string.");
  }
  return BigInt(value);
}

function normalizeAddress(value: string | undefined) {
  return value?.trim().toLowerCase() || null;
}

function includesAddress(allowlist: string[], payer: string | undefined) {
  const normalizedPayer = normalizeAddress(payer);
  if (!normalizedPayer) return false;
  return allowlist.some((address) => normalizeAddress(address) === normalizedPayer);
}

export function usdToAtomic(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new GuardError("INVALID_USD_AMOUNT", "USD amount must be a finite non-negative number.");
  }
  return Math.round(value * 1_000_000).toString();
}

export function evaluateProcurementPolicy(
  request: ProcurementRequest,
  policy: GuardPolicy,
  budget: BudgetSnapshot,
): PolicyResult {
  const reasons: PolicyReason[] = [];
  const amount = parseAtomic(request.amountAtomic, "request.amountAtomic");
  const budgetAtomic = parseAtomic(budget.budgetAtomic, "budget.budgetAtomic");
  const reservedAtomic = parseAtomic(budget.reservedAtomic, "budget.reservedAtomic");
  const spentAtomic = parseAtomic(budget.spentAtomic, "budget.spentAtomic");
  const availableAtomic = budgetAtomic - reservedAtomic - spentAtomic;

  if (policy.allowedSkus && !policy.allowedSkus.includes(request.sku)) {
    reasons.push("SKU_NOT_ALLOWED");
  }
  if (policy.allowedNetworks && !policy.allowedNetworks.includes(request.paymentNetwork)) {
    reasons.push("NETWORK_NOT_ALLOWED");
  }
  if (policy.allowedPayers && !includesAddress(policy.allowedPayers, request.payer)) {
    reasons.push("PAYER_NOT_ALLOWED");
  }
  if (amount > availableAtomic) {
    reasons.push("BUDGET_EXCEEDED");
  }
  if (reasons.length > 0) {
    return {
      decision: "rejected",
      reasons,
      availableAtomic: availableAtomic > 0n ? availableAtomic.toString() : "0",
    };
  }

  const threshold = policy.autoApproveBelowAtomic
    ? parseAtomic(policy.autoApproveBelowAtomic, "policy.autoApproveBelowAtomic")
    : null;
  const autoApproved = policy.requireHumanApproval === false && threshold !== null && amount <= threshold;

  if (!request.humanApproved && !autoApproved) {
    return {
      decision: "needs_human",
      reasons: ["HUMAN_APPROVAL_REQUIRED"],
      availableAtomic: availableAtomic.toString(),
    };
  }

  return {
    decision: "approved",
    reasons: [],
    availableAtomic: availableAtomic.toString(),
  };
}
