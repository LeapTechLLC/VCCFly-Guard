# Architecture

VCCFly Guard is deliberately a small, offline reference implementation. It
models the safety boundary between an Agent proposing a purchase and a payment
system executing it.

~~~
Agent request
   |
   v
Policy evaluation
   |--- rejected: return reasons, do not reserve budget
   |--- needs_human: wait for an explicit approval record
   '-- approved
           |
           v
     Budget reservation
           |
           v
  Arc x402 requirement preview
           |
           v
  Settlement evidence supplied by an integration
           |
           v
   Commit or release budget + append audit events
~~~

The demo uses an in-memory ledger so reviewers can run it without a database,
wallet, API key, or live funds. An integration should persist the ledger in a
transactional store and verify a payment through its chosen x402 facilitator
before calling commit.
