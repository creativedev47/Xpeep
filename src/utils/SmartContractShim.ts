import { Address, AbiRegistry } from 'lib/sdkCore';

export class SmartContract {
    address: Address;
    abi: AbiRegistry;
    methods: any;
    methodsExplicit: any;

    constructor(args: { address: Address; abi: AbiRegistry }) {
        this.address = args.address;
        this.abi = args.abi;

        // Proxy to handle any method call on methods/methodsExplicit
        const methodsProxy = new Proxy({}, {
            get: (target, prop) => {
                return (...args: any[]) => {
                    console.warn(`SmartContract.methods.${String(prop)} called (Shim)`, args);
                    return {
                        withValue: () => this.mockTransactionBuilder(),
                        withGasLimit: () => this.mockTransactionBuilder(),
                        withSender: () => this.mockTransactionBuilder(),
                        withProvider: () => this.mockTransactionBuilder(),
                        withChainID: () => this.mockTransactionBuilder(),
                        buildTransaction: () => {
                            console.warn('SmartContract Mock Transaction Built');
                            return {
                                getData: () => new Uint8Array(),
                                getReceiver: () => this.address,
                                getValue: () => 0,
                                getGasLimit: () => 0
                            };
                        }
                    };
                };
            }
        });

        this.methods = methodsProxy;
        this.methodsExplicit = methodsProxy;
    }

    private mockTransactionBuilder() {
        // Return same proxy-like structure to chain calls
        return {
            withValue: () => this.mockTransactionBuilder(),
            withGasLimit: () => this.mockTransactionBuilder(),
            withSender: () => this.mockTransactionBuilder(),
            withProvider: () => this.mockTransactionBuilder(),
            withChainID: () => this.mockTransactionBuilder(),
            buildTransaction: () => {
                console.warn('SmartContract Mock Transaction Built');
                return {
                    getData: () => new Uint8Array(),
                    getReceiver: () => this.address,
                    getValue: () => 0,
                    getGasLimit: () => 0
                };
            }
        };
    }

    createQuery(args: any) {
        console.warn('SmartContract.createQuery called (Shim)', args);
        // Ensure address has bech32 method
        const ensureAddress = (addr: any) => {
            if (addr && typeof addr.bech32 === 'function') return addr;
            return { bech32: () => String(addr) };
        };

        return {
            // Return mock query object
            contract: this.address,
            address: ensureAddress(this.address),
            func: args.func,
            function: args.func,
            arguments: args.args,
            getEncodedArguments: () => []
        };
    }

    getEndpoint(name: string) {
        console.warn('SmartContract.getEndpoint called (Shim)', name);
        return {
            name,
            modifiers: []
        };
    }
}

export class ResultsParser {
    parseQueryResponse(response: any, endpoint: any) {
        console.warn('ResultsParser.parseQueryResponse called (Shim)', { response, endpoint });
        return {
            firstValue: {
                valueOf: () => ({
                    toNumber: () => 0,
                    toString: () => '0'
                })
            }
        };
    }
}
