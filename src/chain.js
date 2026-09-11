import { BrowserProvider, Contract } from 'ethers'

export const robinhoodTestnet = {
  chainId: '0xb626',
  chainName: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://explorer.testnet.chain.robinhood.com'],
}

const registryAbi = [
  'function totalSignals() view returns (uint256)',
  'function reputation(address) view returns (uint256)',
  'function publishSignal(bytes32 projectId, string evidenceURI, uint8 score) returns (uint256)',
]

export async function connectWallet() {
  if (!window.ethereum) throw new Error('Install an EVM wallet to continue.')

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: robinhoodTestnet.chainId }],
    })
  } catch (error) {
    if (error.code !== 4902) throw error
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [robinhoodTestnet],
    })
  }

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  const network = await provider.getNetwork()
  return { provider, signer, address, chainId: Number(network.chainId) }
}

export function getRegistry(signerOrProvider) {
  const address = import.meta.env.VITE_REGISTRY_ADDRESS
  if (!address || /^0x0{40}$/i.test(address)) return null
  return new Contract(address, registryAbi, signerOrProvider)
}
