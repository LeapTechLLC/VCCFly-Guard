# VCCFly Guard

> A standalone policy, audit, and x402 challenge demo for governed Agent
> procurement on Arc.

[Live VCCFly](https://vccfly.com) · [Public Agent discovery](https://vccfly.com/.well-known/agent-commerce.json) · [x402 discovery](https://vccfly.com/.well-known/x402)

VCCFly Guard demonstrates a narrow but important safety boundary: an Agent can
propose a purchase, but it cannot silently exceed a budget, escape a network or
SKU allowlist, skip a required human approval, or erase the decision trail.

It is a self-contained demo for review during the Tameion Agents Hackathon. It
does not need a wallet, API key, database, or live funds.

## Run it

Requirements: Node.js 20 or later.

~~~
npm install
npm run typecheck
npm test
npm run demo
~~~

The demo walks through:

1. a proposed $0.933333 Arc USDC procurement;
2. a policy result of needs_human;
3. an explicit approval and budget reservation;
4. a generated Arc x402 v2 payment-requirement preview;
5. a simulated verified settlement followed by a budget commit; and
6. a verified append-only audit trail.

The simulated settlement is intentional. The demo never creates a wallet,
asks for a signature, or moves USDC.

## What is included

~~~
src/policy.ts    deterministic budget, allowlist, and approval checks
src/ledger.ts    idempotent reserve, commit, and release transitions
src/x402.ts      Arc Mainnet x402 requirement preview
src/audit.ts     hash-linked decision and settlement evidence
examples/        a runnable end-to-end procurement walkthrough
test/            executable policy, ledger, x402, and audit checks
~~~

## Production boundary

VCCFly Guard is a standalone reference implementation. The commercial VCCFly
checkout, merchant inventory, customer information, fulfillment, payment
credentials, and production operations are intentionally proprietary and are
not included here.

The live product exposes public, machine-readable interfaces for Agent
discovery and payment terms. A request to its protected purchase endpoint
without payment authorization returns an HTTP 402 challenge. Live payment must
remain human-approved and independently verified by the production service.

## Review guide

Start with [the architecture](docs/architecture.md), run the commands above,
then inspect [the security boundary](docs/security-boundary.md). The tests show
that over-budget and disallowed requests are rejected, approval gates work,
ledger transitions are idempotent, and audit events remain hash-linked.

## Rights

Copyright 2026 LeapTech LLC. All rights reserved.

The source is published for hackathon evaluation and technical review. No
license is granted for commercial reuse.
