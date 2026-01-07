
import { Address } from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { useGetAccount } from 'hooks/sdkDappHooks';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { getChainId } from 'utils/getChainId';
import { RouteNamesEnum } from 'localConstants';
import { supabase } from 'utils/supabase';

export const useResetSystem = () => {
    const { address } = useGetAccount();

    return async () => {
        // 1. Wipe Supabase (Frontend Visibility)
        try {
            await supabase.from('markets_metadata').delete().neq('market_id', -1); // Delete all
            await supabase.from('user_bets').delete().neq('market_id', -1); // Delete all bets
            console.log('Supabase wipe complete');
        } catch (err) {
            console.error('Failed to wipe Supabase', err);
        }

        // 2. Reset Smart Contract (System State)
        const resetTransaction = smartContract.methodsExplicit
            .resetAll()
            .withGasLimit(20000000) // Higher gas limit for loop
            .withSender(new Address(address))
            .withChainID(getChainId())
            .buildTransaction();

        await refreshAccount();

        await sendTransactions({
            transactions: [resetTransaction],
            transactionsDisplayInfo: {
                processingMessage: 'Initiating System Factory Reset... ⚠️',
                errorMessage: 'System reset failed',
                successMessage: 'System successfully reset! Fresh start.'
            },
            redirectAfterSign: false,
            callbackRoute: RouteNamesEnum.admin // Stay on admin page
        });
    };
};
