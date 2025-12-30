import {
    Address,
    AddressValue,
    ResultsParser,
    U64Value,
    U8Value
} from '@multiversx/sdk-core';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { smartContract } from 'utils/smartContract';
import { useGetNetworkConfig, useGetAccount } from 'hooks/sdkDappHooks';

const resultsParser = new ResultsParser();

export const useGetUserBets = () => {
    const { network } = useGetNetworkConfig();
    const { address } = useGetAccount();

    const getUserBetOutcome = async (marketId: number) => {
        if (!address) return null;
        try {
            const query = smartContract.createQuery({
                func: 'getUserBetOutcome',
                args: [new U64Value(marketId), new AddressValue(new Address(address))]
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getUserBetOutcome');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf()?.toNumber();
        } catch (err) {
            console.error('Unable to call getUserBetOutcome', err);
            return 0;
        }
    };

    const getUserBetAmount = async (marketId: number, outcome: number) => {
        if (!address) return null;
        try {
            const query = smartContract.createQuery({
                func: 'getUserBetAmount',
                args: [new U64Value(marketId), new AddressValue(new Address(address)), new U8Value(outcome)]
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getUserBetAmount');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf()?.toString();
        } catch (err) {
            console.error('Unable to call getUserBetAmount', err);
            return '0';
        }
    };

    return { getUserBetOutcome, getUserBetAmount };
};
