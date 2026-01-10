
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
            // Delete all rows from Supabase tables
            await supabase.from('markets_metadata').delete().neq('id', 0); // Delete all
            await supabase.from('user_peeps').delete().neq('user_address', '0'); // Delete all
            await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            // Note: Profiles are kept to preserve user history/settings if desired, or can be wiped too.
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
