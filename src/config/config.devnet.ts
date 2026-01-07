import { EnvironmentsEnum } from 'types';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq3mv7juhpm4z60vqsvkt04rc2eegnajn0azdsmwca9g';
export const API_URL = 'https://devnet-api.multiversx.com';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.devnet;

export const ADMIN_ADDRESSES = [
  // 'erd1ny5tvzyhf8jxa0uv530rnlxp95rhs3jstrcw5dgmq2t2h3evfljq34nn2a', // User's wallet from image
  'erd1mnuy03zf8d99thcvkee4gny9ux0m4mpqt8a49fwj8qf575u0dl7sv4f8t0', // Current user wallet
  'erd1qqqqqqqqqqqqqpgqlf7uyjfn8ajxzs3umc2cx7anneekr6ycdl7swcr83z' // Contract owner
];
