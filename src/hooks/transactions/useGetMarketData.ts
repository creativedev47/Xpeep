import {
    Address,
    AddressValue,
    ResultsParser,
    U64Value,
    U8Value
} from '@multiversx/sdk-core';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { smartContract } from 'utils/smartContract';
import { useGetNetworkConfig } from 'hooks/sdkDappHooks';

const resultsParser = new ResultsParser();

export const useGetMarketData = () => {
    const { network } = useGetNetworkConfig();

    const getMarket = async (marketId: number) => {
        try {
            const query = smartContract.createQuery({
                func: 'getMarket',
                args: [new U64Value(marketId)]
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getMarket');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf();
        } catch (err) {
            console.error('Unable to call getMarket', err);
        }
    };

    const getMarketCount = async () => {
        try {
            const query = smartContract.createQuery({
                func: 'getMarketCount',
                args: []
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getMarketCount');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf()?.toNumber();
        } catch (err) {
            console.error('Unable to call getMarketCount', err);
        }
    };

    const getOutcomeTotal = async (marketId: number, outcome: number) => {
        try {
            const query = smartContract.createQuery({
                func: 'getOutcomeTotal',
                args: [new U64Value(marketId), new U8Value(outcome)]
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getOutcomeTotal');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf()?.toString();
        } catch (err) {
            console.error('Unable to call getOutcomeTotal', err);
        }
    };

    const getParticipantCount = async (marketId: number) => {
        try {
            const query = smartContract.createQuery({
                func: 'getParticipantCount',
                args: [new U64Value(marketId)]
            });
            const provider = new ProxyNetworkProvider(network.apiAddress);
            const queryResponse = await provider.queryContract(query);
            const endpointDefinition = smartContract.getEndpoint('getParticipantCount');
            const { firstValue } = resultsParser.parseQueryResponse(
                queryResponse,
                endpointDefinition
            );
            return firstValue?.valueOf()?.toNumber();
        } catch (err) {
            console.error('Unable to call getParticipantCount', err);
        }
    };

    return { getMarket, getMarketCount, getOutcomeTotal, getParticipantCount };
};
