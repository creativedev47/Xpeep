import {
    Address,
    U64Value,
    U8Value
} from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { useGetAccount } from 'hooks/sdkDappHooks';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { getChainId } from 'utils/getChainId';
import { RouteNamesEnum } from 'localConstants';

import { supabase } from 'utils/supabase';

export const useResolveMarket = () => {
    const { address } = useGetAccount();

    return async (marketId: number, winningOutcome: number) => {
        // Save resolution to Supabase
        try {
            await supabase
                .from('markets_metadata')
                .upsert({
                    market_id: marketId,
                    status: 'Resolved',
                    winning_outcome: winningOutcome,
                    resolved_by: address,
                    resolved_at: new Date().toISOString()
                });
        } catch (err) {
            console.error('Failed to update resolution in Supabase', err);
        }

        const resolveTransaction = smartContract.methodsExplicit
            .resolveMarket([new U64Value(marketId), new U8Value(winningOutcome)])
            .withGasLimit(10000000)
            .withSender(new Address(address))
            .withChainID(getChainId())
            .buildTransaction();

        await refreshAccount();

        await sendTransactions({
            transactions: [resolveTransaction],
            transactionsDisplayInfo: {
                processingMessage: 'Processing Market Resolution',
                errorMessage: 'An error has occurred during resolution',
                successMessage: 'Market resolved successfully!'
            },
            redirectAfterSign: false,
            callbackRoute: RouteNamesEnum.markets
        });
    };
};
