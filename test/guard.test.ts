import assert from "node:assert/strict";
import {
  ARC_MAINNET_NETWORK,
  AuditTrail,
  createArcX402ChallengePreview,
  evaluateProcurementPolicy,
  GuardError,
  InMemoryBudgetLedger,
  usdToAtomic,
} from "../src";

function baseRequest(overrides: Record<string, unknown> = {}) {
  return {
    requestId: "request-001",
    projectId: "project-001",
    sku: "demo:credential:7d",
    amountAtomic: usdToAtomic(0.933333),
    paymentNetwork: ARC_MAINNET_NETWORK,
    payer: "0x1111111111111111111111111111111111111111",
    ...overrides,
  };
}

function baseBudget(overrides: Record<string, string> = {}) {
  return {
    budgetAtomic: usdToAtomic(5),
    reservedAtomic: "0",
    spentAtomic: "0",
    ...overrides,
  };
}

function expectGuardError(action: () => unknown, code: string) {
  try {
    action();
  } catch (error) {
    assert(error instanceof GuardError);
    assert.equal(error.code, code);
    return;
  }
  assert.fail("Expected GuardError " + code);
}

const approvalPolicy = {
  allowedSkus: ["demo:credential:7d"],
  allowedNetworks: [ARC_MAINNET_NETWORK],
  allowedPayers: ["0x1111111111111111111111111111111111111111"],
  requireHumanApproval: true,
};

const pending = evaluateProcurementPolicy(baseRequest(), approvalPolicy, baseBudget());
assert.equal(pending.decision, "needs_human");
assert.deepEqual(pending.reasons, ["HUMAN_APPROVAL_REQUIRED"]);

const approved = evaluateProcurementPolicy(
  baseRequest({ humanApproved: true }),
  approvalPolicy,
  baseBudget(),
);
assert.equal(approved.decision, "approved");

const overBudget = evaluateProcurementPolicy(
  baseRequest(),
  approvalPolicy,
  baseBudget({ budgetAtomic: "1" }),
);
assert.equal(overBudget.decision, "rejected");
assert.deepEqual(overBudget.reasons, ["BUDGET_EXCEEDED"]);

const invalidNetwork = evaluateProcurementPolicy(
  baseRequest({ paymentNetwork: "eip155:8453" }),
  approvalPolicy,
  baseBudget(),
);
assert.equal(invalidNetwork.decision, "rejected");
assert.deepEqual(invalidNetwork.reasons, ["NETWORK_NOT_ALLOWED"]);

const autoApproved = evaluateProcurementPolicy(
  baseRequest(),
  {
    ...approvalPolicy,
    requireHumanApproval: false,
    autoApproveBelowAtomic: usdToAtomic(1),
  },
  baseBudget(),
);
assert.equal(autoApproved.decision, "approved");

const ledger = new InMemoryBudgetLedger({ "project-001": baseBudget() });
const reserve = ledger.reserve(baseRequest());
const reserveAgain = ledger.reserve(baseRequest());
assert.equal(reserveAgain.entry.sequence, reserve.entry.sequence);
assert.equal(ledger.getBudget("project-001").reservedAtomic, usdToAtomic(0.933333));

const commit = ledger.commit("request-001");
const commitAgain = ledger.commit("request-001");
assert.equal(commitAgain.entry.sequence, commit.entry.sequence);
assert.equal(ledger.getBudget("project-001").spentAtomic, usdToAtomic(0.933333));
expectGuardError(() => ledger.release("request-001"), "REQUEST_COMMITTED");

const preview = createArcX402ChallengePreview({
  amountAtomic: usdToAtomic(0.933333),
  payTo: "0x2222222222222222222222222222222222222222",
});
assert.equal(preview.x402Version, 2);
assert.equal(preview.accepts[0].network, ARC_MAINNET_NETWORK);
assert.equal(preview.accepts[0].asset, "0x3600000000000000000000000000000000000000");

const audit = new AuditTrail();
audit.append({ eventType: "policy_evaluated", requestId: "request-001", data: { decision: "needs_human" } });
audit.append({ eventType: "budget_committed", requestId: "request-001", data: { amountAtomic: usdToAtomic(0.933333) } });
assert.equal(audit.verify(), true);

console.log("✓ policy escalation, rejection, and auto-approval");
console.log("✓ idempotent reserve and commit transitions");
console.log("✓ Arc x402 payment requirement preview");
console.log("✓ append-only audit hash chain");
