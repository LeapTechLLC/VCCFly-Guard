# Tameion submission comparison

## Public review link

[Review the complete public Guard demo](https://github.com/LeapTechLLC/VCCFly-Guard/compare/codex/tameion-baseline...codex/tameion-demo).

The comparison covers VCCFly Guard only: the standalone MIT-licensed policy,
budget, approval, and audit reference implementation. It does not contain or
represent a diff of the proprietary VCCFly application.

## How this comparison was prepared

Both comparison branches were prepared on October 2, 2026 for the submission.
The `codex/tameion-baseline` branch is an explicitly empty packaging baseline.
It is not an original pre-event branch, and it did not exist at the event start.
The `codex/tameion-demo` branch contains a snapshot of the existing public demo
plus this submission documentation. No development dates were backdated.

The original public development history remains on `main`:

- [Initial Guard implementation](https://github.com/LeapTechLLC/VCCFly-Guard/commit/d0229a618656a9a0233070fe62df3c1d6be0b869), committed October 2, 2026.
- [MIT license and reuse documentation](https://github.com/LeapTechLLC/VCCFly-Guard/commit/e4c1688828f3682239440bd78060866ef961378e), committed October 2, 2026.

The code snapshot comes from the second commit above. The comparison is a way
to review all code in this newly created event-period reference implementation,
not proof of the full commercial product's development timeline.

## What reviewers can run

Follow the commands in the [README](../README.md) to run the type check, tests,
and procurement demo. The reusable primitives include:

- deterministic SKU, network, payer, budget, and approval checks;
- in-memory project budget reservation, commitment, and release;
- idempotent ledger transitions;
- Arc Mainnet x402 v2 payment-requirement previews; and
- hash-linked audit events and integrity verification.

The demo uses simulated settlement. It does not create a wallet, sign a
payment, contact a facilitator, or move USDC. Integrators must authenticate
approvals, persist budget and audit data, and independently verify settlement.
See the [security boundary](security-boundary.md).

## Live-product evidence is separate

The [live VCCFly product](https://vccfly.com) and
[recorded walkthrough](https://www.youtube.com/watch?v=X_Obbq1M_L0) provide
separate context for production checkout and fulfillment. The founder-run
[Arc Mainnet transaction](https://explorer.arc.io/tx/0x79caa293a1c9528e7a51387899ee3c69466d04b5296f3837b6a33e2842c27df9)
is not an external-user traction claim or proof that this public Guard demo
settles payments. Independent end-to-end agent procurement validation remains
pending.

This public comparison does not establish that a partial open-source submission
meets every organizer requirement. Reviewers should assess the public reference
implementation within its stated scope.
