import { createConfig } from "wagmi";
import { base, optimism } from "wagmi/chains";
import { http } from "viem";

export const config = createConfig({
  chains: [base, optimism],
  transports: {
    [base.id]: http(),
    [optimism.id]: http(),
  },
});
