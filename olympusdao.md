### Bond price


```javascript

try {
      // TODO (appleseed): improve this logic
      if (bond.name === "cvx") {
        let bondPriceRaw = await bondContract.bondPrice();
        let assetPriceUSD = await bond.getBondReservePrice(networkID, provider);
        let assetPriceBN = ethers.utils.parseUnits(assetPriceUSD.toString(), 14);
        // bondPriceRaw has 4 extra decimals, so add 14 to assetPrice, for 18 total
        bondPrice = bondPriceRaw.mul(assetPriceBN);
      } else {
        bondPrice = await bondContract.bondPriceInUSD();
      }
      bondDiscount = (marketPrice * Math.pow(10, 18) - Number(bondPrice.toString())) / Number(bondPrice.toString()); // 1 - bondPrice / (bondPrice * Math.pow(10, 9));
    } catch (e) {
      console.log("error getting bondPriceInUSD", bond.name, e);
    }

    if (Number(value) === 0) {
      // if inputValue is 0 avoid the bondQuote calls
      bondQuote = BigNumber.from(0);
    } else if (bond.isLP) {
      valuation = Number(
        (await bondCalcContract.valuation(bond.getAddressForReserve(networkID) || "", amountInWei)).toString(),
      );
      bondQuote = await bondContract.payoutFor(valuation);
      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 9);
      }
    } else {
      // RFV = DAI
      bondQuote = await bondContract.payoutFor(amountInWei);

      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000000000000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 18);
      }
    }

    // Display error if user tries to exceed maximum.
    if (!!value && parseFloat(bondQuote.toString()) > Number(maxBondPrice.toString()) / Math.pow(10, 9)) {
      const errorString =
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
        (Number(maxBondPrice.toString()) / Math.pow(10, 9)).toFixed(2).toString() +
        " OHM.";
      dispatch(error(errorString));
    }

    // Calculate bonds purchased
    let purchased = await bond.getTreasuryBalance(networkID, provider);

    return {
      bond: bond.name,
      bondDiscount,
      debtRatio: Number(debtRatio.toString()),
      bondQuote: Number(bondQuote.toString()),
      purchased,
      vestingTerm: Number(terms.vestingTerm.toString()),
      maxBondPrice: Number(maxBondPrice.toString()) / Math.pow(10, 9),
      bondPrice: Number(bondPrice.toString()) / Math.pow(10, 18),
      marketPrice: marketPrice,
    };
  },
  
 ```
 
#### 1-1 bond.ts

```javascript

  async getBondReservePrice(networkID: NetworkID, provider: StaticJsonRpcProvider | JsonRpcSigner) {
    let marketPrice: number;
    if (this.isLP) {
      const pairContract = this.getContractForReserve(networkID, provider);
      const reserves = await pairContract.getReserves();
      marketPrice = Number(reserves[1].toString()) / Number(reserves[0].toString()) / 10 ** 9;
    } else {
      marketPrice = await getTokenPrice("convex-finance");
    }
    return marketPrice;
  }
```

1. getTokenPrice helpers/index.ts

```javascript

export async function getTokenPrice(tokenId = "olympus") {
  let resp;
  try {
    resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
    return resp.data[tokenId].usd;
  } catch (e) {
    // console.log("coingecko api error: ", e);
  }
}
```

2.  getContractForReserve src/lib/bond.ts

```javascript

  getContractForReserve(networkID: NetworkID, provider: StaticJsonRpcProvider | JsonRpcSigner) {
    const bondAddress = this.getAddressForReserve(networkID) || "";
    return new ethers.Contract(bondAddress, this.reserveContract, provider) as PairContract;
  }
  
  
  abstract reserveContract: ethers.ContractInterface; // Token ABI
  
  ````
  
 2-1. ethers.Contract @ethersproject/contract/src.ts

```javascript

export class Contract extends BaseContract {
    // The meta-class properties
    readonly [ key: string ]: ContractFunction | any;
}


export class BaseContract {
    readonly address: string;
    readonly interface: Interface;

    readonly signer: Signer;
    readonly provider: Provider;

    readonly functions: { [ name: string ]: ContractFunction };

    readonly callStatic: { [ name: string ]: ContractFunction };
    readonly estimateGas: { [ name: string ]: ContractFunction<BigNumber> };
    readonly populateTransaction: { [ name: string ]: ContractFunction<PopulatedTransaction> };

    readonly filters: { [ name: string ]: (...args: Array<any>) => EventFilter };

    // This will always be an address. This will only differ from
    // address if an ENS name was used in the constructor
    readonly resolvedAddress: Promise<string>;

    // This is only set if the contract was created with a call to deploy
    readonly deployTransaction: TransactionResponse;

    _deployedPromise: Promise<Contract>;

    // A list of RunningEvents to track listeners for each event tag
    _runningEvents: { [ eventTag: string ]: RunningEvent };

    // Wrapped functions to call emit and allow deregistration from the provider
    _wrappedEmits: { [ eventTag: string ]: (...args: Array<any>) => void };

    constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider?: Signer | Provider) {
        logger.checkNew(new.target, Contract);

        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        defineReadOnly(this, "interface", getStatic<InterfaceFunc>(new.target, "getInterface")(contractInterface));

        if (signerOrProvider == null) {
            defineReadOnly(this, "provider", null);
            defineReadOnly(this, "signer", null);
        } else if (Signer.isSigner(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider.provider || null);
            defineReadOnly(this, "signer", signerOrProvider);
        } else if (Provider.isProvider(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider);
            defineReadOnly(this, "signer", null);
        } else {
            logger.throwArgumentError("invalid signer or provider", "signerOrProvider", signerOrProvider);
        }

        defineReadOnly(this, "callStatic", { });
        defineReadOnly(this, "estimateGas", { });
        defineReadOnly(this, "functions", { });
        defineReadOnly(this, "populateTransaction", { });

        defineReadOnly(this, "filters", { });

        {
            const uniqueFilters: { [ name: string ]: Array<string> } = { };
            Object.keys(this.interface.events).forEach((eventSignature) => {
                const event = this.interface.events[eventSignature];
                defineReadOnly(this.filters, eventSignature, (...args: Array<any>) => {
                    return {
                        address: this.address,
                        topics: this.interface.encodeFilterTopics(event, args)
                   }
                });
                if (!uniqueFilters[event.name]) { uniqueFilters[event.name] = [ ]; }
                uniqueFilters[event.name].push(eventSignature);
            });

            Object.keys(uniqueFilters).forEach((name) => {
                const filters = uniqueFilters[name];
                if (filters.length === 1) {
                    defineReadOnly(this.filters, name, this.filters[filters[0]]);
                } else {
                    logger.warn(`Duplicate definition of ${ name } (${ filters.join(", ")})`);
                }
            });
        }

        defineReadOnly(this, "_runningEvents", { });
        defineReadOnly(this, "_wrappedEmits", { });

        if (addressOrName == null) {
            logger.throwArgumentError("invalid contract address or ENS name", "addressOrName", addressOrName);
        }

        defineReadOnly(this, "address", addressOrName);
        if (this.provider) {
            defineReadOnly(this, "resolvedAddress", resolveName(this.provider, addressOrName));
        } else {
            try {
                defineReadOnly(this, "resolvedAddress", Promise.resolve(getAddress(addressOrName)));
            } catch (error) {
                // Without a provider, we cannot use ENS names
                logger.throwError("provider is required to use ENS name as contract address", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "new Contract"
                });
            }
        }

        const uniqueNames: { [ name: string ]: Array<string> } = { };
        const uniqueSignatures: { [ signature: string ]: boolean } = { };
        Object.keys(this.interface.functions).forEach((signature) => {
            const fragment = this.interface.functions[signature];

            // Check that the signature is unique; if not the ABI generation has
            // not been cleaned or may be incorrectly generated
            if (uniqueSignatures[signature]) {
                logger.warn(`Duplicate ABI entry for ${ JSON.stringify(signature) }`);
                return;
            }
            uniqueSignatures[signature] = true;

            // Track unique names; we only expose bare named functions if they
            // are ambiguous
            {
                const name = fragment.name;
                if (!uniqueNames[`%${ name }`]) { uniqueNames[`%${ name }`] = [ ]; }
                uniqueNames[`%${ name }`].push(signature);
            }

            if ((<Contract>this)[signature] == null) {
                defineReadOnly<any, any>(this, signature, buildDefault(this, fragment, true));
            }

            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (this.functions[signature] == null) {
                defineReadOnly(this.functions, signature, buildDefault(this, fragment, false));
            }

            if (this.callStatic[signature] == null) {
                defineReadOnly(this.callStatic, signature, buildCall(this, fragment, true));
            }

            if (this.populateTransaction[signature] == null) {
                defineReadOnly(this.populateTransaction, signature, buildPopulate(this, fragment));
            }

            if (this.estimateGas[signature] == null) {
                defineReadOnly(this.estimateGas, signature, buildEstimate(this, fragment));
            }
        });

        Object.keys(uniqueNames).forEach((name) => {
            // Ambiguous names to not get attached as bare names
            const signatures = uniqueNames[name];
            if (signatures.length > 1) { return; }

            // Strip off the leading "%" used for prototype protection
            name = name.substring(1);

            const signature = signatures[0];

            // If overwriting a member property that is null, swallow the error
            try {
                if ((<Contract>this)[name] == null) {
                    defineReadOnly(<Contract>this, name, (<Contract>this)[signature]);
                }
            } catch (e) { }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, this.functions[signature]);
            }

            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, this.callStatic[signature]);
            }

            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, this.populateTransaction[signature]);
            }

            if (this.estimateGas[name] == null) {
                defineReadOnly(this.estimateGas, name, this.estimateGas[signature]);
            }
        });
    }

    static getContractAddress(transaction: { from: string, nonce: BigNumberish }): string {
        return getContractAddress(transaction);
    }

    static getInterface(contractInterface: ContractInterface): Interface {
        if (Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new Interface(contractInterface);
    }

    // @TODO: Allow timeout?
    deployed(): Promise<Contract> {
        return this._deployed();
    }

    _deployed(blockTag?: BlockTag): Promise<Contract> {
        if (!this._deployedPromise) {

            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(() => {
                    return this;
                });

            } else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode

                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address, blockTag).then((code) => {
                    if (code === "0x") {
                        logger.throwError("contract not deployed", Logger.errors.UNSUPPORTED_OPERATION, {
                            contractAddress: this.address,
                            operation: "getDeployed"
                        });
                    }
                    return this;
                });
            }
        }

        return this._deployedPromise;
    }

    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>

    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>

    fallback(overrides?: TransactionRequest): Promise<TransactionResponse> {
        if (!this.signer) {
            logger.throwError("sending a transactions require a signer", Logger.errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" })
        }

        const tx: Deferrable<TransactionRequest> = shallowCopy(overrides || {});

        ["from", "to"].forEach(function(key) {
            if ((<any>tx)[key] == null) { return; }
            logger.throwError("cannot override " + key, Logger.errors.UNSUPPORTED_OPERATION, { operation: key })
        });

        tx.to = this.resolvedAddress;
        return this.deployed().then(() => {
            return this.signer.sendTransaction(tx);
        });
    }

    // Reconnect to a different signer or provider
    connect(signerOrProvider: Signer | Provider | string): Contract {
        if (typeof(signerOrProvider) === "string") {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }

        const contract = new (<{ new(...args: any[]): Contract }>(this.constructor))(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            defineReadOnly(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    }

    // Re-attach to a different on-chain instance of this contract
    attach(addressOrName: string): Contract {
        return new (<{ new(...args: any[]): Contract }>(this.constructor))(addressOrName, this.interface, this.signer || this.provider);
    }

    static isIndexed(value: any): value is Indexed {
        return Indexed.isIndexed(value);
    }

    private _normalizeRunningEvent(runningEvent: RunningEvent): RunningEvent {
        // Already have an instance of this event running; we can re-use it
        if (this._runningEvents[runningEvent.tag]) {
            return this._runningEvents[runningEvent.tag];
         }
         return runningEvent
    }

    private _getRunningEvent(eventName: EventFilter | string): RunningEvent {
        if (typeof(eventName) === "string") {

            // Listen for "error" events (if your contract has an error event, include
            // the full signature to bypass this special event keyword)
            if (eventName === "error") {
                return this._normalizeRunningEvent(new ErrorRunningEvent());
            }

            // Listen for any event that is registered
            if (eventName === "event") {
                return this._normalizeRunningEvent(new RunningEvent("event", null));
            }

            // Listen for any event
            if (eventName === "*") {
                return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
            }

            // Get the event Fragment (throws if ambiguous/unknown event)
            const fragment = this.interface.getEvent(eventName)
            return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
        }

        // We have topics to filter by...
        if (eventName.topics && eventName.topics.length > 0) {

            // Is it a known topichash? (throws if no matching topichash)
            try {
                const topic = eventName.topics[0];
                if (typeof(topic) !== "string") {
                    throw new Error("invalid topic"); // @TODO: May happen for anonymous events
                }
                const fragment = this.interface.getEvent(topic);
                return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment, eventName.topics));
            } catch (error) { }

            // Filter by the unknown topichash
            const filter: EventFilter = {
                address: this.address,
                topics: eventName.topics
            }

            return this._normalizeRunningEvent(new RunningEvent(getEventTag(filter), filter));
        }

        return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
    }

    _checkRunningEvents(runningEvent: RunningEvent): void {
        if (runningEvent.listenerCount() === 0) {
            delete this._runningEvents[runningEvent.tag];

            // If we have a poller for this, remove it
            const emit = this._wrappedEmits[runningEvent.tag];
            if (emit && runningEvent.filter) {
                this.provider.off(runningEvent.filter, emit);
                delete this._wrappedEmits[runningEvent.tag];
            }
        }
    }

    // Subclasses can override this to gracefully recover
    // from parse errors if they wish
    _wrapEvent(runningEvent: RunningEvent, log: Log, listener: Listener): Event {
        const event = <Event>deepCopy(log);

        event.removeListener = () => {
            if (!listener) { return; }
            runningEvent.removeListener(listener);
            this._checkRunningEvents(runningEvent);
        };

        event.getBlock = () => { return this.provider.getBlock(log.blockHash); }
        event.getTransaction = () => { return this.provider.getTransaction(log.transactionHash); }
        event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); }

        // This may throw if the topics and data mismatch the signature
        runningEvent.prepareEvent(event);

        return event;
    }

    private _addEventListener(runningEvent: RunningEvent, listener: Listener, once: boolean): void {
        if (!this.provider) {
            logger.throwError("events require a provider or a signer with a provider", Logger.errors.UNSUPPORTED_OPERATION, { operation: "once" })
        }

        runningEvent.addListener(listener, once);

        // Track this running event and its listeners (may already be there; but no hard in updating)
        this._runningEvents[runningEvent.tag] = runningEvent;

        // If we are not polling the provider, start polling
        if (!this._wrappedEmits[runningEvent.tag]) {
            const wrappedEmit = (log: Log) => {
                let event = this._wrapEvent(runningEvent, log, listener);

                // Try to emit the result for the parameterized event...
                if (event.decodeError == null) {
                    try {
                        const args = runningEvent.getEmit(event);
                        this.emit(runningEvent.filter, ...args);
                    } catch (error) {
                        event.decodeError = error.error;
                    }
                }

                // Always emit "event" for fragment-base events
                if (runningEvent.filter != null) {
                    this.emit("event", event);
                }

                // Emit "error" if there was an error
                if (event.decodeError != null) {
                    this.emit("error", event.decodeError, event);
                }
            };
            this._wrappedEmits[runningEvent.tag] = wrappedEmit;

            // Special events, like "error" do not have a filter
            if (runningEvent.filter != null) {
                this.provider.on(runningEvent.filter, wrappedEmit);
            }
        }
    }

    queryFilter(event: EventFilter, fromBlockOrBlockhash?: BlockTag | string, toBlock?: BlockTag): Promise<Array<Event>> {
        const runningEvent = this._getRunningEvent(event);
        const filter = shallowCopy(runningEvent.filter);

        if (typeof(fromBlockOrBlockhash) === "string" && isHexString(fromBlockOrBlockhash, 32)) {
            if (toBlock != null) {
                logger.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", toBlock);
            }
            (<FilterByBlockHash>filter).blockHash = fromBlockOrBlockhash;
        } else {
             (<Filter>filter).fromBlock = ((fromBlockOrBlockhash != null) ? fromBlockOrBlockhash: 0);
             (<Filter>filter).toBlock = ((toBlock != null) ? toBlock: "latest");
        }

        return this.provider.getLogs(filter).then((logs) => {
            return logs.map((log) => this._wrapEvent(runningEvent, log, null));
        });
    }

    on(event: EventFilter | string, listener: Listener): this {
        this._addEventListener(this._getRunningEvent(event), listener, false);
        return this;
    }

    once(event: EventFilter | string, listener: Listener): this {
        this._addEventListener(this._getRunningEvent(event), listener, true);
        return this;
    }

    emit(eventName: EventFilter | string, ...args: Array<any>): boolean {
        if (!this.provider) { return false; }

        const runningEvent = this._getRunningEvent(eventName);
        const result = (runningEvent.run(args) > 0);

        // May have drained all the "once" events; check for living events
        this._checkRunningEvents(runningEvent);

        return result;
    }

    listenerCount(eventName?: EventFilter | string): number {
        if (!this.provider) { return 0; }
        if (eventName == null) {
            return Object.keys(this._runningEvents).reduce((accum, key) => {
                return accum + this._runningEvents[key].listenerCount();
            }, 0);
        }
        return this._getRunningEvent(eventName).listenerCount();
    }

    listeners(eventName?: EventFilter | string): Array<Listener> {
        if (!this.provider) { return []; }

        if (eventName == null) {
            const result: Array<Listener> = [ ];
            for (let tag in this._runningEvents) {
                this._runningEvents[tag].listeners().forEach((listener) => {
                    result.push(listener)
                });
            }
            return result;
        }

        return this._getRunningEvent(eventName).listeners();
    }

    removeAllListeners(eventName?: EventFilter | string): this {
        if (!this.provider) { return this; }

        if (eventName == null) {
            for (const tag in this._runningEvents) {
                const runningEvent = this._runningEvents[tag];
                runningEvent.removeAllListeners();
                this._checkRunningEvents(runningEvent);
            }
            return this;
        }

        // Delete any listeners
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeAllListeners();
        this._checkRunningEvents(runningEvent);

        return this;
    }

    off(eventName: EventFilter | string, listener: Listener): this {
        if (!this.provider) { return this; }
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeListener(listener);
        this._checkRunningEvents(runningEvent);
        return this;
    }

    removeListener(eventName: EventFilter | string, listener: Listener): this {
        return this.off(eventName, listener);
    }

}

```
