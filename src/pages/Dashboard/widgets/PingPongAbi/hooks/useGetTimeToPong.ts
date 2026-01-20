import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { useGetAccount, useGetNetworkConfig } from 'hooks';
import { Address, AddressValue, SmartContractController } from '@multiversx/sdk-core';
import { contractAbi } from 'utils/smartContract';
import { contractAddress } from 'config';

export const useGetTimeToPong = () => {
  const { network } = useGetNetworkConfig();
  const { address } = useGetAccount();

  const apiUrl = network.apiAddress || 'https://devnet-api.multiversx.com';

  const contractAddr = new Address(contractAddress);
  const callerAddr = address ? new Address(address) : Address.Zero();

  const createSafeAddress = (addr: Address) => ({
    bech32: () => addr.toBech32(),
    toString: () => addr.toString(),
    toHex: () => addr.toHex(),
    toJSON: () => addr.toString()
  });

  const getTimeToPong = async () => {
    if (!address) return;
    try {
      const provider = new ProxyNetworkProvider(apiUrl);
      const controller = new SmartContractController({
        networkProvider: provider as any,
        abi: contractAbi,
        chainID: 'D'
      });

      // Manual Query Construction
      const safeQuery = {
        address: createSafeAddress(contractAddr),
        caller: createSafeAddress(callerAddr),
        func: { toString: () => 'getTimeToPong' },
        value: { toString: () => '0' },
        getEncodedArguments: () => {
          // Argument: Address of user.
          // We can use the simple encoding trick: Address objects (even shimmed ones) should not be used as encoded arg directly maybe?
          // Usually it's converting address to hex.
          // Let's assume User Address is valid.
          const userAddr = new Address(address);
          return [userAddr.toHex()];
        }
      };

      const response = await provider.queryContract(safeQuery as any);

      const shimmedResponse = {
        ...response,
        function: 'getTimeToPong',
        returnDataParts: (response.returnData || []).map(item => Buffer.from(item, 'base64'))
      };

      const parsed = controller.parseQueryResponse(shimmedResponse as any);

      const val = parsed[0]?.valueOf();
      const secondsRemaining: number = (val && typeof val.toNumber === 'function') ? val.toNumber() : Number(val || 0);
      return secondsRemaining;
    } catch (err) {
      console.error('Unable to call getTimeToPong', err);
    }
  };

  return getTimeToPong;
};
