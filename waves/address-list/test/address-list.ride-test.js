/* eslint-disable */
const { accountData } = require('./localNode');
const wvs = 10 ** 8;

describe('Address List test suite', async function () {
  before(async () => {
    await setupAccounts({
      external: 42 * wvs,
      script: 42 * wvs,
      owner: 42 * wvs,
    });

    const script = compile(file('address-list.ride'));
    const ssTx = setScript({ script }, accounts.script);
    await broadcast(ssTx);
    await waitForTx(ssTx.id);
    console.log('Script has been set');
  });

  describe('Registration', () => {
    it('should register the user with a boolean value specified', async () => {
      const registerParams = {
        dApp: address(accounts.script),
        call: {
          function: 'register',
          args: [
            { type: 'boolean', value: true },
          ],
        },
      };

      const registerTx = invokeScript(registerParams, accounts.external);

      await broadcast(registerTx);
      const registerResult = await waitForTx(registerTx.id);

      expect(registerResult.applicationStatus).to.equal('succeeded');

      const registerVal = await accountData(
        address(accounts.script),
        address(accounts.external),
      );

      expect(registerVal).to.equal(true);
    });

    it('should reject when trying to apply the same registration state', async () => {
      const registerParams = {
        dApp: address(accounts.script),
        call: {
          function: 'register',
          args: [
            { type: 'boolean', value: true },
          ],
        },
      };

      const registerTx = invokeScript(registerParams, accounts.external);

      const redundancyDetectededMessage = "Registration redundancy detected";

      await expect(broadcast(registerTx)).to.be.rejectedWith(redundancyDetectededMessage)
    });

    it('should unregister accounts', async () => {
      const unregisterParams = {
        dApp: address(accounts.script),
        call: {
          function: 'register',
          args: [
            { type: 'boolean', value: false },
          ],
        },
      };

      const unregisterTx = invokeScript(unregisterParams, accounts.external);

      await broadcast(unregisterTx);
      const registerResult = await waitForTx(unregisterTx.id);

      expect(registerResult.applicationStatus).to.equal('succeeded');

      const registerVal = await accountData(
        address(accounts.script),
        address(accounts.external),
      );

      expect(registerVal).to.equal(false);
    });
  });
});
