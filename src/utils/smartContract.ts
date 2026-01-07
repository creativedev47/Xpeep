import { contractAddress } from 'config';
import json from 'contracts/xpeep.abi.json';
import { AbiRegistry, Address, SmartContract } from './sdkDappCore';

const abi = AbiRegistry.create(json);

// Initialize Smart Contract with ABI and correct address
export const smartContract = new SmartContract({
  address: new Address(contractAddress),
  abi
});

