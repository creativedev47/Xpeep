import { contractAddress } from 'config';
import json from 'contracts/xpeep.abi.json';
import { AbiRegistry, Address, Transaction, TokenTransfer } from '@multiversx/sdk-core';

const abi = AbiRegistry.create(json);

// Helper to encode values to hex
const toHex = (val: any): string => {
  if (val?.toHex) return val.toHex(); // Custom types like Address?
  if (val?.toString) {
    const v = val.valueOf();
    if (typeof v === 'number' || typeof v === 'bigint') {
      let hex = v.toString(16);
      if (hex.length % 2 !== 0) hex = '0' + hex;
      return hex;
    }
    if (typeof v === 'string') {
      return Buffer.from(v).toString('hex');
    }
  }
  return '';
};

// Robust SmartContract implementation that builds REAL Transactions
export class SmartContract {
  address: Address;
  abi: AbiRegistry;

  constructor(args: { address: Address; abi: AbiRegistry }) {
    this.address = args.address;
    this.abi = args.abi;
  }

  // Use 'any' to allow dynamic method names
  get methods(): any {
    return new Proxy({}, {
      get: (_, funcName: string) => (...args: any[]) => {
        return new TransactionBuilder(this.address, funcName, args);
      }
    });
  }

  get methodsExplicit() { return this.methods; }
}

class TransactionBuilder {
  contract: Address;
  func: string;
  args: any[];
  gasLimit: bigint = BigInt(0);
  value: bigint = BigInt(0);
  sender: Address | null = null;
  chainID: string = 'D';

  constructor(contract: Address, func: string, args: any[]) {
    this.contract = contract;
    this.func = func;
    this.args = args;
  }

  withGasLimit(limit: number) { this.gasLimit = BigInt(limit); return this; }
  withSender(sender: Address) { this.sender = sender; return this; }
  withChainID(id: string) { this.chainID = id; return this; }
  withValue(val: any) {
    // Handle TokenTransfer or BigInt
    if (val instanceof TokenTransfer) {
      this.value = val.amount;
    } else {
      this.value = BigInt(val);
    }
    return this;
  }

  buildTransaction() {
    // Encode data: func@arg1@arg2...
    const encodedArgs = this.args.map(arg => {
      if (arg instanceof Address) return arg.toHex();
      if (arg?.toHex && typeof arg.toHex === 'function') return arg.toHex();

      let val = arg;
      if (arg && typeof arg.valueOf === 'function' && arg !== arg.valueOf()) {
        val = arg.valueOf();
      }

      // Handle BigInt/Number
      if (typeof val === 'number' || typeof val === 'bigint') {
        let s = val.toString(16);
        if (s.length % 2 !== 0) s = '0' + s;
        return s;
      }

      // Handle SDK Types that return BigNumber or have toString
      if (typeof val === 'object' && val !== null) {
        // If it has toString(16), use it (BigNumber)
        if (typeof val.toString === 'function') {
          // Try hex first if it accepts base
          try {
            const hex = val.toString(16);
            if (hex && hex !== '[object Object]') {
              let s = hex;
              if (s.length % 2 !== 0) s = '0' + s;
              return s;
            }
          } catch (e) { }

          // Fallback to normal toString and convert? 
          // For BytesValue, toString() might return utf8 string?
          // BytesValue usually has .hex() or similar in some versions, but let's assume Buffer behavior if it is one.
        }
      }

      if (typeof val === 'string') {
        return Buffer.from(val).toString('hex');
      }

      // AddressValue wrapper check
      if (arg?.value && arg.value instanceof Address) {
        return arg.value.toHex();
      }

      // Fallback for BytesValue/Buffers that might be passed as is?
      if (Buffer.isBuffer(val)) {
        return val.toString('hex');
      }

      return '';
    });

    const dataString = [this.func, ...encodedArgs].join('@');

    if (!this.sender) throw new Error("Sender address is required for transaction building");

    return new Transaction({
      data: new Uint8Array(Buffer.from(dataString)),
      gasLimit: this.gasLimit,
      receiver: this.contract,
      sender: this.sender,
      value: this.value,
      chainID: this.chainID
    });
  }
}

// Initialize Custom Smart Contract
const smartContractInstance = new SmartContract({
  address: new Address(contractAddress),
  abi
});

export const smartContract = smartContractInstance;
export const contractAbi = abi;
export const contractAddressInstance = new Address(contractAddress);

