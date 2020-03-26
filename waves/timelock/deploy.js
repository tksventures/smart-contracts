const fs = require('fs');
// 7N8pvtrndGbdWsaPbyULRa7g3ESn21aayVvsz3Q3VVj4
const seeds = {
  script: "waves tokes timelock staking dapp test one",
  testRich: "waves private node seed with waves tokens",
  testIssuer: "issue some test tokens issue some test tokens",
  testOwner: "oblige digital primary kiwi decline leave column flag rookie notable enforce summer soul nasty find",
  testMisc: "misc handler misc handler misc handler misc handler",
  main: "mv tokes test token snapshot and distribution"
}
const addresses = {
  owner: address(seeds.main) //"3P584kq8D4QKJSPyqzdV3YeGzYLivyNXFog",
}
let tokenAssetId = null;
const wvs = 10 ** 8;

async function loadTokenAssetId() {
  return new Promise((resolve) => {
    fs.readFile('asset.db', (er, data) => {
      if (er) { console.log(er); resolve(null); }
      resolve(data.toString());
    });
  })
}

async function init() {
  const script = compile(file('timelock.ride'));
  const ssTx = setScript({script}, seeds.script);

  try {
    const result = await broadcast(ssTx);
    const conf = await waitForTx(ssTx.id);
  
    console.log(result, conf);
  } catch (er) {
    console.log("ERROR!", er);
  }
}

async function setOwner(ownerAddress) {
  const changeOwner = data({
      data: [
          { key: "timelockOwner", value: ownerAddress }
      ],
      additionalFee: 0.004 * wvs
  }, seeds.script);

  const result = await broadcast(changeOwner);
  const conf = await waitForTx(changeOwner.id);

  console.log(result, conf);
}

async function depositFunds(assetId, amount, senderSeed) {
  const tx = invokeScript({
    dApp: address(seeds.script),
    call: { function: "deposit" },
    payment: [{assetId, amount}],
  }, senderSeed);


  const result = await broadcast(tx);
  const conf = await waitForTx(tx.id);

  console.log(result, conf);
}

async function withdrawFunds(amount, senderSeed = seeds.testOwner) {
  const tx = invokeScript({
    dApp: address(seeds.script),
    call: {
      function: "withdraw",
      args: [{type:'integer', value: 10000 * wvs}]
    },
  }, senderSeed);


  const result = await broadcast(tx);
  const conf = await waitForTx(tx.id);

  console.log(result, conf);
}

async function lockFunds(totalChunks, interval, initialDelay, seed = seeds.testOwner) {
  const tx = invokeScript({
    dApp: address(seeds.script),
    call: { 
        function: "timelock",
        args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval },
            { type: 'integer', value: initialDelay }
        ]
    },
  }, seed);

  const result = await broadcast(tx);
  const conf = await waitForTx(tx.id);

  console.log(result, conf);
}

async function transferToken(assetId, amount, seed, senderSeed = seeds.testIssuer) {
  const tx = transfer({
    recipient: address(seed),
    amount,
    assetId,
    fee: senderSeed === seeds.script ? 0.005 * wvs : 0.001 * wvs,
  }, senderSeed);

  const result = await broadcast(tx);
  const conf = await waitForTx(tx.id);

  console.log(result, conf);
}

async function run() {
  tokenAssetId = await loadTokenAssetId();
  console.log(`Asset Loaded: ${tokenAssetId}`);
  // await transferToken(null, 0.015 * wvs, seeds.script, seeds.main);
  // await init();
  // await setOwner(addresses.owner);
  // await transferToken(tokenAssetId, "10000000000000000", seeds.main, seeds.script);
  // await transferToken(tokenAssetId, 10000 * wvs, seeds.testOwner);
  // await depositFunds(tokenAssetId, "10000000000000000", seeds.main);
  // await lockFunds(24, 1440, 4320, seeds.main);
  await withdrawFunds(420, seeds.main);
}

run();