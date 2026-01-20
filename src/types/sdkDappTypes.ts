export {
  EnvironmentsEnum
} from 'lib';

export enum LoginMethodsEnum {
  ledger = 'ledger',
  walletconnect = 'walletconnect',
  wallet = 'wallet',
  extension = 'extension',
  extra = 'extra',
  none = ''
}

export enum SignedMessageStatusesEnum {
  pending = 'pending',
  signed = 'signed',
  cancelled = 'cancelled'
}
export type { ServerTransactionType } from 'lib';
export type {
  SignedTransactionType,
  TransactionsDisplayInfoType,
} from 'lib';

// Locally defined or commented out if not critical
export interface WithClassnameType {
  className?: string;
}

export interface RouteType {
  path: string;
  component: any;
  authenticatedRoute?: boolean;
}

export interface RawTransactionType {
  value: string;
  receiver: string;
  sender: string;
  gasPrice: number;
  gasLimit: number;
  data: string;
  chainID: string;
  version: number;
}
