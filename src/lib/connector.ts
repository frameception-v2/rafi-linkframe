import { createConnector } from "wagmi";
import sdk from "@farcaster/frame-sdk";

export function frameConnector() {
  return createConnector((config) => ({
    id: "farcaster-frame",
    name: "Farcaster Frame",
    type: "frame",
    async connect() {
      return {
        accounts: [await sdk.getAddress()],
        chainId: config.chains[0].id,
      };
    },
    async getAccounts() {
      return [await sdk.getAddress()];
    },
    async getChainId() {
      return config.chains[0].id;
    },
    async isAuthorized() {
      return false;
    },
    async disconnect() {
      // No-op
    },
  }));
}
