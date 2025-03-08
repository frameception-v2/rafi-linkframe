import { createConfig, http } from "wagmi";
import { base, optimism } from "wagmi/chains";
import { frameConnector } from "~/lib/connector";

export const config = createConfig({
  chains: [base, optimism],
  connectors: [frameConnector()],
  transports: {
    [base.id]: http(),
    [optimism.id]: http(),
  },
});
