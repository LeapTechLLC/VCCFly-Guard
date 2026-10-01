# VCCFly Guard

> An MIT-licensed, standalone policy, budget, approval, and audit reference
> implementation for governed Agent procurement on Arc.

[MIT License](LICENSE) · [Live VCCFly](https://vccfly.com) · [Public Agent discovery](https://vccfly.com/.well-known/agent-commerce.json) · [x402 discovery](https://vccfly.com/.well-known/x402)

VCCFly Guard demonstrates a control boundary between an Agent proposing a
purchase and a trusted application authorizing payment. It evaluates budgets,
network and SKU allowlists, and approval requirements, and records hash-linked
decision evidence. The integrating application must authenticate approvals and
enforce these decisions before signing a payment.

It is a self-contained reference implementation for the Tameion Agents
Hackathon and other Arc builders. It does not need a wallet, API key, database,
or live funds. You may fork, modify, redistribute, and commercially reuse this
repository under the MIT License.

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

## Reuse the primitives

Fork this repository and import the exported primitives from `src/index.ts`:

- `evaluateProcurementPolicy` returns `approved`, `needs_human`, or `rejected`
  with reasons for budget, SKU, network, and payer checks.
- `InMemoryBudgetLedger` models project budget reservation, commitment, and
  release, with idempotent transitions for matching request IDs.
- `createArcX402ChallengePreview` produces an Arc Mainnet x402 v2 requirement
  preview for inspection and testing.
- `AuditTrail` records and verifies a hash-linked sequence of decision events.

See [the walkthrough](examples/arc-procurement-demo.ts) for how these pieces
compose. Integrations should use trusted approval records, persistent and
transactional budget storage, independently verified settlement evidence, and
durable audit storage. The demo uses an in-memory ledger and simulated
settlement; it is not a wallet, payment facilitator, or production security
boundary. See [the security boundary](docs/security-boundary.md).

## Arc Open Source commitment

LeapTech LLC commits to keeping VCCFly Guard publicly available and open source
under the MIT License, now and going forward, as a standalone reference
implementation for Arc builders. Contributions, forks, and adaptations are
welcome. Issues and pull requests should include a reproducible example and
relevant tests, without credentials or customer data.

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

## License

Copyright (c) 2026 LeapTech LLC. This repository's source code and documentation
are licensed under the [MIT License](LICENSE). Keep the copyright and license
notice in copies or substantial portions of the Software.

This grant covers VCCFly Guard only. It does not grant rights to VCCFly's
separate proprietary production code, customer data, credentials, or branding.
Third-party dependencies retain their respective licenses.
