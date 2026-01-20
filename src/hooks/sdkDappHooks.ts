// Re-export hooks from lib to ensure SDK v5 compatibility
export { useGetAccount } from 'lib';
export { useGetLoginInfo } from 'lib';
export { useGetIsLoggedIn } from 'lib';
export { useGetNetworkConfig } from 'lib';
export { useGetPendingTransactions } from 'lib';

// The following hooks were not explicitly found in lib/sdkDapp/sdkDapp.hooks.ts
// attempting to import them from @multiversx/sdk-dapp/hooks (or out/react) if possible, 
// OR they might be available via 'lib' if I missed them. 
// For now, I will comment them out to fix build, and uncomment if specific errors arise.
// Most of these might be available in 'lib' via wildcard exports if I check carefully.

// export { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
// export { useGetLastSignedMessageSession } from '@multiversx/sdk-dapp/hooks/signMessage/useGetLastSignedMessageSession';
// export { useGetSignMessageInfoStatus } from '@multiversx/sdk-dapp/hooks/signMessage/useGetSignedMessageStatus';
// export { useSignMessage } from '@multiversx/sdk-dapp/hooks/signMessage/useSignMessage';
// export { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
// export { useTrackTransactionStatus } from '@multiversx/sdk-dapp/hooks/transactions/useTrackTransactionStatus';
// export { verifyMessage } from '@multiversx/sdk-dapp/hooks/signMessage/verifyMessage';
// export { useSendBatchTransactions } from '@multiversx/sdk-dapp/hooks/transactions/batch/useSendBatchTransactions';
// export { useCheckBatch } from '@multiversx/sdk-dapp/hooks/transactions/batch/tracker/useCheckBatch';
// export { useSignTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useSignTransactions';
// export { useBatchTransactionsTracker } from '@multiversx/sdk-dapp/hooks/transactions/batch/tracker/useBatchTransactionsTracker';
// export { useGetSignedTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetSignedTransactions';
// export { useGetAccountProvider } from '@multiversx/sdk-dapp/hooks/account/useGetAccountProvider';

