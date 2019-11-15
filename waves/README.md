# Asset Time Lock
_Allows deposited funds to be locked up and released in chunks on a time schedule_

## Usage

1. Set this script to a newly generated account _see [SetScript Transaction](https://docs.wavesplatform.com/en/blockchain/transaction-type/set-script-transaction.html)_
2. You can change the owner by updating the `timelockOwner` data on the smart account to your desired **Address**
3. Once everything is set, call the `deposit` function to add funds you intend to lock up (ensure the predefined `assetId` corresponds to the asset being deposited)
4. With all the funds in place, you may now call the `timelock` function, which will irreversibly lock the funds and begin the release schedule
5. Unlocked funds can be retrieved by calling the `withdraw` function

#### Timing

The `timelock` function operates in block time and requires 3 parameters defined:
| Argument | Description |
| --- | --- |
| `totalChunks`: **Int** | The amount of separate releases the funds should be split into |
| `interval`: **Int** | The amount of blocks between each release  |
| `initialDelay`: **Int** | The amount of blocks to wait before starting the release schedule |

## Testing

_Dependencies_:
- [surfboard](https://www.npmjs.com/package/@waves/surfboard)
- [waves-private-node](https://hub.docker.com/r/wavesplatform/waves-private-node)

Unlike most testing suites, the timelock test suite waits for blocks to elapse in real-time.. Mocked functions/values were avoided to keep all transactions included in the unit tests as explorable on-chain data.
The unit tests will connect to a local node running on the machine (where the dApp was deployed) to check block height as needed.

## Credits

**Thank you to the [Waves Team](https://wavesplatform.org) for providing a sophisticated and elegant toolset for DeFi**

**Thank you to [Multichain Ventures, Inc.](https://multichain.ventures) for providing guidance and capital for progressive blockchain projects**
