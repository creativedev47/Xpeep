import { environment } from 'config';

const chainIdByEnvironment: Record<string, string> = {
  devnet: 'D',
  testnet: 'T',
  mainnet: '1'
};

export const getChainId = () => {
  return chainIdByEnvironment[environment] || 'D';
};
