import { createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { http } from 'viem'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})
