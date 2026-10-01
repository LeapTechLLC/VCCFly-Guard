import {
  ARC_MAINNET_NETWORK,
  AuditTrail,
  createArcX402ChallengePreview,
  evaluateProcurementPolicy,
  InMemoryBudgetLedger,
  usdToAtomic,
} from "../src";

const request = {
  requestId: "demo-arc-order-001",
  projectId: "demo-marketing",
  sku: "demo:credential:7d",
  amountAtomic: usdToAtomic(0.933333),
  paymentNetwork: ARC_MAINNET_NETWORK,
  payer: "0x1111111111111111111111111111111111111111",
};

const policy = {
  allowedSkus: [request.sku],
  allowedNetworks: [ARC_MAINNET_NETWORK],
  allowedPayers: [request.payer],
  requireHumanApproval: true,
};

const ledger = new InMemoryBudgetLedger({
  [request.projectId]: {
    budgetAtomic: usdToAtomic(5),
    reservedAtomic: "0",
    spentAtomic: "0",
  },
});
const audit = new AuditTrail();

console.log("1. Evaluate a proposed Arc purchase");
const initial = evaluateProcurementPolicy(request, policy, ledger.getBudget(request.projectId));
console.log(initial);
audit.append({
  eventType: "policy_evaluated",
  requestId: request.requestId,
  data: { decision: initial.decision, reasons: initial.reasons },
});

if (initial.decision !== "needs_human") {
  throw new Error("The demo expects a human-approval escalation.");
}

console.log("\n2. Record explicit human approval and reserve the budget");
const approvedRequest = {
  ...request,
  humanApproved: true,
  approvalReference: "demo-approval-001",
};
const approved = evaluateProcurementPolicy(approvedRequest, policy, ledger.getBudget(request.projectId));
console.log(approved);
const reservation = ledger.reserve(request);
audit.append({
  eventType: "budget_reserved",
  requestId: request.requestId,
  data: { ledgerSequence: reservation.entry.sequence, amountAtomic: request.amountAtomic },
});

console.log("\n3. Emit an Arc x402 payment requirement preview");
const challenge = createArcX402ChallengePreview({
  amountAtomic: request.amountAtomic,
  payTo: "0x2222222222222222222222222222222222222222",
});
console.log(JSON.stringify(challenge, null, 2));
audit.append({
  eventType: "x402_challenge_created",
  requestId: request.requestId,
  data: { network: ARC_MAINNET_NETWORK, amountAtomic: request.amountAtomic },
});

console.log("\n4. Simulate verified settlement and commit budget");
const committed = ledger.commit(request.requestId);
audit.append({
  eventType: "settlement_recorded",
  requestId: request.requestId,
  data: {
    settlementReference: "demo-only:no-wallet-or-payment-was-created",
    ledgerSequence: committed.entry.sequence,
  },
});

console.log({
  finalBudget: committed.budget,
  ledger: ledger.getEntries(request.requestId),
  auditHashChainValid: audit.verify(),
});
console.log("\nDemo complete. This code does not create a wallet, sign a payload, or move USDC.");
