import { ArcX402Requirement, AtomicAmount, GuardError } from "./types";

export const ARC_MAINNET_NETWORK = "eip155:5042";
export const ARC_NATIVE_USDC = "0x3600000000000000000000000000000000000000";
export const ARC_GATEWAY_WALLET = "0x77777777dcc4d5a8b6e418fd04d8997ef11000ee";

function validAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function validAtomicAmount(value: AtomicAmount) {
  return /^[1-9][0-9]*$/.test(value);
}

export function createArcX402ChallengePreview(input: {
  amountAtomic: AtomicAmount;
  payTo: string;
  maxTimeoutSeconds?: number;
}): ArcX402Requirement {
  if (!validAtomicAmount(input.amountAtomic)) {
    throw new GuardError("INVALID_PAYMENT_AMOUNT", "x402 amount must be a positive atomic USDC amount.");
  }
  if (!validAddress(input.payTo)) {
    throw new GuardError("INVALID_RECEIVER", "x402 receiver must be a valid EVM address.");
  }
  return {
    x402Version: 2,
    accepts: [{
      scheme: "exact",
      network: ARC_MAINNET_NETWORK,
      asset: ARC_NATIVE_USDC,
      amount: input.amountAtomic,
      payTo: input.payTo.toLowerCase(),
      maxTimeoutSeconds: input.maxTimeoutSeconds ?? 300,
      extra: {
        name: "GatewayWalletBatched",
        version: "1",
        verifyingContract: ARC_GATEWAY_WALLET,
      },
    }],
  };
}
