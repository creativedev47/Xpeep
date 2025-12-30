import { Address, BytesValue, U64Value } from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { getChainId } from 'utils/getChainId';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { RouteNamesEnum } from 'localConstants';
import { useGetAccount } from 'hooks/sdkDappHooks';
import { supabase } from 'utils/supabase';
import { useGetMarketData } from './useGetMarketData';

export const useCreateMarket = () => {
    const { address } = useGetAccount();
    const { getMarketCount } = useGetMarketData();

    const sendCreateMarket = async ({ description, endTime, category }: { description: string, endTime: number, category?: string }) => {
        // 1. Predict next market ID
        const currentCount = await getMarketCount();
        const nextId = (currentCount || 0) + 1;

        // 2. Save metadata to Supabase first (or after, but first is safer for UI consistency)
        if (category) {
            try {
                await supabase
                    .from('markets_metadata')
                    .upsert({
                        market_id: nextId,
                        category,
                        long_description: description
                    });
            } catch (err) {
                console.error('Failed to save market metadata to Supabase', err);
            }
        }

        const createMarketTransaction = smartContract.methodsExplicit
            .createMarket([BytesValue.fromUTF8(description), new U64Value(endTime)])
            .withGasLimit(20000000)
            .withSender(new Address(address))
            .withChainID(getChainId())
            .buildTransaction();

        await refreshAccount();

        await sendTransactions({
            transactions: [createMarketTransaction],
            transactionsDisplayInfo: {
                processingMessage: 'Creating new market...',
                errorMessage: 'An error has occurred during market creation',
                successMessage: 'Market created successfully! Let the peeping begin!'
            },
            redirectAfterSign: false,
            callbackRoute: RouteNamesEnum.dashboard
        });
    };

    return { sendCreateMarket };
};
