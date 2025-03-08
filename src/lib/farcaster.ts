import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { sdk } from '@farcaster/frame-sdk'

export const frameConnector = () => ({
  id: 'frame',
  name: 'Farcaster Frame',
  type: 'frame' as const,
  async connect() {
    return {
      provider: sdk.wallet.ethProvider,
      account: await sdk.wallet.getEthereumAddress()
    }
  }
})

export const config = createConfig({
  chains: [base],
  connectors: [frameConnector()],
  transports: {
    [base.id]: http()
  },
  ssr: true
})

export type EthereumConfig = typeof config
