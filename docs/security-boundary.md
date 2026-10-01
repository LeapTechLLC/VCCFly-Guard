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
