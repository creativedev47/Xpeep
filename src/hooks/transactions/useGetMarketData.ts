import {
    U64Value,
    U8Value,
    SmartContractController,
    Address
} from '@multiversx/sdk-core';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { contractAbi } from 'utils/smartContract';
import { contractAddress } from 'config';
import { useGetNetworkConfig, useGetAccount } from 'hooks/sdkDappHooks';

export const useGetMarketData = () => {
    const { network } = useGetNetworkConfig();
    const { address } = useGetAccount();

    // Debug Network Config
    const apiUrl = network.apiAddress || 'https://devnet-api.multiversx.com';
    // console.log('useGetMarketData: Using API URL:', apiUrl, 'Network Config:', network);

    // Construct address locally
    const contractAddr = new Address(contractAddress);
    const callerAddr = address ? new Address(address) : Address.Zero();

    // Helper: Create a 'Safe Address' object that satisfies ProxyNetworkProvider v2 expectations completely
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

    // Helper to execute query safely by bypassing Controller.runQuery which might have compatibility issues
    const runSafeQuery = async (controller: SmartContractController, funcName: string, args: any[] = []) => {
        const provider = new ProxyNetworkProvider(apiUrl);

        // 1. Use Controller ONLY to encode arguments (if needed)
        // We create a dummy query just to get encoded args if we can, or manually encode?
        // Actually, for getMarketCount it's empty.
        // For others, let's try to use the controller's internal logic if accessible, OR manually encode primitives.

        // Manual simple encoding for our specific use cases (U64, U8, Address)
        const encodedArgs: string[] = args.map(arg => {
            if (arg instanceof U64Value || arg instanceof U8Value) {
                // ValueOf returns BigInt or Number?
                let v = arg.valueOf();
                // U64Value.valueOf() returns BigNumber usually in SDK? Or native type?
                // Let's assume toString(16) works on the value.
                // Safest is to check types.
                if (typeof v === 'object' && v.toString) return v.toString(16); // BigNumber
                if (typeof v === 'bigint') return v.toString(16);
                if (typeof v === 'number') return v.toString(16);
                return '';
            }
            // AddressValue?
            // We can use a simpler approach: let the Controller create the query properly first, 
            // then extract what we need?
            return '';
        });

        // BETTER APPROACH: specific implementation per function to avoid generic mess
        return null;
    };

    const getMarket = async (marketId: number) => {
        try {
            const controller = getController();
            // We use createQuery to handle argument encoding for us
            const originalQuery = controller.createQuery({
                contract: contractAddr,
                function: 'getMarket',
                arguments: [new U64Value(marketId)],
                caller: callerAddr
            });

            // Construct the provider-compatible object MANUALLY
            // Extract encoded args from originalQuery if possible, usually available as .arguments (but they are typed values)
            // Wait, ProxyNetworkProvider calls .getEncodedArguments(). 
            // If originalQuery has it, use it.

            // Safe Query Object
            const safeQuery = {
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: { toString: () => 'getMarket' },
                value: { toString: () => '0' },
                getEncodedArguments: () => {
                    // v15 Query object usually has this method?
                    if (originalQuery && typeof (originalQuery as any).getEncodedArguments === 'function') {
                        return (originalQuery as any).getEncodedArguments();
                    }
                    // Fallback for U64Value
                    let hex = marketId.toString(16);
                    if (hex.length % 2 !== 0) hex = '0' + hex;
                    return [hex];
                }
            };

            // Direct Provider Call
            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQuery as any);

            // Shim response to match SmartContractController v15 expectations
            const shimmedResponse = {
                ...response,
                function: 'getMarket',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            return parsed[0]?.valueOf();
        } catch (err) {
            console.error('Unable to call getMarket', err);
        }
    };

    const getMarketCount = async () => {
        try {
            const controller = getController();

            // Manual Safe Query
            const safeQuery = {
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: { toString: () => 'getMarketCount' },
                value: { toString: () => '0' },
                getEncodedArguments: () => []
            };

            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQuery as any);

            // Shim response
            const shimmedResponse = {
                ...response,
                function: 'getMarketCount',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            // Handling optional number return cleanly
            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            const val = parsed[0]?.valueOf();
            return val?.toNumber ? val.toNumber() : (val ? Number(val) : 0);
        } catch (err) {
            console.error('Unable to call getMarketCount', err);
        }
    };

    const getOutcomeTotal = async (marketId: number, outcome: number) => {
        try {
            const controller = getController();
            const originalQuery = controller.createQuery({
                contract: contractAddr,
                function: 'getOutcomeTotal',
                arguments: [new U64Value(marketId), new U8Value(outcome)],
                caller: callerAddr
            });

            const safeQuery = {
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: { toString: () => 'getOutcomeTotal' },
                value: { toString: () => '0' },
                getEncodedArguments: () => {
                    if (originalQuery && typeof (originalQuery as any).getEncodedArguments === 'function') {
                        return (originalQuery as any).getEncodedArguments();
                    }
                    // Fallback manual encoding if needed
                    let hexId = marketId.toString(16);
                    if (hexId.length % 2 !== 0) hexId = '0' + hexId;
                    let hexOut = outcome.toString(16);
                    if (hexOut.length % 2 !== 0) hexOut = '0' + hexOut;
                    return [hexId, hexOut];
                }
            };

            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQuery as any);

            const shimmedResponse = {
                ...response,
                function: 'getOutcomeTotal',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            return parsed[0]?.valueOf()?.toString();
        } catch (err) {
            console.error('Unable to call getOutcomeTotal', err);
        }
    };

    const getParticipantCount = async (marketId: number) => {
        try {
            const controller = getController();
            const originalQuery = controller.createQuery({
                contract: contractAddr,
                function: 'getParticipantCount',
                arguments: [new U64Value(marketId)],
                caller: callerAddr
            });

            const safeQuery = {
                address: createSafeAddress(contractAddr),
                caller: createSafeAddress(callerAddr),
                func: { toString: () => 'getParticipantCount' },
                value: { toString: () => '0' },
                getEncodedArguments: () => {
                    if (originalQuery && typeof (originalQuery as any).getEncodedArguments === 'function') {
                        return (originalQuery as any).getEncodedArguments();
                    }
                    // Fallback
                    let hex = marketId.toString(16);
                    if (hex.length % 2 !== 0) hex = '0' + hex;
                    return [hex];
                }
            };

            const provider = new ProxyNetworkProvider(apiUrl);
            const response = await provider.queryContract(safeQuery as any);

            const shimmedResponse = {
                ...response,
                function: 'getParticipantCount',
                returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
            };

            const parsed = controller.parseQueryResponse(shimmedResponse as any);
            const val = parsed[0]?.valueOf();
            if (val && typeof val.toNumber === 'function') return val.toNumber();
            return Number(val || 0);
        } catch (err) {
            console.error('Unable to call getParticipantCount', err);
        }
    };

    return { getMarket, getMarketCount, getOutcomeTotal, getParticipantCount };
};
