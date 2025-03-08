import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { frameConnector } from "./lib/connector";

export const config = createConfig({
  chains: [base],
  connectors: [frameConnector()],
  transports: {
    [base.id]: http(),
  },
});
