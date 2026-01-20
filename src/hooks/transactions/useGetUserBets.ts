import {
    Address,
    AddressValue,
    U64Value,
    U8Value,
    SmartContractController
} from '@multiversx/sdk-core';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { contractAbi } from 'utils/smartContract';
import { contractAddress } from 'config';
import { useGetNetworkConfig, useGetAccount } from 'hooks/sdkDappHooks';

export const useGetUserBets = () => {
    const { network } = useGetNetworkConfig();
    const { address } = useGetAccount();

    const apiUrl = network.apiAddress || 'https://devnet-api.multiversx.com';
    // console.log('useGetUserBets: Using API URL:', apiUrl);

    const contractAddr = new Address(contractAddress);
    const callerAddr = address ? new Address(address) : Address.Zero();

    // Helper: Create a 'Safe Address' object
    const createSafeAddress = (addr: Address) => ({
        bech32: () => addr.toBech32(),
        toString: () => addr.toString(),
        toHex: () => addr.toHex(),
        toJSON: () => addr.toString()
    });

    const getController = () => {
        const provider = new ProxyNetworkProvider(apiUrl);
        return new SmartContractController({
            networkProvider: provider as any,
            abi: contractAbi,
            chainID: 'D'
        });
    };

    const getUserBetOutcome = async (marketId: number) => {
        if (!address) return null;
        try {
            const controller = getController();
            const originalQuery = controller.createQuery({
                contract: contractAddr,
                function: 'getUserBetOutcome',
                arguments: [new U64Value(marketId), new AddressValue(new Address(address))],
                caller: callerAddr
            });

            const safeQueryFinal = {
                ...originalQuery,
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: originalQuery.function ? { toString: () => originalQuery.function } : { toString: () => 'getUserBetOutcome' },
                value: { toString: () => '0' },
                getEncodedArguments: () => {
                    const marketIdHex = marketId.toString(16).padStart(16, '0');
                    const addressHex = new Address(address).toHex();
                    return [marketIdHex, addressHex];
                }
            };

            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQueryFinal as any);

            const shimmedResponse = {
                ...response,
                function: 'getUserBetOutcome',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            const val = parsed[0]?.valueOf();
            if (val && typeof val.toNumber === 'function') return val.toNumber();
            return Number(val || 0);
        } catch (err) {
            console.error('Unable to call getUserBetOutcome', err);
            return 0;
        }
    };

    const getUserBetAmount = async (marketId: number, outcome: number) => {
        if (!address) return null;
        try {
            const controller = getController();
            const originalQuery = controller.createQuery({
                contract: contractAddr,
                function: 'getUserBetAmount',
                arguments: [new U64Value(marketId), new AddressValue(new Address(address)), new U8Value(outcome)],
                caller: callerAddr
            });

            const safeQueryFinal = {
                ...originalQuery,
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: originalQuery.function ? { toString: () => originalQuery.function } : { toString: () => 'getUserBetAmount' },
                value: { toString: () => '0' },
                getEncodedArguments: () => {
                    const marketIdHex = marketId.toString(16).padStart(16, '0');
                    const addressHex = new Address(address).toHex();
                    const outcomeHex = outcome.toString(16).padStart(2, '0');
                    return [marketIdHex, addressHex, outcomeHex];
                }
            };

            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQueryFinal as any);

            const shimmedResponse = {
                ...response,
                function: 'getUserBetAmount',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            return parsed[0]?.valueOf()?.toString();
        } catch (err) {
            console.error('Unable to call getUserBetAmount', err);
            return '0';
        }
    };

    return { getUserBetOutcome, getUserBetAmount };
};
