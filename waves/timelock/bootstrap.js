/*eslint-disable*/
const fs = require('fs');
const seeds = require('./seeds');

let tokenAssetId = null;
const wvs = 10 ** 8;

async function bootstrap() {
  for (let x in seeds){
    await fundSeed(seeds[x]);
  }
  tokenAssetId = await issueToken('Test Tokes', 100000 * wvs, seeds.testIssuer);
}

async function issueToken(name, quantity, seed) {
  const signedIssueTx = issue({
    name,
    quantity,
    description: 'test token',
  }, seed);
  const result = await broadcast(signedIssueTx);
  const conf = await waitForTx(signedIssueTx.id);

  console.log(result, conf);

  fs.writeFileSync('asset.db', signedIssueTx.id);
  return signedIssueTx.id;
}

async function fundSeed(seed) {
  const tx = transfer({
    recipient: address(seed),
    amount: 42 * wvs,
  }, seeds.testRich);

  const result = await broadcast(tx);
  const conf = await waitForTx(tx.id);

  console.log(result, conf);
}

async function run() {
  await bootstrap();
}

run();
