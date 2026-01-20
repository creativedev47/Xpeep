// Use exports from lib
export { getTransactions, signTransactions, trimUsernameDomain } from 'lib';
export { Transaction as newTransaction } from 'lib';

import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { config } from '../initConfig';

// Wrapper to match expected signature
export const sendTransactions = async ({ transactions, transactionsDisplayInfo, redirectAfterSign, callbackRoute }: any) => {
    try {
        const provider = getAccountProvider();
        const signedTransactions = await provider.signTransactions(transactions);

        const apiAddress = config.dAppConfig?.network?.apiAddress || 'https://devnet-api.multiversx.com';
        const proxy = new ProxyNetworkProvider(apiAddress);

        const hashes = [];
        for (const tx of signedTransactions) {
            const hash = await proxy.sendTransaction(tx);
            hashes.push(hash);
            console.log('Transaction sent:', hash);
        }

        return { sessionId: Date.now().toString(), error: null, hashes };
    } catch (error) {
        console.error('Failed to send transactions via helper:', error);
        return { error };
    }
};

export const refreshAccount = async () => {
    console.log('refreshAccount called (stub)');
};

// Helper to get active provider is already imported as getAccountProvider
import { logout as sdkLogout } from '@multiversx/sdk-dapp/out/providers/DappProvider/helpers/logout/logout';

export const logout = async (callbackUrl?: string, onRedirect?: (callbackUrl: string) => void, shouldCallLogout?: boolean) => {
    try {
        const provider = getAccountProvider();
        await sdkLogout({ provider: provider as any });
    } catch (err) {
        console.error('Logout failed', err);
    }

    if (onRedirect && callbackUrl) {
        onRedirect(callbackUrl);
    } else {
        window.location.reload();
    }
};
