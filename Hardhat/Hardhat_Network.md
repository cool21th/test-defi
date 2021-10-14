## Mining Modes

Harhat network can be configured to automine blocks, immediately upon receiving each transaction, or it can be configured for interval mining, where a new block is mined periodically, incorporating as many pending transactions as possible.

You can use one of these modes, both or neither.
By default, only the automine mode is enabled.

When automine is disabled, every sent transaction is added to the mempool, which contains all the transactions that could be mined in the future.
Hardhat Network's mempool follows the same rules as geth. 
This means, among other things, that trasactions are prioritized by fees paid to the miner (and then by arrival time), and that invalid transactions are dropped.
Pending transactions can be queried via the eth_getBlockByNumber RPC method(with "pending" as the block number argument), they can be removed using the hardhat_dropTransaction RPC method, and they can be replaced by submitting a new transaction with the same nonce but with a 10+% incr4ase in fees paid to the miner.

If neither mining mode is enabled, no new blocks will be mined, but you can manually mine new blocks using the evm_mine RPC method.

### Mempool behavior

When automine is disabled, every sent transaction is added to the mempool, which contains all the transactions that could be mined in the future.
Hardhat Network's mempool follows the same rules as geth.
- Transactions with a higher gas price as included first
- If two transcations can be included and both are offering the miner the same total fees, the one that was received first is included first
- If a transaction is invalid, the transaction is dropped.



## Harhat Network Reference

### Supported hardforks.

- byzantium
- constantinople
- petersburg
- istanbul
- muirFlacier
- london

### Config

Default 
