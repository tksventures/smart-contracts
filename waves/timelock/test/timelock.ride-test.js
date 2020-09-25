const { height, waitUntilBlock, accountData } = require('./localNode');

const wvs = 10 ** 8;

describe('Timelock test suite', async function () {
  let lockBlock = 0;
  const totalChunks = 4;
  const interval = 2;
  const initialDelay = 2;

  this.timeout((totalChunks + interval + initialDelay) * 21000);

  before(async () => {
    await setupAccounts({
      external: 42 * wvs,
      script: 42 * wvs,
      owner: 42 * wvs,
    });

    const script = compile(file('timelock.ride'));
    const ssTx = setScript({ script }, accounts.script);
    await broadcast(ssTx);
    await waitForTx(ssTx.id);
    console.log('Script has been set');
  });

  describe('Permissions and unlocked state', () => {
    it('should only allow owner to timelock', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: 21 },
            { type: 'integer', value: 2 },
            { type: 'integer', value: 0 },
          ],
        },
      };

      const accessDeniedMessage = 'Only the timelock owner can call this function';

      const accessDeniedTimelock = invokeScript(timelockTxParams, accounts.owner);

      await expect(broadcast(accessDeniedTimelock)).to.be.rejectedWith(accessDeniedMessage);

      const changeOwner = data({
        data: [
          { key: 'timelockOwner', value: address(accounts.owner) },
        ],
        additionalFee: 0.004 * wvs,
      }, accounts.script);

      await broadcast(changeOwner);
      await waitForTx(changeOwner.id);

      const passesOwnerCheck = invokeScript(timelockTxParams, accounts.owner);

      await expect(broadcast(passesOwnerCheck)).not.to.be.rejectedWith(accessDeniedMessage);
    });

    it('should deposit', async () => {
      const tx = invokeScript({
        dApp: address(accounts.script),
        call: { function: 'deposit' },
        payment: [{ assetId: null, amount: 21 * wvs }],
      }, accounts.owner);


      await broadcast(tx);
      await waitForTx(tx.id);
    });

    it('should prevent a withdrawal for more than was deposited', async () => {
      const withdraw = invokeScript({
        dApp: address(accounts.script),
        call: {
          function: 'withdraw',
          args: [{ type: 'integer', value: 42 * wvs }],
        },

      }, accounts.owner);

      expect(broadcast(withdraw)).to.be.rejectedWith('Not enough balance');
    });

    it('should withdraw', async () => {
      const withdraw = invokeScript({
        dApp: address(accounts.script),
        call: {
          function: 'withdraw',
          args: [{ type: 'integer', value: 0.9 * wvs }],
        },

      }, accounts.owner);
      await broadcast(withdraw);
    });
  });

  describe('Locked state and time management', async () => {
    it('should prevent locking funds until waves moons', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval * 4 ** 20 },
            { type: 'integer', value: initialDelay },
          ],
        },
      };

      const timelock = invokeScript(timelockTxParams, accounts.owner);
      expect(broadcast(timelock)).to.be.rejectedWith('This contract has an upper limit of 5 years that funds can be locked');
    });

    it('should lock the funds', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval },
            { type: 'integer', value: initialDelay },
          ],
        },
      };
      const timelock = invokeScript(timelockTxParams, accounts.owner);

      await broadcast(timelock);
      await waitForTx(timelock.id);

      lockBlock = await height();
    });

    it('should prevent locking while in a locked state', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval },
            { type: 'integer', value: initialDelay },
          ],
        },
      };
      const timelock = invokeScript(timelockTxParams, accounts.owner);
      expect(broadcast(timelock)).to.be.rejectedWith('Lock already in place');
    });

    it('should prevent withdrawals until some funds are unlocked', async () => {
      const withdraw = invokeScript({
        dApp: address(accounts.script),
        call: {
          function: 'withdraw',
          args: [{ type: 'integer', value: 42 * wvs }],
        },

      }, accounts.owner);

      expect(broadcast(withdraw)).to.be.rejectedWith('All funds are currently locked');
    });

    it('should withdraw only unlocked funds', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval },
            { type: 'integer', value: initialDelay },
          ],
        },
      };

      const withdrawParams = {
        dApp: address(accounts.script),
        call: {
          function: 'withdraw',
          args: [{ type: 'integer', value: 42 * wvs }],
        },

      };

      const earlyWithdraw = invokeScript(withdrawParams, accounts.owner);
      await expect(broadcast(earlyWithdraw)).to.be.rejectedWith('All funds are currently locked');

      await waitUntilBlock(lockBlock + interval + initialDelay);

      const untappedWithdraw = invokeScript(withdrawParams, accounts.owner);

      await broadcast(untappedWithdraw);
      await waitForTx(untappedWithdraw.id);

      const exhaustedWithdraw = invokeScript(withdrawParams, accounts.owner);
      await expect(broadcast(exhaustedWithdraw)).to.be.rejectedWith('All funds are currently locked');

      const timelock = invokeScript(timelockTxParams, accounts.owner);
      expect(broadcast(timelock)).to.be.rejectedWith('Lock already in place');
    });

    it('should unlock after designated time', async () => {
      const timelockTxParams = {
        dApp: address(accounts.script),
        call: {
          function: 'timelock',
          args: [
            { type: 'integer', value: totalChunks },
            { type: 'integer', value: interval },
            { type: 'integer', value: initialDelay },
          ],
        },
      };

      const withdrawParams = {
        dApp: address(accounts.script),
        call: {
          function: 'withdraw',
          args: [{ type: 'integer', value: 42 * wvs }],
        },

      };

      await waitUntilBlock(lockBlock + (interval * totalChunks) + initialDelay);

      const finalWithdrawal = invokeScript(withdrawParams, accounts.owner);

      await broadcast(finalWithdrawal);
      await waitForTx(finalWithdrawal.id);

      const lockedVal = await accountData(
        address(accounts.script),
        'locked',
      );

      expect(lockedVal).to.equal(false);

      const exhaustedWithdraw = invokeScript(withdrawParams, accounts.owner);
      await expect(broadcast(exhaustedWithdraw)).to.be.rejectedWith('Not enough balance');

      const timelock = invokeScript(timelockTxParams, accounts.owner);
      expect(broadcast(timelock)).to.be.rejectedWith('There are not enough funds to lock');
    });
  });
});
