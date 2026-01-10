import { Address, TokenTransfer, U64Value, U8Value } from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { getChainId } from 'utils/getChainId';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { RouteNamesEnum } from 'localConstants';
import { useGetAccount } from 'hooks/sdkDappHooks';

import { supabase } from 'utils/supabase';
import { useActivityLogger } from 'hooks/useActivityLogger';

export const usePlaceBet = () => {
    const { address } = useGetAccount();
    const { logPeep, ensureProfileExists } = useActivityLogger();

    return async (marketId: number, outcome: number, amount: string) => {
        // Save bet to Supabase
        try {
            if (address) {
                // Ensure user profile exists first to avoid FK violation
                await ensureProfileExists();

                await supabase.from('user_peeps').insert({
                    user_address: address,
                    market_id: marketId,
                    outcome,
                    amount
                });
            }
        } catch (err) {
            console.error('Failed to save bet to Supabase', err);
        }

        // Log Activity
        logPeep(marketId, amount, outcome === 1 ? 'YES' : 'NO', `Market #${marketId}`);

        const placeBetTransaction = smartContract.methodsExplicit
            .placeBet([new U64Value(marketId), new U8Value(outcome)])
            .withValue(TokenTransfer.egldFromAmount(amount))
            .withGasLimit(10000000)
            .withSender(new Address(address))
            .withChainID(getChainId())
            .buildTransaction();

        await refreshAccount();

        await sendTransactions({
            transactions: [placeBetTransaction],
            transactionsDisplayInfo: {
                processingMessage: 'Processing via Supernova Protocol... ⚡',
                errorMessage: 'An error has occurred during peeping',
                successMessage: 'Peep placed successfully! Peep the future!'
            },
            redirectAfterSign: false,
            callbackRoute: RouteNamesEnum.dashboard
        });
    };
};
