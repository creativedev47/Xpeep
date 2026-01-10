import { Address, U64Value } from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { getChainId } from 'utils/getChainId';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { RouteNamesEnum } from 'localConstants';
import { useGetAccount } from 'hooks/sdkDappHooks';
import { useActivityLogger } from 'hooks/useActivityLogger';

export const useClaimWinnings = () => {
    const { address } = useGetAccount();
    const { logClaim } = useActivityLogger();

    return async (marketId: number) => {
        logClaim(marketId, 'Winnings', `Market #${marketId}`);
        const claimTransaction = smartContract.methodsExplicit
            .claimWinnings([new U64Value(marketId)])
            .withGasLimit(10000000)
            .withSender(new Address(address))
            .withChainID(getChainId())
            .buildTransaction();

        await refreshAccount();

        await sendTransactions({
            transactions: [claimTransaction],
            transactionsDisplayInfo: {
                processingMessage: 'Processing Claim transaction',
                errorMessage: 'An error has occurred during claim',
                successMessage: 'Winnings claimed! Enjoy your EGLD!'
            },
            redirectAfterSign: false,
            callbackRoute: RouteNamesEnum.dashboard
        });
    };
};
