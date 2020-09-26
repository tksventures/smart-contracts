# Asset Time Lock
_Allows deposited funds to be locked up and released in chunks on a block schedule_

## Usage

1. Set the timelock script (`./ride/timelock.ride`) to an account. _see [SetScript Transaction](https://docs.wavesplatform.com/en/blockchain/transaction-type/set-script-transaction.html)_
2. With the dApp ready, you have a destination where you can deposit funds to that can be locked.
2. All deposited funds are returned to a single address, this address is derived from the `timelockOwner` data on the smart account, please set this to your desired **Address**. _see [Data Transaction](https://docs.wavesplatform.com/en/blockchain/transaction-type/data-transaction.html)_
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

_Unlike most testing suites, the timelock test suite waits for blocks to elapse in real-time.. Mocked functions/values were avoided to keep all transactions included in the unit tests as explorable on-chain data.
The unit tests will connect to a local node running on the machine (where the dApp was deployed) to check block height as needed._

- run `surfboard test` from the `timelock` directory

#### Testing with Timelock Utility

_Dependencies_:
- [surfboard](https://www.npmjs.com/package/@waves/surfboard)
- [waves-private-node](https://hub.docker.com/r/wavesplatform/waves-private-node)
- [http-server](https://www.npmjs.com/package/http-server)
- [Waves Keeper](https://docs.waves.tech/en/ecosystem/waves-keeper/getting-started-with-keeper)

- Activate your private local node
- From the `timelock` directory:
  - bootstrap accounts with `surfboard run bootstrap`
  - copy the generated Asset ID from the `asset.db` file
  - in `timelock.ride`, update this line with your Asset ID: `let assetId = base58'<GENERATED_ASSET_ID>'`
  - deploy the dapp with `surfboard run deploy`
  - run `http-server` and open the generated link
- Unlock Waves Keeper
- Input the deployed Dapp Address and Asset ID
- Test!

## Credits

**Thank you to the [Waves Team](https://wavesplatform.org) for providing a sophisticated and elegant toolset for DeFi**

**Thank you to [Multichain Ventures, Inc.](https://multichain.ventures) for providing guidance and capital for progressive blockchain projects**
