# Security boundary

This repository demonstrates controls, not custody.

Included:

- policy decisions that are deterministic and explainable;
- budget reserve, commit, and release transitions;
- payer, SKU, and network allowlists;
- a hash-linked audit trail; and
- an Arc Mainnet x402 payment-requirement preview.

Deliberately excluded:

- private keys, wallet seed phrases, API keys, RPC credentials, and environment
  files;
- customer identities, email delivery, merchant inventory, pricing, and
  fulfillment;
- production database schemas and migrations;
- payment signing, x402 settlement execution, and funds custody; and
- VCCFly's private checkout, operations, and admin code.

The preview in this demo is not a payment instruction to use with funds. A
production integration must obtain payment terms from its live endpoint,
require the wallet owner's authorization, verify settlement independently, and
handle failures and reconciliation.

## Integration responsibilities

The demo's `humanApproved` field is a trusted-input example, not proof of
identity or a signed approval. Authenticate the approver and bind the approval
to the exact purchase before setting this field. Policy evaluation and ledger
operations must run in a trusted service, not under the purchasing Agent's
control.

The ledger is in memory and is not durable or safe for concurrent production
requests. Use transactional storage and reject request-ID reuse with changed
project or amount fields in a production integration.

Hash-chain verification checks the stored event sequence; it does not prevent
deletion, truncation, or a full rewrite by a party controlling the storage.
Use durable access-controlled storage and an independently retained checkpoint
when stronger evidence is required.

All wallet addresses in the example are placeholders. Chain and contract
addresses in `src/x402.ts` are public configuration, not credentials. Never
include private keys, seed phrases, API keys, customer records, or proprietary
production files in issues, pull requests, or demo data.
